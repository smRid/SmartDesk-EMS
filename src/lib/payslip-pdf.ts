import { ORGANIZATION_ADDRESS, ORGANIZATION_NAME } from "./constants.ts";

export type PayslipData = {
  allowance: number; basicSalary: number; currency: string; deduction: number;
  employeeCode: string; employeeName: string; payDate: string;
  periodEnd: string; periodStart: string; totalSalary: number;
};

const escapePdf = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replace(/[^\x20-\x7E]/g, "-");
const money = (value: number, currency: string) => `${currency} ${value.toFixed(2)}`;

export function createPayslipPdf(data: PayslipData) {
  const lines: string[] = [];
  const text = (x: number, y: number, size: number, value: string, bold = false) =>
    lines.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`);
  lines.push("0.06 0.46 0.43 rg 0 700 612 92 re f", "0.95 0.98 0.98 rg 36 570 540 88 re f", "0.88 0.91 0.92 RG 36 300 540 238 re S");
  text(42, 754, 24, ORGANIZATION_NAME, true); text(42, 732, 9, ORGANIZATION_ADDRESS); text(470, 748, 16, "PAYSLIP", true);
  text(48, 632, 10, "Employee", false); text(150, 632, 11, data.employeeName, true);
  text(48, 610, 10, "Employee ID", false); text(150, 610, 11, data.employeeCode, true);
  text(330, 632, 10, "Pay period", false); text(410, 632, 10, `${data.periodStart} to ${data.periodEnd}`, true);
  text(330, 610, 10, "Pay date", false); text(410, 610, 10, data.payDate, true);
  text(48, 510, 11, "EARNINGS", true); text(400, 510, 11, "AMOUNT", true);
  text(48, 474, 11, "Basic salary"); text(400, 474, 11, money(data.basicSalary, data.currency));
  text(48, 438, 11, "Allowance"); text(400, 438, 11, money(data.allowance, data.currency));
  lines.push("0.88 0.91 0.92 RG 48 412 m 552 412 l S");
  text(48, 382, 11, "Gross earnings", true); text(400, 382, 11, money(data.basicSalary + data.allowance, data.currency), true);
  text(48, 346, 11, "Deductions"); text(400, 346, 11, `- ${money(data.deduction, data.currency)}`);
  lines.push("0.06 0.46 0.43 rg 36 220 540 60 re f"); text(52, 244, 14, "NET PAY", true); text(390, 242, 18, money(data.totalSalary, data.currency), true);
  text(42, 174, 9, "Salary definition: basic salary + allowance - deduction.");
  text(42, 154, 9, "No statutory tax, benefit, or labour-law calculation is included.");
  text(42, 96, 9, "Generated securely by SmartDesk EMS. This document is private.");
  text(42, 60, 8, "Organization registration and contact details: configure with HR.");
  const stream = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  let output = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = output.length; output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(output);
}
