import assert from "node:assert/strict";
import test from "node:test";
import { createPayslipPdf } from "./payslip-pdf.ts";
const sample = { allowance: 200, basicSalary: 2000, currency: "USD", deduction: 50, employeeCode: "EMP-1", employeeName: "Sample Employee", payDate: "2026-11-30", periodEnd: "2026-11-30", periodStart: "2026-11-01", totalSalary: 2150 };
test("generates a one-page private payslip with required fields", () => {
  const text = new TextDecoder().decode(createPayslipPdf(sample));
  assert.ok(text.startsWith("%PDF-1.4"));
  for (const required of ["Sample Employee", "EMP-1", "2026-11-01 to 2026-11-30", "Basic salary", "Allowance", "Deductions", "NET PAY", "USD 2150.00"]) assert.match(text, new RegExp(required));
  assert.match(text, /\/Count 1/);
});
