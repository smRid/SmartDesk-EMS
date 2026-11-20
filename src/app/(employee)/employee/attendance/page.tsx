import { PunchControls } from "@/components/attendance/punch-controls";
import { CorrectionForm } from "@/components/attendance/correction-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAuth } from "@/lib/auth";
import { getEmployeeAttendanceData } from "@/lib/queries";
import { normaliseSearchParam } from "@/lib/utils";

const time = (value: Date | null, zone: string) => value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: zone }).format(value) : "Missing punch";

export default async function EmployeeAttendancePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAuth("employee");
  if (!session.employeeRecordId) return null;
  const month = normaliseSearchParam((await searchParams).month, new Date().toISOString().slice(0, 7));
  const data = await getEmployeeAttendanceData(session.employeeRecordId, month);
  return <div className="space-y-6">
    <PageHeader description="Punch times come from the server. Your device clock and location are not collected." title="My Attendance" />
    <div className="content-grid"><Card><CardHeader><CardTitle>Today’s status</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted">{data.open ? `Checked in at ${time(data.open.checkInAt, data.open.timezone)}` : "No open attendance session."}</p><PunchControls hasOpenSession={Boolean(data.open)} /></CardContent></Card><Card><CardHeader><CardTitle>Month summary</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.records.length}</p><p className="text-sm text-muted">attendance record(s)</p></CardContent></Card></div>
    <form className="panel-card flex gap-3 p-4" method="GET"><Input aria-label="Attendance month" defaultValue={month} name="month" type="month" /><Button type="submit" variant="outline">View month</Button></form>
    <Table><TableHeader><TableRow><TableHead>Work date</TableHead><TableHead>Check in</TableHead><TableHead>Check out</TableHead><TableHead>Worked</TableHead><TableHead>Late</TableHead><TableHead>Status</TableHead><TableHead>Correction</TableHead></TableRow></TableHeader><TableBody>{data.records.map((record) => <TableRow key={record.id}><TableCell>{record.workDate}</TableCell><TableCell>{time(record.checkInAt, record.timezone)}</TableCell><TableCell>{time(record.checkOutAt, record.timezone)}</TableCell><TableCell>{record.workedMinutes == null ? "--" : `${record.workedMinutes} min`}</TableCell><TableCell>{record.lateMinutes} min</TableCell><TableCell><StatusChip label={record.status.replace("_", " ")} /></TableCell><TableCell><CorrectionForm recordId={record.id} /></TableCell></TableRow>)}</TableBody></Table>
    {data.adjustments.length ? <Card><CardHeader><CardTitle>Correction history</CardTitle></CardHeader><CardContent className="space-y-2">{data.adjustments.map((item) => <div className="rounded-xl border p-3" key={item.id}><StatusChip label={item.status} /> <span className="ml-2 text-sm">{item.reason}</span></div>)}</CardContent></Card> : null}
  </div>;
}
