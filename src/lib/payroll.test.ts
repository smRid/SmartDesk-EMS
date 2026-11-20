import assert from "node:assert/strict";
import test from "node:test";
import { calculateSalaryTotal, roundMoney, salaryPeriodKey } from "./payroll.ts";

test("rounds salary components to currency precision", () => {
  assert.equal(roundMoney(10.005), 10.01);
  assert.equal(calculateSalaryTotal(1000.005, 100.005, 25.005), 1075.01);
});
test("builds a stable duplicate-period identity", () => {
  assert.equal(salaryPeriodKey("employee", "2026-11-01", "2026-11-30"), "employee:2026-11-01:2026-11-30");
});
test("does not fabricate tax or benefit components", () => {
  assert.equal(calculateSalaryTotal(1000, 0, 0), 1000);
});
