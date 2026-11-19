import "server-only";

import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lt,
  lte,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { db } from "@/db";
import {
  departments,
  employees,
  leaveRequests,
  salaries,
  users,
} from "@/db/schema";
import { APP_CURRENCY } from "@/lib/constants";
import { requireAuth } from "@/lib/auth";

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

type DashboardTrendMonths = 6 | 12;

const REPORTING_TIME_ZONE = "Asia/Dhaka";
const leaveAppliedAtLocal = sql`(${leaveRequests.appliedAt} AT TIME ZONE 'Asia/Dhaka')`;
const leaveMonth = sql<string>`to_char(${leaveAppliedAtLocal}, 'YYYY-MM')`;
const leaveYear = sql<number>`extract(year from ${leaveRequests.startDate})::int`;
const salaryYear = sql<number>`extract(year from ${salaries.payDate})::int`;

function getReportingMonthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

function shiftMonthKey(key: string, offset: number) {
  const [year, month] = key.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthKey(key: string, options: Intl.DateTimeFormatOptions) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function formatDashboardCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: APP_CURRENCY,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

export async function getAdminDashboardData(monthsInput: number = 6) {
  await requireAuth("admin");

  const months: DashboardTrendMonths = monthsInput === 12 ? 12 : 6;
  const currentMonthKey = getReportingMonthKey();
  const trendStartKey = shiftMonthKey(currentMonthKey, -(months - 1));
  const nextMonthKey = shiftMonthKey(currentMonthKey, 1);
  const currentMonthStart = `${currentMonthKey}-01`;
  const nextMonthStart = `${nextMonthKey}-01`;
  const trendStartTimestamp = `${trendStartKey}-01 00:00:00`;
  const trendEndTimestamp = `${nextMonthKey}-01 00:00:00`;

  const [
    activeEmployeeRows,
    departmentCountRows,
    leaveStatusRows,
    salarySummaryRows,
    recentEmployees,
    pendingLeaveRows,
    departmentRows,
    trendRows,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(employees)
      .innerJoin(users, eq(users.id, employees.userId))
      .where(and(eq(users.isActive, true), eq(employees.status, "active"))),
    db.select({ value: count() }).from(departments),
    db
      .select({ status: leaveRequests.status, value: count() })
      .from(leaveRequests)
      .groupBy(leaveRequests.status),
    db
      .select({ recordCount: count(), total: sum(salaries.totalSalary) })
      .from(salaries)
      .where(
        and(
          gte(salaries.payDate, currentMonthStart),
          lt(salaries.payDate, nextMonthStart),
        ),
      ),
    db
      .select({
        designation: employees.designation,
        employeeRecordId: employees.id,
        imageUrl: employees.imageUrl,
        joiningDate: employees.joiningDate,
        name: users.name,
      })
      .from(employees)
      .innerJoin(users, eq(users.id, employees.userId))
      .where(eq(users.isActive, true))
      .orderBy(desc(employees.joiningDate), desc(employees.createdAt))
      .limit(5),
    db
      .select({
        employeeCode: employees.employeeId,
        employeeName: users.name,
        endDate: leaveRequests.endDate,
        id: leaveRequests.id,
        leaveType: leaveRequests.leaveType,
        startDate: leaveRequests.startDate,
        totalDays: leaveRequests.totalDays,
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(employees.id, leaveRequests.employeeId))
      .innerJoin(users, eq(users.id, employees.userId))
      .where(eq(leaveRequests.status, "pending"))
      .orderBy(desc(leaveRequests.appliedAt))
      .limit(5),
    db
      .select({
        id: departments.id,
        label: departments.name,
        value: count(users.id),
      })
      .from(departments)
      .leftJoin(
        employees,
        and(
          eq(employees.departmentId, departments.id),
          eq(employees.status, "active"),
        ),
      )
      .leftJoin(users, and(eq(users.id, employees.userId), eq(users.isActive, true)))
      .groupBy(departments.id, departments.name)
      .orderBy(departments.name),
    db
      .select({ month: leaveMonth, status: leaveRequests.status, value: count() })
      .from(leaveRequests)
      .where(
        and(
          sql`${leaveRequests.appliedAt} >= (${trendStartTimestamp}::timestamp AT TIME ZONE 'Asia/Dhaka')`,
          sql`${leaveRequests.appliedAt} < (${trendEndTimestamp}::timestamp AT TIME ZONE 'Asia/Dhaka')`,
        ),
      )
      .groupBy(sql.raw("1"), leaveRequests.status)
      .orderBy(sql.raw("1")),
  ]);

  const leaveCounts = { approved: 0, pending: 0, rejected: 0 };
  for (const row of leaveStatusRows) {
    leaveCounts[row.status] = row.value;
  }

  const trend = Array.from({ length: months }, (_, index) => {
    const key = shiftMonthKey(trendStartKey, index);
    const values = { approved: 0, pending: 0, rejected: 0 };
    for (const row of trendRows) {
      if (row.month === key) values[row.status] = row.value;
    }
    return { key, label: formatMonthKey(key, { month: "short", year: "numeric" }), ...values };
  });

  const salarySummary = salarySummaryRows[0];
  const salaryTotal = Number(salarySummary?.total ?? 0);

  return {
    activeEmployees: activeEmployeeRows[0]?.value ?? 0,
    approvedLeaves: leaveCounts.approved,
    currentMonthLabel: formatMonthKey(currentMonthKey, { month: "long", year: "numeric" }),
    departmentBreakdown: departmentRows.map((row) => ({
      id: row.id,
      label: row.label,
      value: row.value,
    })),
    leaveTrend: trend,
    months,
    pendingLeaves: leaveCounts.pending,
    pendingLeaveRows,
    recentEmployees,
    rejectedLeaves: leaveCounts.rejected,
    salaryRecordCount: salarySummary?.recordCount ?? 0,
    salaryRecordTotalFormatted: formatDashboardCurrency(salaryTotal),
    totalDepartments: departmentCountRows[0]?.value ?? 0,
  };
}

async function getEmployeeProfileByUserId(userId: string) {
  const [record] = await db
    .select({
      address: employees.address,
      baseSalary: employees.baseSalary,
      departmentId: employees.departmentId,
      departmentName: departments.name,
      designation: employees.designation,
      dob: employees.dob,
      email: users.email,
      employeeCode: employees.employeeId,
      employeeRecordId: employees.id,
      imageUrl: employees.imageUrl,
      joiningDate: employees.joiningDate,
      maritalStatus: employees.maritalStatus,
      name: users.name,
      phone: employees.phone,
      status: employees.status,
      userId: users.id,
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
    ...record,
    departmentAssigned: Boolean(record.departmentId),
    departmentName: record.departmentName ?? "Unassigned",
  };
}

async function getEmployeeDashboardProfile(userId: string) {
  const [record] = await db
    .select({
      address: employees.address,
      departmentId: employees.departmentId,
      departmentName: departments.name,
      designation: employees.designation,
      dob: employees.dob,
      email: users.email,
      employeeCode: employees.employeeId,
      employeeRecordId: employees.id,
      imageUrl: employees.imageUrl,
      name: users.name,
      phone: employees.phone,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!record) return null;

  return {
    ...record,
    departmentAssigned: Boolean(record.departmentId),
    departmentName: record.departmentName ?? "Unassigned",
  };
}

export async function getEmployeeDashboardData(yearInput?: string) {
  const session = await requireAuth("employee");
  const profile = await getEmployeeDashboardProfile(session.id);

  if (!profile) {
    return null;
  }

  const [leaveYearRows, salaryYearRows] = await Promise.all([
    db
      .selectDistinct({ value: leaveYear })
      .from(leaveRequests)
      .where(eq(leaveRequests.employeeId, profile.employeeRecordId)),
    db
      .selectDistinct({ value: salaryYear })
      .from(salaries)
      .where(eq(salaries.employeeId, profile.employeeRecordId)),
  ]);

  const currentYear = Number(getReportingMonthKey().slice(0, 4));
  const availableYears = Array.from(
    new Set([
      currentYear,
      ...leaveYearRows.map((row) => Number(row.value)),
      ...salaryYearRows.map((row) => Number(row.value)),
    ]),
  )
    .filter(Number.isInteger)
    .sort((a, b) => b - a);
  const requestedYear = Number(yearInput);
  const selectedYear =
    yearInput === "all"
      ? "all"
      : availableYears.includes(requestedYear)
        ? String(requestedYear)
        : String(currentYear);
  const startDate = selectedYear === "all" ? null : `${selectedYear}-01-01`;
  const nextYearStart =
    selectedYear === "all" ? null : `${Number(selectedYear) + 1}-01-01`;
  const leaveScope = startDate && nextYearStart
    ? and(
        eq(leaveRequests.employeeId, profile.employeeRecordId),
        gte(leaveRequests.startDate, startDate),
        lt(leaveRequests.startDate, nextYearStart),
      )
    : eq(leaveRequests.employeeId, profile.employeeRecordId);
  const salaryScope = startDate && nextYearStart
    ? and(
        eq(salaries.employeeId, profile.employeeRecordId),
        gte(salaries.payDate, startDate),
        lt(salaries.payDate, nextYearStart),
      )
    : eq(salaries.employeeId, profile.employeeRecordId);

  const [leaveStatusRows, recentLeaves, recentSalaries] = await Promise.all([
    db
      .select({ status: leaveRequests.status, value: count() })
      .from(leaveRequests)
      .where(leaveScope)
      .groupBy(leaveRequests.status),
    db
      .select({
        endDate: leaveRequests.endDate,
        id: leaveRequests.id,
        leaveType: leaveRequests.leaveType,
        startDate: leaveRequests.startDate,
        status: leaveRequests.status,
        totalDays: leaveRequests.totalDays,
      })
      .from(leaveRequests)
      .where(leaveScope)
      .orderBy(desc(leaveRequests.appliedAt))
      .limit(5),
    db
      .select({
        allowance: salaries.allowance,
        basicSalary: salaries.basicSalary,
        deduction: salaries.deduction,
        id: salaries.id,
        payDate: salaries.payDate,
        totalSalary: salaries.totalSalary,
      })
      .from(salaries)
      .where(salaryScope)
      .orderBy(desc(salaries.payDate), desc(salaries.createdAt))
      .limit(5),
  ]);

  const leaveCounts = { approved: 0, pending: 0, rejected: 0 };
  for (const row of leaveStatusRows) leaveCounts[row.status] = row.value;

  const completionFields = [
    profile.name,
    profile.email,
    profile.phone,
    profile.address,
    profile.departmentAssigned ? profile.departmentName : "",
    profile.designation,
    profile.dob,
    profile.imageUrl,
  ];
  const completedFields = completionFields.filter(
    (value) => typeof value === "string" && value.trim().length > 0,
  ).length;
  const profileCompletion = Math.round((completedFields / completionFields.length) * 100);
  const latestSalary = recentSalaries[0] ?? null;

  return {
    approvedLeaves: leaveCounts.approved,
    availableYears,
    latestSalary: latestSalary
      ? {
          formatted: formatDashboardCurrency(Number(latestSalary.totalSalary)),
          payDate: latestSalary.payDate,
        }
      : null,
    pendingLeaves: leaveCounts.pending,
    profile: {
      departmentName: profile.departmentName,
      designation: profile.designation,
      employeeCode: profile.employeeCode,
      imageUrl: profile.imageUrl,
      name: profile.name,
    },
    profileCompletion,
    profileFieldsCompleted: completedFields,
    profileFieldsTotal: completionFields.length,
    recentLeaves,
    recentSalaries: recentSalaries.map((salary) => ({
      id: salary.id,
      payDate: salary.payDate,
      allowanceFormatted: formatDashboardCurrency(Number(salary.allowance)),
      basicFormatted: formatDashboardCurrency(Number(salary.basicSalary)),
      deductionFormatted: formatDashboardCurrency(Number(salary.deduction)),
      totalFormatted: formatDashboardCurrency(Number(salary.totalSalary)),
    })),
    rejectedLeaves: leaveCounts.rejected,
    selectedYear,
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
