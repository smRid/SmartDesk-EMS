import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "employee"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const maritalStatusEnum = pgEnum("marital_status", [
  "single",
  "married",
  "divorced",
  "widowed",
]);
export const employmentStatusEnum = pgEnum("employment_status", [
  "active",
  "on_leave",
  "inactive",
]);
export const leaveTypeEnum = pgEnum("leave_type", [
  "casual",
  "sick",
  "annual",
  "emergency",
]);
export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);
export const leaveCycleEnum = pgEnum("leave_cycle", ["calendar_year", "anniversary_year"]);
export const leaveLedgerEventEnum = pgEnum("leave_ledger_event", [
  "grant",
  "reserve",
  "release",
  "consume",
  "adjustment",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "late", "missing_checkout", "adjusted"]);
export const attendanceEventTypeEnum = pgEnum("attendance_event_type", ["check_in", "check_out"]);
export const adjustmentStatusEnum = pgEnum("adjustment_status", ["pending", "approved", "rejected"]);
export const salaryStatusEnum = pgEnum("salary_status", ["draft", "approved", "finalized", "paid"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("employee"),
    employeeId: varchar("employee_id", { length: 32 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    employeeIdIdx: uniqueIndex("users_employee_id_idx").on(table.employeeId),
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex("departments_name_idx").on(table.name),
  }),
);

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    employeeId: varchar("employee_id", { length: 32 }).notNull(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    designation: varchar("designation", { length: 140 }).notNull(),
    dob: date("dob", { mode: "string" }).notNull(),
    gender: genderEnum("gender").notNull(),
    maritalStatus: maritalStatusEnum("marital_status").notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    address: text("address").notNull(),
    joiningDate: date("joining_date", { mode: "string" }).notNull(),
    imageUrl: text("image_url"),
    cloudinaryPublicId: text("cloudinary_public_id"),
    baseSalary: numeric("base_salary", { precision: 12, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    status: employmentStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("employees_user_id_idx").on(table.userId),
    employeeIdIdx: uniqueIndex("employees_employee_id_idx").on(table.employeeId),
    departmentIdx: index("employees_department_idx").on(table.departmentId),
    statusIdx: index("employees_status_idx").on(table.status),
  }),
);

export const leaveRequests = pgTable(
  "leave_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    leaveType: leaveTypeEnum("leave_type").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    totalDays: integer("total_days").notNull(),
    chargeDays: numeric("charge_days", { precision: 6, scale: 2, mode: "number" }),
    dayFraction: numeric("day_fraction", { precision: 3, scale: 2, mode: "number" }).notNull().default(1),
    cycleStart: date("cycle_start", { mode: "string" }),
    cycleEnd: date("cycle_end", { mode: "string" }),
    exceptionApproved: boolean("exception_approved").notNull().default(false),
    reason: text("reason").notNull(),
    status: leaveStatusEnum("status").notNull().default("pending"),
    adminNote: text("admin_note"),
    appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    employeeIdx: index("leave_requests_employee_idx").on(table.employeeId),
    statusIdx: index("leave_requests_status_idx").on(table.status),
    reviewedByIdx: index("leave_requests_reviewed_by_idx").on(table.reviewedBy),
  }),
);

export const leavePolicies = pgTable(
  "leave_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leaveType: leaveTypeEnum("leave_type").notNull(),
    annualEntitlement: numeric("annual_entitlement", { precision: 6, scale: 2, mode: "number" }).notNull().default(0),
    cycleType: leaveCycleEnum("cycle_type").notNull().default("calendar_year"),
    excludeWeekends: boolean("exclude_weekends").notNull().default(true),
    weekendDays: jsonb("weekend_days").$type<number[]>().notNull().default([0, 6]),
    excludeHolidays: boolean("exclude_holidays").notNull().default(true),
    allowHalfDay: boolean("allow_half_day").notNull().default(false),
    reservePending: boolean("reserve_pending").notNull().default(true),
    allowNegativeWithApproval: boolean("allow_negative_with_approval").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ leaveTypeIdx: uniqueIndex("leave_policies_type_idx").on(table.leaveType) }),
);

export const holidayCalendar = pgTable(
  "holiday_calendar",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    holidayDate: date("holiday_date", { mode: "string" }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ dateIdx: uniqueIndex("holiday_calendar_date_idx").on(table.holidayDate) }),
);

export const leaveLedger = pgTable(
  "leave_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
    leaveType: leaveTypeEnum("leave_type").notNull(),
    requestId: uuid("request_id").references(() => leaveRequests.id, { onDelete: "set null" }),
    eventType: leaveLedgerEventEnum("event_type").notNull(),
    amount: numeric("amount", { precision: 7, scale: 2, mode: "number" }).notNull(),
    cycleStart: date("cycle_start", { mode: "string" }).notNull(),
    cycleEnd: date("cycle_end", { mode: "string" }).notNull(),
    eventKey: varchar("event_key", { length: 180 }).notNull(),
    note: text("note"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    employeeCycleIdx: index("leave_ledger_employee_cycle_idx").on(table.employeeId, table.leaveType, table.cycleStart),
    eventKeyIdx: uniqueIndex("leave_ledger_event_key_idx").on(table.eventKey),
  }),
);

export const leaveApprovalHistory = pgTable(
  "leave_approval_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id").notNull().references(() => leaveRequests.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    fromStatus: leaveStatusEnum("from_status").notNull(),
    toStatus: leaveStatusEnum("to_status").notNull(),
    note: text("note"),
    exceptionApproved: boolean("exception_approved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    requestIdx: index("leave_approval_history_request_idx").on(table.requestId),
    decisionIdx: uniqueIndex("leave_approval_history_decision_idx").on(table.requestId, table.toStatus),
  }),
);

export const workShifts = pgTable("work_shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  timezone: varchar("timezone", { length: 80 }).notNull().default("Asia/Dhaka"),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  graceMinutes: integer("grace_minutes").notNull().default(0),
  weekdays: jsonb("weekdays").$type<number[]>().notNull().default([1, 2, 3, 4, 5]),
  isOvernight: boolean("is_overnight").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ nameIdx: uniqueIndex("work_shifts_name_idx").on(table.name) }));

export const shiftAssignments = pgTable("shift_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  shiftId: uuid("shift_id").notNull().references(() => workShifts.id),
  effectiveFrom: date("effective_from", { mode: "string" }).notNull(),
  effectiveTo: date("effective_to", { mode: "string" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ employeeDateIdx: index("shift_assignments_employee_date_idx").on(table.employeeId, table.effectiveFrom) }));

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  shiftId: uuid("shift_id").references(() => workShifts.id, { onDelete: "set null" }),
  assignmentId: uuid("assignment_id").references(() => shiftAssignments.id, { onDelete: "set null" }),
  workDate: date("work_date", { mode: "string" }).notNull(),
  timezone: varchar("timezone", { length: 80 }).notNull(),
  scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
  scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
  checkInAt: timestamp("check_in_at", { withTimezone: true }).notNull(),
  checkOutAt: timestamp("check_out_at", { withTimezone: true }),
  workedMinutes: integer("worked_minutes"),
  lateMinutes: integer("late_minutes").notNull().default(0),
  status: attendanceStatusEnum("status").notNull().default("present"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  employeeDateIdx: uniqueIndex("attendance_records_employee_date_idx").on(table.employeeId, table.workDate),
  dateStatusIdx: index("attendance_records_date_status_idx").on(table.workDate, table.status),
}));

export const attendanceEvents = pgTable("attendance_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  recordId: uuid("record_id").notNull().references(() => attendanceRecords.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  eventType: attendanceEventTypeEnum("event_type").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  idempotencyKey: uuid("idempotency_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  employeeIdx: index("attendance_events_employee_idx").on(table.employeeId, table.occurredAt),
  idempotencyIdx: uniqueIndex("attendance_events_idempotency_idx").on(table.idempotencyKey),
}));

export const attendanceAdjustments = pgTable("attendance_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  recordId: uuid("record_id").notNull().references(() => attendanceRecords.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  requestedCheckInAt: timestamp("requested_check_in_at", { withTimezone: true }),
  requestedCheckOutAt: timestamp("requested_check_out_at", { withTimezone: true }),
  reason: text("reason").notNull(),
  status: adjustmentStatusEnum("status").notNull().default("pending"),
  reviewerNote: text("reviewer_note"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  employeeIdx: index("attendance_adjustments_employee_idx").on(table.employeeId, table.status),
  recordStatusIdx: index("attendance_adjustments_record_status_idx").on(table.recordId, table.status),
}));

export const salaries = pgTable(
  "salaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    basicSalary: numeric("basic_salary", { precision: 12, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    allowance: numeric("allowance", { precision: 12, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    deduction: numeric("deduction", { precision: 12, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    totalSalary: numeric("total_salary", { precision: 12, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    payDate: date("pay_date", { mode: "string" }).notNull(),
    periodStart: date("period_start", { mode: "string" }).notNull(),
    periodEnd: date("period_end", { mode: "string" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    status: salaryStatusEnum("status").notNull().default("draft"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    finalizedBy: uuid("finalized_by").references(() => users.id, { onDelete: "set null" }),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    paidBy: uuid("paid_by").references(() => users.id, { onDelete: "set null" }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    employeeIdx: index("salaries_employee_idx").on(table.employeeId),
    departmentIdx: index("salaries_department_idx").on(table.departmentId),
    payDateIdx: index("salaries_pay_date_idx").on(table.payDate),
    employeePeriodIdx: uniqueIndex("salaries_employee_period_idx").on(table.employeeId, table.periodStart, table.periodEnd),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 160 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }).notNull(),
    detailsJson: jsonb("details_json").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    actorIdx: index("audit_logs_actor_idx").on(table.actorUserId),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  employee: one(employees, {
    fields: [users.id],
    references: [employees.userId],
  }),
  reviewedLeaveRequests: many(leaveRequests, {
    relationName: "leave_request_reviewer",
  }),
  createdSalaries: many(salaries, {
    relationName: "salary_creator",
  }),
  auditLogs: many(auditLogs, {
    relationName: "audit_actor",
  }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
  salaries: many(salaries),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  leaveRequests: many(leaveRequests),
  salaries: many(salaries),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  reviewer: one(users, {
    fields: [leaveRequests.reviewedBy],
    references: [users.id],
    relationName: "leave_request_reviewer",
  }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(employees, {
    fields: [salaries.employeeId],
    references: [employees.id],
  }),
  department: one(departments, {
    fields: [salaries.departmentId],
    references: [departments.id],
  }),
  creator: one(users, {
    fields: [salaries.createdBy],
    references: [users.id],
    relationName: "salary_creator",
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
    relationName: "audit_actor",
  }),
}));

export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type LeavePolicy = typeof leavePolicies.$inferSelect;
export type Salary = typeof salaries.$inferSelect;
