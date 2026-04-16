import "server-only";

import {
  and,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
} from "drizzle-orm";
import { format, startOfMonth, subMonths } from "date-fns";
import { db } from "@/db";
import {
  departments,
  employees,
  leaveRequests,
  salaries,
  users,
} from "@/db/schema";
import { APP_CURRENCY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type EmployeeFilters = {
  departmentId?: string;
  query?: string;
};

type LeaveFilters = {
  employeeRecordId?: string;
  query?: string;
  status?: string;
};

type SalaryFilters = {
  employeeRecordId?: string;
  from?: string;
  query?: string;
  to?: string;
};

export async function getDepartmentOptions() {
  return db
    .select({
      id: departments.id,
      name: departments.name,
    })
    .from(departments)
    .orderBy(departments.name);
}

export async function getActiveEmployeeOptions(departmentId?: string) {
  const conditions = [eq(users.isActive, true), eq(employees.status, "active")];

  if (departmentId && departmentId !== "all") {
    conditions.push(eq(employees.departmentId, departmentId));
  }

  return db
    .select({
      departmentId: employees.departmentId,
      employeeCode: employees.employeeId,
      id: employees.id,
      name: users.name,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .where(and(...conditions))
    .orderBy(users.name);
}

export async function getDepartmentsList(query = "") {
  const departmentRows = await db
    .select()
    .from(departments)
    .where(
      query
        ? or(
            ilike(departments.name, `%${query}%`),
            ilike(departments.description, `%${query}%`),
          )
        : undefined,
    )
    .orderBy(departments.name);

  const employeeRows = await db
    .select({
      departmentId: employees.departmentId,
      userActive: users.isActive,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId));

  return departmentRows.map((department) => {
    const employeeCount = employeeRows.filter(
      (row) => row.departmentId === department.id && row.userActive,
    ).length;

    return {
      ...department,
      employeeCount,
    };
  });
}

export async function getEmployeesList(filters: EmployeeFilters = {}) {
  const conditions = [];

  if (filters.query) {
    conditions.push(
      or(
        ilike(users.name, `%${filters.query}%`),
        ilike(employees.employeeId, `%${filters.query}%`),
      ),
    );
  }

  if (filters.departmentId && filters.departmentId !== "all") {
    conditions.push(eq(employees.departmentId, filters.departmentId));
  }

  const rows = await db
    .select({
      department: departments,
      employee: employees,
      user: users,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(employees.createdAt));

  return rows.map((row) => ({
    departmentId: row.department?.id ?? null,
    departmentName: row.department?.name ?? "Unassigned",
    designation: row.employee.designation,
    dob: row.employee.dob,
    employeeCode: row.employee.employeeId,
    employeeRecordId: row.employee.id,
    id: row.user.id,
    imageUrl: row.employee.imageUrl,
    isActive: row.user.isActive,
    name: row.user.name,
    role: row.user.role,
    status: row.employee.status,
  }));
}

export async function getEmployeeDetails(employeeRecordId: string) {
  const [record] = await db
    .select({
      department: departments,
      employee: employees,
      user: users,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(eq(employees.id, employeeRecordId))
    .limit(1);

  if (!record) {
    return null;
  }

  const [employeeLeaves, employeeSalaries] = await Promise.all([
    getLeaveList({ employeeRecordId }),
    getSalaryList({ employeeRecordId }),
  ]);

  return {
    address: record.employee.address,
    baseSalary: record.employee.baseSalary,
    departmentId: record.department?.id ?? null,
    departmentName: record.department?.name ?? "Unassigned",
    designation: record.employee.designation,
    dob: record.employee.dob,
    email: record.user.email,
    employeeCode: record.employee.employeeId,
    employeeRecordId: record.employee.id,
    gender: record.employee.gender,
    imageUrl: record.employee.imageUrl,
    isActive: record.user.isActive,
    joiningDate: record.employee.joiningDate,
    leaveCount: employeeLeaves.length,
    maritalStatus: record.employee.maritalStatus,
    name: record.user.name,
    phone: record.employee.phone,
    recentLeaves: employeeLeaves.slice(0, 5),
    recentSalaries: employeeSalaries.slice(0, 5),
    role: record.user.role,
    status: record.employee.status,
    userId: record.user.id,
  };
}

export async function getLeaveList(filters: LeaveFilters = {}) {
  const conditions = [];

  if (filters.query) {
    conditions.push(
      or(
        ilike(users.name, `%${filters.query}%`),
        ilike(employees.employeeId, `%${filters.query}%`),
      ),
    );
  }

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(leaveRequests.status, filters.status as "pending"));
  }

  if (filters.employeeRecordId) {
    conditions.push(eq(leaveRequests.employeeId, filters.employeeRecordId));
  }

  const rows = await db
    .select({
      department: departments,
      employee: employees,
      leave: leaveRequests,
      user: users,
    })
    .from(leaveRequests)
    .innerJoin(employees, eq(employees.id, leaveRequests.employeeId))
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leaveRequests.appliedAt));

  return rows.map((row) => ({
    adminNote: row.leave.adminNote,
    appliedAt: row.leave.appliedAt,
    departmentName: row.department?.name ?? "Unassigned",
    employeeCode: row.employee.employeeId,
    employeeImageUrl: row.employee.imageUrl,
    employeeName: row.user.name,
    employeeRecordId: row.employee.id,
    endDate: row.leave.endDate,
    id: row.leave.id,
    leaveType: row.leave.leaveType,
    reason: row.leave.reason,
    reviewedAt: row.leave.reviewedAt,
    startDate: row.leave.startDate,
    status: row.leave.status,
    totalDays: row.leave.totalDays,
  }));
}

export async function getLeaveDetails(leaveId: string) {
  const [leave] = await getLeaveList().then((items) =>
    items.filter((item) => item.id === leaveId),
  );

  return leave ?? null;
}

export async function getSalaryList(filters: SalaryFilters = {}) {
  const conditions = [];

  if (filters.query) {
    conditions.push(
      or(
        ilike(users.name, `%${filters.query}%`),
        ilike(employees.employeeId, `%${filters.query}%`),
      ),
    );
  }

  if (filters.employeeRecordId) {
    conditions.push(eq(salaries.employeeId, filters.employeeRecordId));
  }

  if (filters.from) {
    conditions.push(gte(salaries.payDate, filters.from));
  }

  if (filters.to) {
    conditions.push(lte(salaries.payDate, filters.to));
  }

  const rows = await db
    .select({
      department: departments,
      employee: employees,
      salary: salaries,
      user: users,
    })
    .from(salaries)
    .innerJoin(employees, eq(employees.id, salaries.employeeId))
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(departments, eq(salaries.departmentId, departments.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(salaries.payDate));

  return rows.map((row) => ({
    allowance: row.salary.allowance,
    basicSalary: row.salary.basicSalary,
    deduction: row.salary.deduction,
    departmentName: row.department?.name ?? "Unassigned",
    employeeCode: row.employee.employeeId,
    employeeName: row.user.name,
    employeeRecordId: row.employee.id,
    id: row.salary.id,
    payDate: row.salary.payDate,
    totalSalary: row.salary.totalSalary,
  }));
}

export async function getAdminDashboardData() {
  const [employeeList, departmentList, leaveList, salaryList] = await Promise.all([
    getEmployeesList(),
    getDepartmentsList(),
    getLeaveList(),
    getSalaryList(),
  ]);

  const thisMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const payrollTotal = salaryList
    .filter((item) => item.payDate >= thisMonth)
    .reduce((sum, item) => sum + item.totalSalary, 0);

  const salaryTrend = Array.from({ length: 4 }).map((_, index) => {
    const month = format(startOfMonth(subMonths(new Date(), index)), "yyyy-MM");
    const total = salaryList
      .filter((item) => item.payDate.startsWith(month))
      .reduce((sum, item) => sum + item.totalSalary, 0);

    return {
      label: format(startOfMonth(subMonths(new Date(), index)), "MMM yyyy"),
      total,
    };
  });

  return {
    approvedLeaves: leaveList.filter((item) => item.status === "approved").length,
    departmentBreakdown: departmentList.map((department) => ({
      label: department.name,
      value: department.employeeCount,
    })),
    leaveList,
    monthlyPayrollFormatted: formatCurrency(payrollTotal, {
      currency: APP_CURRENCY,
    }),
    pendingLeaves: leaveList.filter((item) => item.status === "pending").length,
    recentEmployees: employeeList.slice(0, 5),
    recentLeaves: leaveList.slice(0, 5),
    rejectedLeaves: leaveList.filter((item) => item.status === "rejected").length,
    salaryTrend,
    totalDepartments: departmentList.length,
    totalEmployees: employeeList.length,
    totalLeaves: leaveList.length,
  };
}

async function getEmployeeProfileByUserId(userId: string) {
  const [record] = await db
    .select({
      department: departments,
      employee: employees,
      user: users,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!record) {
    return null;
  }

  return {
    address: record.employee.address,
    baseSalary: record.employee.baseSalary,
    departmentName: record.department?.name ?? "Unassigned",
    designation: record.employee.designation,
    dob: record.employee.dob,
    email: record.user.email,
    employeeCode: record.employee.employeeId,
    employeeRecordId: record.employee.id,
    imageUrl: record.employee.imageUrl,
    joiningDate: record.employee.joiningDate,
    maritalStatus: record.employee.maritalStatus,
    name: record.user.name,
    phone: record.employee.phone,
    status: record.employee.status,
    userId: record.user.id,
  };
}

export async function getEmployeeDashboardData(userId: string) {
  const profile = await getEmployeeProfileByUserId(userId);

  if (!profile) {
    return null;
  }

  const [leaveList, salaryList] = await Promise.all([
    getLeaveList({ employeeRecordId: profile.employeeRecordId }),
    getSalaryList({ employeeRecordId: profile.employeeRecordId }),
  ]);

  return {
    approvedLeaves: leaveList.filter((item) => item.status === "approved").length,
    latestSalary: salaryList[0]
      ? formatCurrency(salaryList[0].totalSalary, { currency: APP_CURRENCY })
      : "--",
    leaveList,
    pendingLeaves: leaveList.filter((item) => item.status === "pending").length,
    profile,
    recentLeaves: leaveList.slice(0, 5),
    recentSalaries: salaryList.slice(0, 5),
    rejectedLeaves: leaveList.filter((item) => item.status === "rejected").length,
  };
}

export async function getEmployeeProfileData(userId: string) {
  return getEmployeeProfileByUserId(userId);
}

export async function getAdminProfileData(userId: string) {
  const [user] = await db
    .select({
      email: users.email,
      id: users.id,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}
