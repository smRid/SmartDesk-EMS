"use server";

import { compare, hash } from "bcrypt";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  auditLogs,
  departments,
  employees,
  leaveRequests,
  salaries,
  users,
} from "@/db/schema";
import { createSession, destroySession, requireAuth } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { clearRateLimit, checkRateLimit } from "@/lib/rate-limit";
import {
  adminProfileSchema,
  changePasswordSchema,
  departmentSchema,
  employeeCreateSchema,
  employeeProfileSchema,
  employeeUpdateSchema,
  leaveRequestSchema,
  loginSchema,
  salarySchema,
  type AdminProfileInput,
  type ChangePasswordInput,
  type DepartmentInput,
  type LeaveRequestInput,
  type LoginInput,
  type SalaryInput,
} from "@/lib/validations";
import { calculateLeaveDays } from "@/lib/utils";

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
      isActive: true,
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

  const totalDays = calculateLeaveDays(parsed.data.startDate, parsed.data.endDate);

  const [leave] = await db
    .insert(leaveRequests)
    .values({
      employeeId: session.employeeRecordId,
      endDate: parsed.data.endDate,
      leaveType: parsed.data.leaveType,
      reason: parsed.data.reason,
      startDate: parsed.data.startDate,
      status: "pending",
      totalDays,
    })
    .returning({ id: leaveRequests.id });

  revalidatePath("/employee/leave");
  revalidatePath("/employee/dashboard");
  revalidatePath("/admin/leaves");
  revalidatePath("/admin/dashboard");
  await writeAuditLog(session.id, "leave.created", "leave_request", leave.id);

  return success("Leave request submitted successfully.", "/employee/leave");
}

export async function reviewLeaveRequestAction(input: {
  adminNote?: string;
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

  await db
    .update(leaveRequests)
    .set({
      adminNote: input.adminNote?.trim() || null,
      reviewedAt: new Date(),
      reviewedBy: session.id,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, input.leaveId));

  revalidatePath("/admin/leaves");
  revalidatePath(`/admin/leaves/${input.leaveId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/leave");
  revalidatePath("/employee/dashboard");
  await writeAuditLog(session.id, `leave.${input.status}`, "leave_request", input.leaveId);

  return success(`Leave request ${input.status}.`);
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

  const totalSalary =
    parsed.data.basicSalary + parsed.data.allowance - parsed.data.deduction;

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
