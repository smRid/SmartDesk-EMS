import assert from "node:assert/strict";
import test from "node:test";
import { changePasswordSchema, leaveRequestSchema, resetPasswordSchema, salarySchema } from "./validations.ts";

test("rejects reversed leave and payroll periods", () => {
  assert.equal(leaveRequestSchema.safeParse({ dayFraction: 1, endDate: "2026-01-01", leaveType: "annual", reason: "A sufficiently clear reason", startDate: "2026-01-02" }).success, false);
  assert.equal(salarySchema.safeParse({ allowance: 0, basicSalary: 100, deduction: 0, departmentId: crypto.randomUUID(), employeeId: crypto.randomUUID(), payDate: "2026-01-31", periodEnd: "2026-01-01", periodStart: "2026-01-31" }).success, false);
});

test("enforces strong reset passwords and matching password changes", () => {
  assert.equal(resetPasswordSchema.safeParse({ password: "weak-password", token: "a".repeat(43) }).success, false);
  assert.equal(changePasswordSchema.safeParse({ confirmPassword: "Different1!xx", newPassword: "StrongPass1!xx", oldPassword: "old-password" }).success, false);
});
