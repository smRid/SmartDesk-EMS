import Link from "next/link";
import { CorrectionReview } from "@/components/attendance/correction-review";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignWorkShiftAction, createWorkShiftAction } from "@/lib/actions";
import { getActiveEmployeeOptions, getAdminAttendanceData } from "@/lib/queries";
import { normaliseSearchParam } from "@/lib/utils";

const stamp = (value: Date | null, zone: string) => value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: zone }).format(value) : "--";

export default async function AdminAttendancePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const date = normaliseSearchParam(params.date); const month = normaliseSearchParam(params.month);
  const [data, employeeOptions] = await Promise.all([getAdminAttendanceData({ date, month }), getActiveEmployeeOptions()]);
  async function createShift(formData: FormData) { "use server"; await createWorkShiftAction(formData); }
  async function assignShift(formData: FormData) { "use server"; await assignWorkShiftAction(formData); }
  const late = data.records.filter((row) => row.attendance.lateMinutes > 0).length;
  const missing = data.records.filter((row) => !row.attendance.checkOutAt).length;
  const exportQuery = new URLSearchParams(); if (date) exportQuery.set("date", date); if (month) exportQuery.set("month", month);
  return <div className="space-y-6">
    <PageHeader action={<Button asChild variant="secondary"><Link href={`/admin/attendance/export?${exportQuery}`}>Export CSV</Link></Button>} description="Monitor trusted punches, shift coverage, missing punches, and correction requests." title="Attendance Management" />
    <div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-muted">Records</p><p className="text-3xl font-bold">{data.records.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted">Late</p><p className="text-3xl font-bold">{late}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted">Missing checkout</p><p className="text-3xl font-bold">{missing}</p></CardContent></Card></div>
    <form className="panel-card flex flex-col gap-3 p-4 sm:flex-row" method="GET"><Input aria-label="Attendance day" defaultValue={date} name="date" type="date" /><Input aria-label="Attendance month" defaultValue={month} name="month" type="month" /><Button type="submit" variant="outline">Apply filters</Button></form>
    <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Employee</TableHead><TableHead>Shift</TableHead><TableHead>In</TableHead><TableHead>Out</TableHead><TableHead>Worked</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{data.records.map((row) => <TableRow key={row.attendance.id}><TableCell>{row.attendance.workDate}</TableCell><TableCell>{row.employeeName}<br/><span className="text-xs text-muted">{row.employeeCode}</span></TableCell><TableCell>{row.shiftName ?? "--"}</TableCell><TableCell>{stamp(row.attendance.checkInAt, row.attendance.timezone)}</TableCell><TableCell>{stamp(row.attendance.checkOutAt, row.attendance.timezone)}</TableCell><TableCell>{row.attendance.workedMinutes ?? "--"} min</TableCell><TableCell><StatusChip label={row.attendance.status.replace("_", " ")} /></TableCell></TableRow>)}</TableBody></Table>
    <div className="grid gap-6 xl:grid-cols-2"><Card><CardHeader><CardTitle>Create shift</CardTitle></CardHeader><CardContent><form action={createShift} className="grid gap-3 sm:grid-cols-2"><Input name="name" placeholder="Shift name" required /><Input defaultValue="Asia/Dhaka" name="timezone" placeholder="IANA timezone" required /><Input name="startTime" required type="time" /><Input name="endTime" required type="time" /><Input defaultValue="10" min="0" name="graceMinutes" type="number" /><Button type="submit">Create shift</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Assign shift</CardTitle></CardHeader><CardContent><form action={assignShift} className="grid gap-3 sm:grid-cols-2"><Select name="employeeId" required><option value="">Employee</option>{employeeOptions.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.employeeCode}</option>)}</Select><Select name="shiftId" required><option value="">Shift</option>{data.shifts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Input name="effectiveFrom" required type="date" /><Input name="effectiveTo" type="date" /><Button type="submit">Assign shift</Button></form></CardContent></Card></div>
    <Card><CardHeader><CardTitle>Pending corrections ({data.corrections.length})</CardTitle></CardHeader><CardContent className="space-y-4">{data.corrections.map((row) => <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_1fr]" key={row.adjustment.id}><div><p className="font-semibold">{row.employeeName} · {row.employeeCode}</p><p className="text-sm text-muted">{row.adjustment.reason}</p><p className="mt-2 text-sm">Requested in: {row.adjustment.requestedCheckInAt?.toISOString() ?? "unchanged"}<br/>Requested out: {row.adjustment.requestedCheckOutAt?.toISOString() ?? "unchanged"}</p></div><CorrectionReview adjustmentId={row.adjustment.id} /></div>)}</CardContent></Card>
  </div>;
}
