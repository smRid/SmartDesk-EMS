import { differenceInCalendarDays, parseISO } from "date-fns";
import { z } from "zod";
import {
  EMPLOYMENT_STATUSES,
  GENDER_OPTIONS,
  LEAVE_TYPES,
  MARITAL_STATUS_OPTIONS,
  USER_ROLES,
} from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Department name is required."),
  description: z.string().trim().min(8, "Add a short description."),
});

const baseEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid work email."),
  employeeId: z.string().trim().min(3, "Employee ID is required."),
  dob: z.string().min(1, "Date of birth is required."),
  gender: z.enum(GENDER_OPTIONS),
  maritalStatus: z.enum(MARITAL_STATUS_OPTIONS),
  designation: z.string().trim().min(2, "Designation is required."),
  departmentId: z.string().uuid("Select a department."),
  baseSalary: z.coerce.number().min(0, "Salary cannot be negative."),
  role: z.enum(USER_ROLES),
  phone: z.string().trim().min(7, "Phone number is required."),
  address: z.string().trim().min(5, "Address is required."),
  joiningDate: z.string().min(1, "Joining date is required."),
  status: z.enum(EMPLOYMENT_STATUSES),
});

export const employeeCreateSchema = baseEmployeeSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const employeeUpdateSchema = baseEmployeeSchema;

export const leaveRequestSchema = z
  .object({
    dayFraction: z.coerce.number().refine((value) => value === 1 || value === 0.5, "Choose a full or half day.").default(1),
    leaveType: z.enum(LEAVE_TYPES),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    reason: z.string().trim().min(10, "Please share a short reason."),
  })
  .superRefine((value, ctx) => {
    const start = parseISO(value.startDate);
    const end = parseISO(value.endDate);

    if (differenceInCalendarDays(end, start) < 0) {
      ctx.addIssue({
        code: "custom",
        message: "End date cannot be earlier than the start date.",
        path: ["endDate"],
      });
    }
  });

export const salarySchema = z.object({
  departmentId: z.string().uuid("Select a department."),
  employeeId: z.string().uuid("Select an employee."),
  basicSalary: z.coerce.number().min(0, "Basic salary cannot be negative."),
  allowance: z.coerce.number().min(0, "Allowance cannot be negative."),
  deduction: z.coerce.number().min(0, "Deduction cannot be negative."),
  payDate: z.string().min(1, "Pay date is required."),
  periodStart: z.string().date("Period start is required."),
  periodEnd: z.string().date("Period end is required."),
}).refine((value) => value.periodEnd >= value.periodStart, { message: "Period end cannot precede the start.", path: ["periodEnd"] });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(8, "Old password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the new password."),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const employeeProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(7, "Phone number is required."),
  address: z.string().trim().min(5, "Address is required."),
  maritalStatus: z.enum(MARITAL_STATUS_OPTIONS),
});

export const adminProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
});

export const attendancePunchSchema = z.object({
  idempotencyKey: z.string().uuid("Invalid request key."),
  type: z.enum(["check_in", "check_out"]),
});

export const attendanceCorrectionSchema = z.object({
  recordId: z.string().uuid(),
  requestedCheckInAt: z.string().datetime().optional().or(z.literal("")),
  requestedCheckOutAt: z.string().datetime().optional().or(z.literal("")),
  reason: z.string().trim().min(10, "Explain why the correction is needed."),
}).refine((value) => value.requestedCheckInAt || value.requestedCheckOutAt, {
  message: "Request at least one time correction.",
  path: ["requestedCheckInAt"],
});

export const workShiftSchema = z.object({
  name: z.string().trim().min(2),
  timezone: z.string().trim().min(3),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  graceMinutes: z.coerce.number().int().min(0).max(240),
}).refine((value) => {
  try { new Intl.DateTimeFormat("en-US", { timeZone: value.timezone }).format(); return true; } catch { return false; }
}, { message: "Enter a valid IANA timezone.", path: ["timezone"] });

export const shiftAssignmentSchema = z.object({
  employeeId: z.string().uuid(),
  shiftId: z.string().uuid(),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type SalaryInput = z.infer<typeof salarySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EmployeeProfileInput = z.infer<typeof employeeProfileSchema>;
export type AdminProfileInput = z.infer<typeof adminProfileSchema>;
export type AttendanceCorrectionInput = z.infer<typeof attendanceCorrectionSchema>;
