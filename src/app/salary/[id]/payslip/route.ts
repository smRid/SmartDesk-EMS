import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, employees, salaries, users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { createPayslipPdf } from "@/lib/payslip-pdf";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const [record] = await db.select({ employee: employees, salary: salaries, user: users }).from(salaries)
    .innerJoin(employees, eq(employees.id, salaries.employeeId)).innerJoin(users, eq(users.id, employees.userId))
    .where(and(eq(salaries.id, id), inArray(salaries.status, ["finalized", "paid"]))).limit(1);
  if (!record) return NextResponse.json({ message: "Payslip not found." }, { status: 404 });
  if (session.role !== "admin" && session.employeeRecordId !== record.employee.id) {
    return NextResponse.json({ message: "Payslip not found." }, { status: 404 });
  }
  const rate = checkRateLimit(`payslip:${session.id}`, { limit: 10, windowMs: 60_000 });
  if (!rate.allowed) return NextResponse.json({ message: "Download limit reached." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter ?? 60) } });
  const pdf = createPayslipPdf({
    allowance: record.salary.allowance, basicSalary: record.salary.basicSalary, currency: record.salary.currency,
    deduction: record.salary.deduction, employeeCode: record.employee.employeeId, employeeName: record.user.name,
    payDate: record.salary.payDate, periodEnd: record.salary.periodEnd, periodStart: record.salary.periodStart,
    totalSalary: record.salary.totalSalary,
  });
  await db.insert(auditLogs).values({ action: "payslip.downloaded", actorUserId: session.id, entityId: record.salary.id, entityType: "salary" });
  return new NextResponse(Buffer.from(pdf), { headers: {
    "Cache-Control": "private, no-store", "Content-Disposition": `attachment; filename="payslip-${record.employee.employeeId}-${record.salary.periodStart}.pdf"`,
    "Content-Type": "application/pdf", "X-Content-Type-Options": "nosniff",
  } });
}
