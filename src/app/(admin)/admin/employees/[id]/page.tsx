import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteEmployeeButton } from "@/components/shared/delete-employee-button";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmployeeActivity, getEmployeeDetails } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const tabs = ["overview", "employment", "leave", "salary", "activity"] as const;
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default async function EmployeeDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const requested = normaliseSearchParam((await searchParams).tab, "overview");
  const tab = tabs.includes(requested as (typeof tabs)[number]) ? requested as (typeof tabs)[number] : "overview";
  const [employee, activity] = await Promise.all([getEmployeeDetails(id), getEmployeeActivity(id)]);
  if (!employee) notFound();
  const fields = [
    ["Name", employee.name], ["Employee ID", employee.employeeCode], ["Email", employee.email],
    ["Phone", employee.phone], ["Date of birth", formatDate(employee.dob)], ["Gender", label(employee.gender)],
    ["Marital status", label(employee.maritalStatus)], ["Address", employee.address],
  ];

  return <div className="space-y-6">
    <PageHeader action={<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={`/admin/employees/${id}/edit`}>Edit profile</Link></Button><DeleteEmployeeButton employeeRecordId={id} isActive={employee.isActive} /></div>} description={`${employee.employeeCode} · ${employee.departmentName} · ${employee.designation}`} title={employee.name} />
    <Card><CardContent className="pt-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><Avatar alt={employee.name} size="lg" src={employee.imageUrl} /><div><h2 className="text-2xl font-bold text-slate-900">{employee.name}</h2><p className="text-muted">{employee.email}</p><div className="mt-2"><StatusChip label={employee.status.replace("_", " ")} /></div></div></div></CardContent></Card>
    <nav aria-label="Employee detail sections" className="flex gap-2 overflow-x-auto border-b pb-2">
      {tabs.map((item) => <Button asChild key={item} size="sm" variant={tab === item ? "default" : "ghost"}><Link href={`/admin/employees/${id}?tab=${item}`}>{label(item)}</Link></Button>)}
    </nav>
    {tab === "overview" ? <Card><CardHeader><CardTitle>Profile overview</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">{fields.map(([name, value]) => <div key={name}><p className="text-sm text-muted">{name}</p><p className="font-semibold text-slate-900">{value}</p></div>)}</CardContent></Card> : null}
    {tab === "employment" ? <Card><CardHeader><CardTitle>Employment</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">{[["Department", employee.departmentName], ["Designation", employee.designation], ["Joining date", formatDate(employee.joiningDate)], ["Account access", employee.isActive ? "Enabled" : "Disabled"], ["Employment status", label(employee.status)], ["Role", label(employee.role)]].map(([name, value]) => <div key={name}><p className="text-sm text-muted">{name}</p><p className="font-semibold text-slate-900">{value}</p></div>)}</CardContent></Card> : null}
    {tab === "leave" ? <Card><CardHeader><CardTitle>Recent leave requests ({employee.leaveCount})</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Dates</TableHead><TableHead>Type</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{employee.recentLeaves.map((leave) => <TableRow key={leave.id}><TableCell>{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</TableCell><TableCell>{label(leave.leaveType)}</TableCell><TableCell>{leave.totalDays}</TableCell><TableCell><StatusChip label={leave.status} /></TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : null}
    {tab === "salary" ? <Card><CardHeader><CardTitle>Salary history</CardTitle></CardHeader><CardContent><div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-sm text-muted">Current base salary</p><p className="text-2xl font-bold">{employee.baseSalary.toLocaleString()}</p></div><Table><TableHeader><TableRow><TableHead>Pay date</TableHead><TableHead>Basic</TableHead><TableHead>Allowance</TableHead><TableHead>Deduction</TableHead><TableHead>Total</TableHead></TableRow></TableHeader><TableBody>{employee.recentSalaries.map((salary) => <TableRow key={salary.id}><TableCell>{formatDate(salary.payDate)}</TableCell><TableCell>{salary.basicSalary}</TableCell><TableCell>{salary.allowance}</TableCell><TableCell>{salary.deduction}</TableCell><TableCell>{salary.totalSalary}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : null}
    {tab === "activity" ? <Card><CardHeader><CardTitle>Activity</CardTitle></CardHeader><CardContent className="space-y-3">{activity.length ? activity.map((item) => <div className="flex items-center justify-between gap-4 rounded-xl border p-4" key={item.id}><span className="font-medium">{label(item.action.replace("employee.", ""))}</span><time className="text-sm text-muted">{formatDate(item.createdAt, "MMM d, yyyy h:mm a")}</time></div>) : <p className="text-muted">No recorded activity.</p>}</CardContent></Card> : null}
  </div>;
}
