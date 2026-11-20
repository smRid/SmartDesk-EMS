"use server";

import { randomUUID } from "node:crypto";
import { compare, hash } from "bcrypt";
import { and, count, desc, eq, gte, inArray, isNull, lte, ne, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  auditLogs,
  attendanceAdjustments,
  attendanceEvents,
  attendanceRecords,
  departments,
  employees,
  holidayCalendar,
  leaveApprovalHistory,
  leaveLedger,
  leavePolicies,
  leaveRequests,
  salaries,
  shiftAssignments,
  users,
  workShifts,
} from "@/db/schema";
import { createSession, destroySession, requireAuth } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { clearRateLimit, checkRateLimit } from "@/lib/rate-limit";
import {
  adminProfileSchema,
  attendanceCorrectionSchema,
  attendancePunchSchema,
  changePasswordSchema,
  departmentSchema,
  employeeCreateSchema,
  employeeProfileSchema,
  employeeUpdateSchema,
  leaveRequestSchema,
  loginSchema,
  salarySchema,
  shiftAssignmentSchema,
  workShiftSchema,
  type AdminProfileInput,
  type ChangePasswordInput,
  type DepartmentInput,
  type LeaveRequestInput,
  type LoginInput,
  type SalaryInput,
} from "@/lib/validations";
import { calculateLeaveDays } from "@/lib/utils";
import { canRequestLeave, countChargeableLeaveDays, getLeaveCycle } from "@/lib/leave-accounting";
import { calculateLateMinutes, calculateWorkedMinutes, isEligibleForAttendance, ownsAttendanceRecord, resolveShiftWorkDate } from "@/lib/attendance";
import { calculateSalaryTotal } from "@/lib/payroll";

type ActionResult = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  redirectTo?: string;
  status: "error" | "success";
};

const success = (message: string, redirectTo?: string): ActionResult => ({
  message,
  redirectTo,
  status: "success",
});

const failure = (
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ActionResult => ({
  fieldErrors,
  message,
  status: "error",
});

const getValue = (formData: FormData, key: string) =>
  `${formData.get(key) ?? ""}`.trim();

async function writeAuditLog(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  detailsJson?: Record<string, unknown>,
) {
  await db.insert(auditLogs).values({
    action,
    actorUserId,
    detailsJson: detailsJson ?? null,
    entityId,
    entityType,
  });
}

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return failure("Please fix the highlighted login fields.", parsed.error.flatten().fieldErrors);
  }

  const email = parsed.data.email.toLowerCase();
  const headerStore = await headers();
  const limitKey = `${headerStore.get("x-forwarded-for") ?? "local"}:${email}`;
  const rate = checkRateLimit(limitKey);

  if (!rate.allowed) {
    return failure(`Too many login attempts. Try again in ${rate.retryAfter} seconds.`);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !user.isActive) {
    return failure("Invalid email or password.");
  }

  const isValidPassword = await compare(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    return failure("Invalid email or password.");
  }

  clearRateLimit(limitKey);
  await createSession({ id: user.id, role: user.role });

  return success(
    "Signed in successfully.",
    user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard",
  );
}

export async function logoutAction(): Promise<ActionResult> {
  await destroySession();
  return success("Signed out successfully.", "/login");
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return failure("Please correct the password fields.", parsed.error.flatten().fieldErrors);
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user) {
    return failure("User account was not found.");
  }

  const matches = await compare(parsed.data.oldPassword, user.passwordHash);
  if (!matches) {
    return failure("Old password is incorrect.", {
      oldPassword: ["Old password is incorrect."],
    });
  }

  await db
    .update(users)
    .set({
      passwordHash: await hash(parsed.data.newPassword, 10),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.id));

  await writeAuditLog(session.id, "password.changed", "user", session.id);

  return success("Password changed successfully.");
}

export async function updateAdminProfileAction(
  input: AdminProfileInput,
): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const parsed = adminProfileSchema.safeParse(input);

  if (!parsed.success) {
    return failure("Please correct the profile details.", parsed.error.flatten().fieldErrors);
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, parsed.data.email.toLowerCase()), ne(users.id, session.id)))
    .limit(1);

  if (existing) {
    return failure("That email is already in use.", {
      email: ["That email is already in use."],
    });
  }

  await db
    .update(users)
    .set({
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.id));

  revalidatePath("/admin/settings");
  await writeAuditLog(session.id, "admin.profile.updated", "user", session.id);

  return success("Admin profile updated.");
}

export async function updateEmployeeProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAuth("employee");

  if (!session.employeeRecordId) {
    return failure("Employee profile is missing.");
  }

  const parsed = employeeProfileSchema.safeParse({
    address: getValue(formData, "address"),
    maritalStatus: getValue(formData, "maritalStatus"),
    name: getValue(formData, "name"),
    phone: getValue(formData, "phone"),
  });

  if (!parsed.success) {
    return failure("Please correct the profile details.", parsed.error.flatten().fieldErrors);
  }

  const [record] = await db
    .select({
      employeeId: employees.id,
      publicId: employees.cloudinaryPublicId,
      userId: users.id,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .where(eq(employees.id, session.employeeRecordId))
    .limit(1);

  if (!record) {
    return failure("Employee profile was not found.");
  }

  const imageFile = formData.get("image");
  let uploadedImage: { publicId: string; url: string } | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    uploadedImage = await uploadImage(imageFile);
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, record.userId));

  await db
    .update(employees)
    .set({
      address: parsed.data.address,
      cloudinaryPublicId: uploadedImage?.publicId ?? undefined,
      imageUrl: uploadedImage?.url ?? undefined,
      maritalStatus: parsed.data.maritalStatus,
      phone: parsed.data.phone,
      updatedAt: new Date(),
    })
    .where(eq(employees.id, record.employeeId));

  if (uploadedImage && record.publicId) {
    await deleteImage(record.publicId);
  }

  revalidatePath("/employee/profile");
  revalidatePath("/employee/dashboard");
  await writeAuditLog(session.id, "employee.profile.updated", "employee", session.employeeRecordId);

  return success("Profile updated successfully.");
}

export async function createDepartmentAction(
  input: DepartmentInput,
): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const parsed = departmentSchema.safeParse(input);

  if (!parsed.success) {
    return failure("Please correct the department details.", parsed.error.flatten().fieldErrors);
  }

  const [existing] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.name, parsed.data.name))
    .limit(1);

  if (existing) {
    return failure("Department name must be unique.", {
      name: ["Department name must be unique."],
    });
  }

  const [department] = await db
    .insert(departments)
    .values(parsed.data)
    .returning({ id: departments.id });

  revalidatePath("/admin/departments");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "department.created", "department", department.id);

  return success("Department added successfully.", "/admin/departments");
}

export async function updateDepartmentAction(
  departmentId: string,
  input: DepartmentInput,
): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const parsed = departmentSchema.safeParse(input);

  if (!parsed.success) {
    return failure("Please correct the department details.", parsed.error.flatten().fieldErrors);
  }

  const [existing] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(and(eq(departments.name, parsed.data.name), ne(departments.id, departmentId)))
    .limit(1);

  if (existing) {
    return failure("Department name must be unique.", {
      name: ["Department name must be unique."],
    });
  }

  await db
    .update(departments)
    .set({
      description: parsed.data.description,
      name: parsed.data.name,
      updatedAt: new Date(),
    })
    .where(eq(departments.id, departmentId));

  revalidatePath("/admin/departments");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "department.updated", "department", departmentId);

  return success("Department updated successfully.", "/admin/departments");
}

export async function deleteDepartmentAction(
  departmentId: string,
): Promise<ActionResult> {
  const session = await requireAuth("admin");

  const linkedEmployee = await db
    .select({ id: employees.id })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .where(and(eq(employees.departmentId, departmentId), eq(users.isActive, true)))
    .limit(1);

  if (linkedEmployee[0]) {
    return failure("Reassign active employees before deleting this department.");
  }

  await db.delete(departments).where(eq(departments.id, departmentId));

  revalidatePath("/admin/departments");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "department.deleted", "department", departmentId);

  return success("Department deleted successfully.");
}

export async function createEmployeeAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("admin");

  const parsed = employeeCreateSchema.safeParse({
    address: getValue(formData, "address"),
    baseSalary: getValue(formData, "baseSalary"),
    departmentId: getValue(formData, "departmentId"),
    designation: getValue(formData, "designation"),
    dob: getValue(formData, "dob"),
    email: getValue(formData, "email").toLowerCase(),
    employeeId: getValue(formData, "employeeId"),
    gender: getValue(formData, "gender"),
    joiningDate: getValue(formData, "joiningDate"),
    maritalStatus: getValue(formData, "maritalStatus"),
    name: getValue(formData, "name"),
    password: getValue(formData, "password"),
    phone: getValue(formData, "phone"),
    role: getValue(formData, "role"),
    status: getValue(formData, "status"),
  });

  if (!parsed.success) {
    return failure("Please correct the employee details.", parsed.error.flatten().fieldErrors);
  }

  const [existingUser, existingEmployee] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1),
    db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.employeeId, parsed.data.employeeId))
      .limit(1),
  ]);

  if (existingUser[0]) {
    return failure("Email must be unique.", { email: ["Email must be unique."] });
  }

  if (existingEmployee[0]) {
    return failure("Employee ID must be unique.", {
      employeeId: ["Employee ID must be unique."],
    });
  }

  const imageFile = formData.get("image");
  const uploadedImage =
    imageFile instanceof File && imageFile.size > 0 ? await uploadImage(imageFile) : null;

  const [createdUser] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      employeeId: parsed.data.employeeId,
      isActive: parsed.data.status !== "inactive",
      name: parsed.data.name,
      passwordHash: await hash(parsed.data.password, 10),
      role: parsed.data.role,
    })
    .returning({ id: users.id });

  const [createdEmployee] = await db
    .insert(employees)
    .values({
      address: parsed.data.address,
      baseSalary: parsed.data.baseSalary,
      cloudinaryPublicId: uploadedImage?.publicId,
      departmentId: parsed.data.departmentId,
      designation: parsed.data.designation,
      dob: parsed.data.dob,
      employeeId: parsed.data.employeeId,
      gender: parsed.data.gender,
      imageUrl: uploadedImage?.url,
      joiningDate: parsed.data.joiningDate,
      maritalStatus: parsed.data.maritalStatus,
      phone: parsed.data.phone,
      status: parsed.data.status,
      userId: createdUser.id,
    })
    .returning({ id: employees.id });

  revalidatePath("/admin/employees");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "employee.created", "employee", createdEmployee.id);

  return success("Employee added successfully.", `/admin/employees/${createdEmployee.id}`);
}

export async function updateEmployeeAction(
  employeeRecordId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAuth("admin");

  const parsed = employeeUpdateSchema.safeParse({
    address: getValue(formData, "address"),
    baseSalary: getValue(formData, "baseSalary"),
    departmentId: getValue(formData, "departmentId"),
    designation: getValue(formData, "designation"),
    dob: getValue(formData, "dob"),
    email: getValue(formData, "email").toLowerCase(),
    employeeId: getValue(formData, "employeeId"),
    gender: getValue(formData, "gender"),
    joiningDate: getValue(formData, "joiningDate"),
    maritalStatus: getValue(formData, "maritalStatus"),
    name: getValue(formData, "name"),
    phone: getValue(formData, "phone"),
    role: getValue(formData, "role"),
    status: getValue(formData, "status"),
  });

  if (!parsed.success) {
    return failure("Please correct the employee details.", parsed.error.flatten().fieldErrors);
  }

  const [record] = await db
    .select({
      employeeId: employees.id,
      publicId: employees.cloudinaryPublicId,
      userId: users.id,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .where(eq(employees.id, employeeRecordId))
    .limit(1);

  if (!record) {
    return failure("Employee record was not found.");
  }

  if (record.userId === session.id && parsed.data.status === "inactive") {
    return failure("You cannot deactivate your own account from this screen.", {
      status: ["Choose active or on leave for your own account."],
    });
  }

  const [emailTaken, employeeIdTaken] = await Promise.all([
    db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, parsed.data.email), ne(users.id, record.userId)))
      .limit(1),
    db
      .select({ id: employees.id })
      .from(employees)
      .where(and(eq(employees.employeeId, parsed.data.employeeId), ne(employees.id, employeeRecordId)))
      .limit(1),
  ]);

  if (emailTaken[0]) {
    return failure("Email must be unique.", { email: ["Email must be unique."] });
  }

  if (employeeIdTaken[0]) {
    return failure("Employee ID must be unique.", {
      employeeId: ["Employee ID must be unique."],
    });
  }

  const imageFile = formData.get("image");
  const uploadedImage =
    imageFile instanceof File && imageFile.size > 0 ? await uploadImage(imageFile) : null;

  await db
    .update(users)
    .set({
      email: parsed.data.email,
      employeeId: parsed.data.employeeId,
      isActive: parsed.data.status !== "inactive",
      name: parsed.data.name,
      role: parsed.data.role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, record.userId));

  await db
    .update(employees)
    .set({
      address: parsed.data.address,
      baseSalary: parsed.data.baseSalary,
      cloudinaryPublicId: uploadedImage?.publicId ?? undefined,
      departmentId: parsed.data.departmentId,
      designation: parsed.data.designation,
      dob: parsed.data.dob,
      employeeId: parsed.data.employeeId,
      gender: parsed.data.gender,
      imageUrl: uploadedImage?.url ?? undefined,
      joiningDate: parsed.data.joiningDate,
      maritalStatus: parsed.data.maritalStatus,
      phone: parsed.data.phone,
      status: parsed.data.status,
      updatedAt: new Date(),
    })
    .where(eq(employees.id, employeeRecordId));

  if (uploadedImage && record.publicId) {
    await deleteImage(record.publicId);
  }

  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${employeeRecordId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/profile");
  await writeAuditLog(session.id, "employee.updated", "employee", employeeRecordId);

  return success("Employee updated successfully.", `/admin/employees/${employeeRecordId}`);
}

export async function deleteEmployeeAction(
  employeeRecordId: string,
): Promise<ActionResult> {
  const session = await requireAuth("admin");

  const [record] = await db
    .select({
      employeeId: employees.id,
      userId: users.id,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .where(eq(employees.id, employeeRecordId))
    .limit(1);

  if (!record) {
    return failure("Employee record was not found.");
  }

  if (record.userId === session.id) {
    return failure("You cannot deactivate your own account from this screen.");
  }

  await db
    .update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, record.userId));

  await db
    .update(employees)
    .set({
      status: "inactive",
      updatedAt: new Date(),
    })
    .where(eq(employees.id, employeeRecordId));

  revalidatePath("/admin/employees");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "employee.deactivated", "employee", employeeRecordId);

  return success("Employee deactivated successfully.");
}

export async function reactivateEmployeeAction(
  employeeRecordId: string,
): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const [record] = await db.select({ userId: employees.userId })
    .from(employees)
    .where(eq(employees.id, employeeRecordId))
    .limit(1);

  if (!record) return failure("Employee record was not found.");

  await db.update(users).set({ isActive: true, updatedAt: new Date() })
    .where(eq(users.id, record.userId));
  await db.update(employees).set({ status: "active", updatedAt: new Date() })
    .where(eq(employees.id, employeeRecordId));

  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${employeeRecordId}`);
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "employee.reactivated", "employee", employeeRecordId);
  return success("Employee reactivated successfully.");
}

export async function createLeaveRequestAction(
  input: LeaveRequestInput,
): Promise<ActionResult> {
  const session = await requireAuth("employee");

  if (!session.employeeRecordId) {
    return failure("Employee profile is missing.");
  }

  const parsed = leaveRequestSchema.safeParse(input);
  if (!parsed.success) {
    return failure("Please correct the leave details.", parsed.error.flatten().fieldErrors);
  }

  const [[employee], [policy], holidays, [overlap]] = await Promise.all([
    db.select({ joiningDate: employees.joiningDate, status: employees.status, userActive: users.isActive })
      .from(employees).innerJoin(users, eq(users.id, employees.userId))
      .where(eq(employees.id, session.employeeRecordId)).limit(1),
    db.select().from(leavePolicies)
      .where(and(eq(leavePolicies.leaveType, parsed.data.leaveType), eq(leavePolicies.isActive, true))).limit(1),
    db.select({ date: holidayCalendar.holidayDate }).from(holidayCalendar)
      .where(and(eq(holidayCalendar.isActive, true), gte(holidayCalendar.holidayDate, parsed.data.startDate), lte(holidayCalendar.holidayDate, parsed.data.endDate))),
    db.select({ id: leaveRequests.id }).from(leaveRequests)
      .where(and(
        eq(leaveRequests.employeeId, session.employeeRecordId),
        inArray(leaveRequests.status, ["pending", "approved"]),
        lte(leaveRequests.startDate, parsed.data.endDate),
        gte(leaveRequests.endDate, parsed.data.startDate),
      )).limit(1),
  ]);
  if (!employee || !canRequestLeave(employee.userActive, employee.status)) return failure("Inactive employees cannot request leave.");
  if (!policy) return failure("This leave type does not have an active policy. Contact HR.");
  if (overlap) return failure("This request overlaps an existing pending or approved request.");
  if (parsed.data.dayFraction === 0.5 && !policy.allowHalfDay) return failure("Half-day requests are not enabled for this leave type.");

  let chargeDays: number;
  try {
    chargeDays = countChargeableLeaveDays({
      dayFraction: parsed.data.dayFraction,
      endDate: parsed.data.endDate,
      holidays: holidays.map((item) => item.date),
      policy,
      startDate: parsed.data.startDate,
    });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "The leave dates are invalid.");
  }
  if (chargeDays <= 0) return failure("The selected range contains no working days.");
  const cycle = getLeaveCycle(parsed.data.startDate, employee.joiningDate, policy.cycleType);
  const [balanceRow] = await db.select({ entries: count(), value: sum(leaveLedger.amount) }).from(leaveLedger)
    .where(and(
      eq(leaveLedger.employeeId, session.employeeRecordId),
      eq(leaveLedger.leaveType, parsed.data.leaveType),
      eq(leaveLedger.cycleStart, cycle.start),
    ));
  if (!balanceRow?.entries) {
    await db.insert(leaveLedger).values({
      amount: policy.annualEntitlement,
      createdBy: session.id,
      cycleEnd: cycle.end,
      cycleStart: cycle.start,
      employeeId: session.employeeRecordId,
      eventKey: `entitlement:${session.employeeRecordId}:${parsed.data.leaveType}:${cycle.start}`,
      eventType: "grant",
      leaveType: parsed.data.leaveType,
      note: "Automatic policy entitlement grant",
    }).onConflictDoNothing();
  }
  const available = Number(balanceRow?.entries ? balanceRow.value : policy.annualEntitlement);
  if (available < chargeDays) return failure(`Insufficient balance. ${available} day(s) are available.`);

  const totalDays = calculateLeaveDays(parsed.data.startDate, parsed.data.endDate);

  const leaveId = randomUUID();
  const createRequest = db.insert(leaveRequests)
    .values({
      id: leaveId,
      employeeId: session.employeeRecordId,
      chargeDays,
      cycleEnd: cycle.end,
      cycleStart: cycle.start,
      dayFraction: parsed.data.dayFraction,
      endDate: parsed.data.endDate,
      leaveType: parsed.data.leaveType,
      reason: parsed.data.reason,
      startDate: parsed.data.startDate,
      status: "pending",
      totalDays,
    });
  if (policy.reservePending) {
    const reserve = db.insert(leaveLedger).values({
      amount: -chargeDays,
      createdBy: session.id,
      cycleEnd: cycle.end,
      cycleStart: cycle.start,
      employeeId: session.employeeRecordId,
      eventKey: `request:${leaveId}:reserve`,
      eventType: "reserve",
      leaveType: parsed.data.leaveType,
      requestId: leaveId,
    });
    await db.batch([createRequest, reserve]);
  } else await createRequest;

  revalidatePath("/employee/leave");
  revalidatePath("/employee/dashboard");
  revalidatePath("/admin/leaves");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "leave.created", "leave_request", leaveId);

  return success("Leave request submitted successfully.", "/employee/leave");
}

export async function reviewLeaveRequestAction(input: {
  adminNote?: string;
  exceptionApproved?: boolean;
  leaveId: string;
  status: "approved" | "rejected";
}): Promise<ActionResult> {
  const session = await requireAuth("admin");

  const [record] = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.id, input.leaveId))
    .limit(1);

  if (!record) {
    return failure("Leave request was not found.");
  }

  if (record.status !== "pending") {
    return failure("This leave request has already been reviewed.");
  }
  const [policy] = await db.select().from(leavePolicies).where(eq(leavePolicies.leaveType, record.leaveType)).limit(1);
  if (input.exceptionApproved && !policy?.allowNegativeWithApproval) {
    return failure("Exception approval is not enabled for this leave policy.");
  }
  if (input.status === "approved" && !policy?.reservePending && record.cycleStart && record.chargeDays) {
    const [balance] = await db.select({ value: sum(leaveLedger.amount) }).from(leaveLedger).where(and(
      eq(leaveLedger.employeeId, record.employeeId),
      eq(leaveLedger.leaveType, record.leaveType),
      eq(leaveLedger.cycleStart, record.cycleStart),
    ));
    if (Number(balance?.value ?? 0) < record.chargeDays && !input.exceptionApproved) {
      return failure("Insufficient balance. Enable a permitted exception or reject the request.");
    }
  }

  const updateDecision = db.update(leaveRequests)
    .set({
      adminNote: input.adminNote?.trim() || null,
      reviewedAt: new Date(),
      reviewedBy: session.id,
      exceptionApproved: Boolean(input.exceptionApproved),
      status: input.status,
      updatedAt: new Date(),
    })
    .where(and(eq(leaveRequests.id, input.leaveId), eq(leaveRequests.status, "pending")));

  const entries = [];
  if (record.cycleStart && record.cycleEnd && record.chargeDays) {
    if (policy?.reservePending) {
      entries.push({
        amount: record.chargeDays,
        createdBy: session.id,
        cycleEnd: record.cycleEnd,
        cycleStart: record.cycleStart,
        employeeId: record.employeeId,
        eventKey: `request:${record.id}:release`,
        eventType: "release" as const,
        leaveType: record.leaveType,
        requestId: record.id,
      });
    }
    if (input.status === "approved") {
      entries.push({
        amount: -record.chargeDays,
        createdBy: session.id,
        cycleEnd: record.cycleEnd,
        cycleStart: record.cycleStart,
        employeeId: record.employeeId,
        eventKey: `request:${record.id}:consume`,
        eventType: "consume" as const,
        leaveType: record.leaveType,
        requestId: record.id,
      });
    }
  }
  const writeHistory = db.insert(leaveApprovalHistory).values({
    actorUserId: session.id,
    exceptionApproved: Boolean(input.exceptionApproved),
    fromStatus: "pending",
    note: input.adminNote?.trim() || null,
    requestId: input.leaveId,
    toStatus: input.status,
  }).onConflictDoNothing();
  if (entries.length) {
    await db.batch([updateDecision, db.insert(leaveLedger).values(entries).onConflictDoNothing(), writeHistory]);
  } else {
    await db.batch([updateDecision, writeHistory]);
  }

  revalidatePath("/admin/leaves");
  revalidatePath(`/admin/leaves/${input.leaveId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/leave");
  revalidatePath("/employee/dashboard");
  await writeAuditLog(session.id, `leave.${input.status}`, "leave_request", input.leaveId);

  return success(`Leave request ${input.status}.`);
}

export async function cancelLeaveRequestAction(leaveId: string): Promise<ActionResult> {
  const session = await requireAuth("employee");
  if (!session.employeeRecordId) return failure("Employee profile is missing.");
  const [record] = await db.select().from(leaveRequests).where(and(
    eq(leaveRequests.id, leaveId),
    eq(leaveRequests.employeeId, session.employeeRecordId),
  )).limit(1);
  if (!record) return failure("Leave request was not found.");
  if (record.status !== "pending") return failure("Only pending requests can be cancelled.");
  const cancelRequest = db.update(leaveRequests).set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(leaveRequests.id, leaveId), eq(leaveRequests.status, "pending")));
  const [policy] = await db.select().from(leavePolicies).where(eq(leavePolicies.leaveType, record.leaveType)).limit(1);
  const cancelHistory = db.insert(leaveApprovalHistory).values({
    actorUserId: session.id,
    fromStatus: "pending",
    note: "Cancelled by employee",
    requestId: record.id,
    toStatus: "cancelled",
  }).onConflictDoNothing();
  if (policy?.reservePending && record.cycleStart && record.cycleEnd && record.chargeDays) {
    const release = db.insert(leaveLedger).values({
      amount: record.chargeDays,
      createdBy: session.id,
      cycleEnd: record.cycleEnd,
      cycleStart: record.cycleStart,
      employeeId: record.employeeId,
      eventKey: `request:${record.id}:cancel-release`,
      eventType: "release",
      leaveType: record.leaveType,
      requestId: record.id,
    }).onConflictDoNothing();
    await db.batch([cancelRequest, release, cancelHistory]);
  } else {
    await db.batch([cancelRequest, cancelHistory]);
  }
  revalidatePath("/employee/leave");
  revalidatePath("/admin/leaves");
  await writeAuditLog(session.id, "leave.cancelled", "leave_request", record.id);
  return success("Leave request cancelled.");
}

export async function updateLeavePolicyAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const leaveType = getValue(formData, "leaveType");
  if (!["casual", "sick", "annual", "emergency"].includes(leaveType)) return failure("Invalid leave type.");
  const entitlement = Number(getValue(formData, "annualEntitlement"));
  if (!Number.isFinite(entitlement) || entitlement < 0) return failure("Entitlement must be zero or greater.");
  await db.update(leavePolicies).set({
    allowHalfDay: formData.get("allowHalfDay") === "on",
    allowNegativeWithApproval: formData.get("allowNegativeWithApproval") === "on",
    annualEntitlement: entitlement,
    cycleType: getValue(formData, "cycleType") === "anniversary_year" ? "anniversary_year" : "calendar_year",
    excludeHolidays: formData.get("excludeHolidays") === "on",
    excludeWeekends: formData.get("excludeWeekends") === "on",
    isActive: formData.get("isActive") === "on",
    reservePending: formData.get("reservePending") === "on",
    updatedAt: new Date(),
  }).where(eq(leavePolicies.leaveType, leaveType as "casual"));
  revalidatePath("/admin/leaves/policies");
  await writeAuditLog(session.id, "leave_policy.updated", "leave_policy", leaveType);
  return success("Leave policy updated.");
}

export async function createHolidayAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const holidayDate = getValue(formData, "holidayDate");
  const name = getValue(formData, "name");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(holidayDate) || name.length < 2) return failure("Enter a valid holiday date and name.");
  await db.insert(holidayCalendar).values({ holidayDate, name }).onConflictDoUpdate({
    target: holidayCalendar.holidayDate,
    set: { isActive: true, name },
  });
  revalidatePath("/admin/leaves/policies");
  await writeAuditLog(session.id, "holiday.saved", "holiday", holidayDate);
  return success("Holiday saved.");
}

export async function createSalaryAction(input: SalaryInput): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const parsed = salarySchema.safeParse(input);

  if (!parsed.success) {
    return failure("Please correct the salary details.", parsed.error.flatten().fieldErrors);
  }

  const [employeeRecord] = await db
    .select({
      departmentId: employees.departmentId,
      id: employees.id,
    })
    .from(employees)
    .where(eq(employees.id, parsed.data.employeeId))
    .limit(1);

  if (!employeeRecord) {
    return failure("Selected employee was not found.");
  }

  if (employeeRecord.departmentId !== parsed.data.departmentId) {
    return failure("Selected employee does not belong to that department.");
  }

  const [duplicate] = await db.select({ id: salaries.id }).from(salaries).where(and(
    eq(salaries.employeeId, parsed.data.employeeId),
    eq(salaries.periodStart, parsed.data.periodStart),
    eq(salaries.periodEnd, parsed.data.periodEnd),
  )).limit(1);
  if (duplicate) return failure("A salary entry already exists for this employee and period.");

  const totalSalary = calculateSalaryTotal(parsed.data.basicSalary, parsed.data.allowance, parsed.data.deduction);

  const [salary] = await db
    .insert(salaries)
    .values({
      allowance: parsed.data.allowance,
      basicSalary: parsed.data.basicSalary,
      createdBy: session.id,
      deduction: parsed.data.deduction,
      departmentId: parsed.data.departmentId,
      employeeId: parsed.data.employeeId,
      payDate: parsed.data.payDate,
      periodEnd: parsed.data.periodEnd,
      periodStart: parsed.data.periodStart,
      status: "draft",
      totalSalary,
    })
    .returning({ id: salaries.id });

  revalidatePath("/admin/salary");
  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/salary");
  revalidatePath("/employee/dashboard");
  await writeAuditLog(session.id, "salary.created", "salary", salary.id);

  return success("Salary record saved successfully.", "/admin/salary");
}

export async function transitionSalaryAction(input: {
  salaryId: string;
  transition: "approve" | "finalize" | "pay";
}): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const [record] = await db.select().from(salaries).where(eq(salaries.id, input.salaryId)).limit(1);
  if (!record) return failure("Salary record was not found.");
  if (input.transition === "approve") {
    if (record.status !== "draft") return failure("Only draft entries can be approved.");
    if (record.createdBy === session.id) return failure("The entry creator cannot approve their own salary entry.");
    const [updated] = await db.update(salaries).set({ approvedAt: new Date(), approvedBy: session.id, status: "approved", updatedAt: new Date() })
      .where(and(eq(salaries.id, record.id), eq(salaries.status, "draft"))).returning({ id: salaries.id });
    if (!updated) return failure("Salary status changed. Refresh and try again.");
  } else if (input.transition === "finalize") {
    if (record.status !== "approved") return failure("Only approved entries can be finalized.");
    const [updated] = await db.update(salaries).set({ finalizedAt: new Date(), finalizedBy: session.id, status: "finalized", updatedAt: new Date() })
      .where(and(eq(salaries.id, record.id), eq(salaries.status, "approved"))).returning({ id: salaries.id });
    if (!updated) return failure("Salary status changed. Refresh and try again.");
  } else {
    if (record.status !== "finalized") return failure("Only finalized entries can be marked paid.");
    const [updated] = await db.update(salaries).set({ paidAt: new Date(), paidBy: session.id, status: "paid", updatedAt: new Date() })
      .where(and(eq(salaries.id, record.id), eq(salaries.status, "finalized"))).returning({ id: salaries.id });
    if (!updated) return failure("Salary status changed. Refresh and try again.");
  }
  revalidatePath("/admin/salary"); revalidatePath("/employee/salary");
  const pastTense = input.transition === "pay" ? "paid" : `${input.transition}d`;
  await writeAuditLog(session.id, `salary.${pastTense}`, "salary", record.id);
  return success(`Salary entry ${pastTense}.`);
}

export async function punchAttendanceAction(input: { idempotencyKey: string; type: "check_in" | "check_out" }): Promise<ActionResult> {
  const session = await requireAuth("employee");
  const parsed = attendancePunchSchema.safeParse(input);
  if (!parsed.success || !session.employeeRecordId) return failure("Invalid attendance request.");
  const [replayed] = await db.select({ employeeId: attendanceEvents.employeeId }).from(attendanceEvents)
    .where(eq(attendanceEvents.idempotencyKey, parsed.data.idempotencyKey)).limit(1);
  if (replayed) return replayed.employeeId === session.employeeRecordId ? success("Attendance already recorded.") : failure("Invalid attendance request.");
  const [employee] = await db.select({ status: employees.status, userActive: users.isActive }).from(employees)
    .innerJoin(users, eq(users.id, employees.userId)).where(eq(employees.id, session.employeeRecordId)).limit(1);
  if (!employee || !isEligibleForAttendance(employee.userActive, employee.status)) return failure("Inactive employees cannot record attendance.");
  const now = new Date();

  if (parsed.data.type === "check_out") {
    const [open] = await db.select().from(attendanceRecords).where(and(
      eq(attendanceRecords.employeeId, session.employeeRecordId), isNull(attendanceRecords.checkOutAt),
    )).orderBy(desc(attendanceRecords.checkInAt)).limit(1);
    if (!open) return failure("There is no open attendance session.");
    const [updated] = await db.update(attendanceRecords).set({
      checkOutAt: now, workedMinutes: calculateWorkedMinutes(open.checkInAt, now), updatedAt: now,
    }).where(and(eq(attendanceRecords.id, open.id), isNull(attendanceRecords.checkOutAt))).returning({ id: attendanceRecords.id });
    if (!updated) return failure("This session has already been checked out.");
    await db.insert(attendanceEvents).values({
      employeeId: session.employeeRecordId, eventType: "check_out", idempotencyKey: parsed.data.idempotencyKey,
      occurredAt: now, recordId: open.id,
    }).onConflictDoNothing();
    revalidatePath("/employee/attendance"); revalidatePath("/admin/attendance");
    await writeAuditLog(session.id, "attendance.checked_out", "attendance_record", open.id);
    return success("Checked out successfully.");
  }

  const assignments = await db.select({ assignment: shiftAssignments, shift: workShifts }).from(shiftAssignments)
    .innerJoin(workShifts, eq(workShifts.id, shiftAssignments.shiftId))
    .where(and(eq(shiftAssignments.employeeId, session.employeeRecordId), eq(workShifts.isActive, true)))
    .orderBy(desc(shiftAssignments.effectiveFrom));
  const assignment = assignments.find((item) => {
    const date = resolveShiftWorkDate(now, item.shift.timezone, item.shift.endTime, item.shift.isOvernight);
    return item.assignment.effectiveFrom <= date && (!item.assignment.effectiveTo || item.assignment.effectiveTo >= date);
  });
  if (!assignment) return failure("No active shift is assigned. Contact HR.");
  const workDate = resolveShiftWorkDate(now, assignment.shift.timezone, assignment.shift.endTime, assignment.shift.isOvernight);
  const jsDay = new Date(`${workDate}T12:00:00Z`).getUTCDay();
  if (!assignment.shift.weekdays.includes(jsDay)) return failure("Today is not a scheduled work day.");
  const recordId = randomUUID();
  const lateMinutes = calculateLateMinutes(now, assignment.shift.startTime, assignment.shift.graceMinutes, assignment.shift.timezone);
  const [created] = await db.insert(attendanceRecords).values({
    assignmentId: assignment.assignment.id, checkInAt: now, employeeId: session.employeeRecordId,
    id: recordId, lateMinutes, shiftId: assignment.shift.id, status: lateMinutes ? "late" : "present",
    timezone: assignment.shift.timezone, workDate,
  }).onConflictDoNothing().returning({ id: attendanceRecords.id });
  if (!created) return failure("An attendance session already exists for this work date.");
  await db.insert(attendanceEvents).values({
    employeeId: session.employeeRecordId, eventType: "check_in", idempotencyKey: parsed.data.idempotencyKey,
    occurredAt: now, recordId,
  }).onConflictDoNothing();
  revalidatePath("/employee/attendance"); revalidatePath("/admin/attendance");
  await writeAuditLog(session.id, "attendance.checked_in", "attendance_record", recordId);
  return success(lateMinutes ? `Checked in · ${lateMinutes} minute(s) late.` : "Checked in successfully.");
}

export async function requestAttendanceCorrectionAction(input: {
  reason: string; recordId: string; requestedCheckInAt?: string; requestedCheckOutAt?: string;
}): Promise<ActionResult> {
  const session = await requireAuth("employee");
  const parsed = attendanceCorrectionSchema.safeParse(input);
  if (!parsed.success || !session.employeeRecordId) return failure("Please provide valid correction details.", parsed.success ? undefined : parsed.error.flatten().fieldErrors);
  const [requester] = await db.select({ status: employees.status, userActive: users.isActive }).from(employees)
    .innerJoin(users, eq(users.id, employees.userId)).where(eq(employees.id, session.employeeRecordId)).limit(1);
  if (!requester || !isEligibleForAttendance(requester.userActive, requester.status)) return failure("Inactive employees cannot request corrections.");
  const [record] = await db.select({ employeeId: attendanceRecords.employeeId, id: attendanceRecords.id }).from(attendanceRecords)
    .where(eq(attendanceRecords.id, parsed.data.recordId)).limit(1);
  if (!record || !ownsAttendanceRecord(session.employeeRecordId, record.employeeId)) return failure("Attendance record was not found.");
  await db.insert(attendanceAdjustments).values({
    employeeId: session.employeeRecordId, reason: parsed.data.reason, recordId: record.id,
    requestedCheckInAt: parsed.data.requestedCheckInAt ? new Date(parsed.data.requestedCheckInAt) : null,
    requestedCheckOutAt: parsed.data.requestedCheckOutAt ? new Date(parsed.data.requestedCheckOutAt) : null,
  }).onConflictDoNothing();
  revalidatePath("/employee/attendance"); revalidatePath("/admin/attendance");
  await writeAuditLog(session.id, "attendance.correction_requested", "attendance_record", record.id);
  return success("Correction request submitted.");
}

export async function createWorkShiftAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const parsed = workShiftSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure("Enter valid shift details.", parsed.error.flatten().fieldErrors);
  const overnight = parsed.data.endTime <= parsed.data.startTime;
  const [shift] = await db.insert(workShifts).values({ ...parsed.data, isOvernight: overnight }).returning({ id: workShifts.id });
  revalidatePath("/admin/attendance"); await writeAuditLog(session.id, "shift.created", "work_shift", shift.id);
  return success("Shift created.");
}

export async function assignWorkShiftAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const parsed = shiftAssignmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure("Enter valid assignment details.", parsed.error.flatten().fieldErrors);
  await db.insert(shiftAssignments).values({
    createdBy: session.id, effectiveFrom: parsed.data.effectiveFrom, effectiveTo: parsed.data.effectiveTo || null,
    employeeId: parsed.data.employeeId, shiftId: parsed.data.shiftId,
  });
  revalidatePath("/admin/attendance"); await writeAuditLog(session.id, "shift.assigned", "employee", parsed.data.employeeId);
  return success("Shift assigned.");
}

export async function reviewAttendanceCorrectionAction(input: { adjustmentId: string; note?: string; status: "approved" | "rejected" }): Promise<ActionResult> {
  const session = await requireAuth("admin");
  const [request] = await db.select().from(attendanceAdjustments).where(eq(attendanceAdjustments.id, input.adjustmentId)).limit(1);
  if (!request || request.status !== "pending") return failure("Correction request is no longer pending.");
  const decide = db.update(attendanceAdjustments).set({
    reviewedAt: new Date(), reviewedBy: session.id, reviewerNote: input.note?.trim() || null, status: input.status, updatedAt: new Date(),
  }).where(and(eq(attendanceAdjustments.id, request.id), eq(attendanceAdjustments.status, "pending")));
  if (input.status === "approved") {
    const [record] = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, request.recordId)).limit(1);
    if (!record) return failure("Attendance record was not found.");
    const checkIn = request.requestedCheckInAt ?? record.checkInAt;
    const checkOut = request.requestedCheckOutAt ?? record.checkOutAt;
    const adjust = db.update(attendanceRecords).set({
      checkInAt: checkIn, checkOutAt: checkOut, status: "adjusted",
      workedMinutes: checkOut ? calculateWorkedMinutes(checkIn, checkOut) : null, updatedAt: new Date(),
    }).where(and(
      eq(attendanceRecords.id, record.id),
      sql`exists (select 1 from attendance_adjustments where id = ${request.id} and status = 'approved')`,
    ));
    await db.batch([decide, adjust]);
  } else await decide;
  revalidatePath("/admin/attendance"); revalidatePath("/employee/attendance");
  await writeAuditLog(session.id, `attendance.correction_${input.status}`, "attendance_adjustment", request.id);
  return success(`Correction ${input.status}.`);
}
