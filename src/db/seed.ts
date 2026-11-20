import "dotenv/config";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  departments,
  employees,
  leaveRequests,
  salaries,
  users,
} from "@/db/schema";
import { env } from "@/lib/env";

const departmentSeed = [
  {
    name: "IT",
    description: "Product engineering, support, and infrastructure delivery.",
  },
  {
    name: "Database",
    description: "Data platform, reporting, and business intelligence.",
  },
  {
    name: "Logistic",
    description: "Operations, inventory coordination, and office logistics.",
  },
] as const;

const employeeSeed = [
  {
    name: "Asif Rahman",
    email: "asif@smartdesk.com",
    employeeId: "EMP-1001",
    department: "Database",
    designation: "Database Engineer",
    dob: "1998-08-14",
    gender: "male" as const,
    maritalStatus: "single" as const,
    phone: "+8801711000001",
    address: "Dhaka, Bangladesh",
    joiningDate: "2022-06-29",
    baseSalary: 5200,
    status: "active" as const,
    imageUrl:
      "https://ui-avatars.com/api/?name=Asif+Rahman&background=14978e&color=ffffff",
  },
  {
    name: "Yousaf Karim",
    email: "yousaf@smartdesk.com",
    employeeId: "EMP-1002",
    department: "Database",
    designation: "Data Analyst",
    dob: "1999-02-13",
    gender: "male" as const,
    maritalStatus: "married" as const,
    phone: "+8801711000002",
    address: "Chattogram, Bangladesh",
    joiningDate: "2021-02-13",
    baseSalary: 4800,
    status: "active" as const,
    imageUrl:
      "https://ui-avatars.com/api/?name=Yousaf+Karim&background=0f766e&color=ffffff",
  },
  {
    name: "Khalil Ahmed",
    email: "khalil@smartdesk.com",
    employeeId: "EMP-1003",
    department: "IT",
    designation: "Support Specialist",
    dob: "1996-06-15",
    gender: "male" as const,
    maritalStatus: "single" as const,
    phone: "+8801711000003",
    address: "Rajshahi, Bangladesh",
    joiningDate: "2021-06-15",
    baseSalary: 4500,
    status: "active" as const,
    imageUrl:
      "https://ui-avatars.com/api/?name=Khalil+Ahmed&background=0d9488&color=ffffff",
  },
  {
    name: "Latif Hasan",
    email: "latif@smartdesk.com",
    employeeId: "EMP-1004",
    department: "Logistic",
    designation: "Logistics Coordinator",
    dob: "1995-06-09",
    gender: "male" as const,
    maritalStatus: "married" as const,
    phone: "+8801711000004",
    address: "Sylhet, Bangladesh",
    joiningDate: "2020-06-09",
    baseSalary: 4300,
    status: "active" as const,
    imageUrl:
      "https://ui-avatars.com/api/?name=Latif+Hasan&background=14b8a6&color=ffffff",
  },
] as const;

async function seedDepartments() {
  const departmentMap = new Map<string, string>();

  for (const item of departmentSeed) {
    const existing = await db
      .select()
      .from(departments)
      .where(eq(departments.name, item.name))
      .limit(1);

    if (existing[0]) {
      departmentMap.set(item.name, existing[0].id);
      continue;
    }

    const [inserted] = await db
      .insert(departments)
      .values(item)
      .returning({ id: departments.id, name: departments.name });

    departmentMap.set(inserted.name, inserted.id);
  }

  return departmentMap;
}

async function seedAdmin() {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, env.ADMIN_EMAIL.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const passwordHash = await hash(env.ADMIN_PASSWORD, 12);

  const [admin] = await db
    .insert(users)
    .values({
      name: "SmartDesk Admin",
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "admin",
      isActive: true,
    })
    .returning({ id: users.id });

  return admin.id;
}

async function seedEmployees(departmentMap: Map<string, string>) {
  if (!env.SEED_EMPLOYEE_PASSWORD) throw new Error("SEED_EMPLOYEE_PASSWORD is required when seeding employees.");
  const passwordHash = await hash(env.SEED_EMPLOYEE_PASSWORD, 12);
  const employeeRecordIds: string[] = [];

  for (const item of employeeSeed) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, item.email))
      .limit(1);

    let userId = existingUser[0]?.id;

    if (!userId) {
      const [user] = await db
        .insert(users)
        .values({
          name: item.name,
          email: item.email,
          passwordHash,
          role: "employee",
          employeeId: item.employeeId,
          isActive: true,
        })
        .returning({ id: users.id });

      userId = user.id;
    }

    const existingEmployee = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);

    if (existingEmployee[0]) {
      employeeRecordIds.push(existingEmployee[0].id);
      continue;
    }

    const [employee] = await db
      .insert(employees)
      .values({
        userId,
        employeeId: item.employeeId,
        departmentId: departmentMap.get(item.department)!,
        designation: item.designation,
        dob: item.dob,
        gender: item.gender,
        maritalStatus: item.maritalStatus,
        phone: item.phone,
        address: item.address,
        joiningDate: item.joiningDate,
        imageUrl: item.imageUrl,
        baseSalary: item.baseSalary,
        status: item.status,
      })
      .returning({ id: employees.id });

    employeeRecordIds.push(employee.id);
  }

  return employeeRecordIds;
}

async function seedLeaves(employeeRecordIds: string[], adminId: string) {
  const existing = await db.select().from(leaveRequests).limit(1);
  if (existing.length > 0) {
    return;
  }

  const [first, second, third] = employeeRecordIds;

  await db.insert(leaveRequests).values([
    {
      employeeId: first,
      leaveType: "annual",
      startDate: "2026-04-20",
      endDate: "2026-04-23",
      totalDays: 4,
      reason: "Family visit and personal commitments.",
      status: "pending",
    },
    {
      employeeId: second,
      leaveType: "sick",
      startDate: "2026-03-11",
      endDate: "2026-03-12",
      totalDays: 2,
      reason: "Medical rest advised by physician.",
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: adminId,
      adminNote: "Approved. Please attach prescription to HR records.",
    },
    {
      employeeId: third,
      leaveType: "casual",
      startDate: "2026-02-04",
      endDate: "2026-02-04",
      totalDays: 1,
      reason: "Urgent personal appointment.",
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: adminId,
      adminNote: "Rejected due to shift coverage shortage on the requested date.",
    },
  ]);
}

async function seedSalaries(
  employeeRecordIds: string[],
  departmentMap: Map<string, string>,
  adminId: string,
) {
  const existing = await db.select().from(salaries).limit(1);
  if (existing.length > 0) {
    return;
  }

  await db.insert(salaries).values([
    {
      employeeId: employeeRecordIds[0],
      departmentId: departmentMap.get("Database")!,
      basicSalary: 5200,
      allowance: 450,
      deduction: 150,
      totalSalary: 5500,
      payDate: "2026-04-01",
      periodStart: "2026-03-01",
      periodEnd: "2026-03-31",
      status: "paid",
      createdBy: adminId,
    },
    {
      employeeId: employeeRecordIds[1],
      departmentId: departmentMap.get("Database")!,
      basicSalary: 4800,
      allowance: 300,
      deduction: 120,
      totalSalary: 4980,
      payDate: "2026-04-01",
      periodStart: "2026-03-01",
      periodEnd: "2026-03-31",
      status: "paid",
      createdBy: adminId,
    },
    {
      employeeId: employeeRecordIds[2],
      departmentId: departmentMap.get("IT")!,
      basicSalary: 4500,
      allowance: 280,
      deduction: 140,
      totalSalary: 4640,
      payDate: "2026-04-01",
      periodStart: "2026-03-01",
      periodEnd: "2026-03-31",
      status: "paid",
      createdBy: adminId,
    },
    {
      employeeId: employeeRecordIds[3],
      departmentId: departmentMap.get("Logistic")!,
      basicSalary: 4300,
      allowance: 240,
      deduction: 100,
      totalSalary: 4440,
      payDate: "2026-04-01",
      periodStart: "2026-03-01",
      periodEnd: "2026-03-31",
      status: "paid",
      createdBy: adminId,
    },
  ]);
}

async function main() {
  const departmentMap = await seedDepartments();
  const adminId = await seedAdmin();
  const employeeRecordIds = await seedEmployees(departmentMap);

  await seedLeaves(employeeRecordIds, adminId);
  await seedSalaries(employeeRecordIds, departmentMap, adminId);

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error("Seed failed.", error);
  process.exit(1);
});
