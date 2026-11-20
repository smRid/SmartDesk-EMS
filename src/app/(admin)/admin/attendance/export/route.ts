import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAdminAttendanceData } from "@/lib/queries";
import { checkRateLimit } from "@/lib/rate-limit";
const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET(request: Request) {
  const session = await requireAuth("admin");
  const rate = checkRateLimit(`attendance-export:${session.id}`, { limit: 3, windowMs: 60_000 });
  if (!rate.allowed) return NextResponse.json({ message: "Export limit reached." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter ?? 60) } });
  const url = new URL(request.url); const data = await getAdminAttendanceData({ date: url.searchParams.get("date") ?? "", month: url.searchParams.get("month") ?? "" });
  const body = [["Work date","Employee ID","Employee","Shift","Check in UTC","Check out UTC","Worked minutes","Late minutes","Status"], ...data.records.map((row) => [row.attendance.workDate,row.employeeCode,row.employeeName,row.shiftName,row.attendance.checkInAt.toISOString(),row.attendance.checkOutAt?.toISOString(),row.attendance.workedMinutes,row.attendance.lateMinutes,row.attendance.status])].map((row) => row.map(csv).join(",")).join("\r\n");
  return new NextResponse(body, { headers: { "Cache-Control": "private, no-store", "Content-Disposition": `attachment; filename="attendance-${new Date().toISOString().slice(0,10)}.csv"`, "Content-Type": "text/csv; charset=utf-8" } });
}
