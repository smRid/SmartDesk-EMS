import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Clock3,
  UserPlus,
  Users2,
  WalletCards,
  XCircle,
} from "lucide-react";
import { LeaveActivityChart } from "@/components/dashboard/leave-activity-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leaveTypeLabels } from "@/lib/constants";
import { getAdminDashboardData } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type AdminDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const months = normaliseSearchParam(params.months) === "12" ? 12 : 6;
  const data = await getAdminDashboardData(months);
  const trendHasData = data.leaveTrend.some(
    (point) => point.pending + point.approved + point.rejected > 0,
  );
  const largestDepartment = Math.max(1, ...data.departmentBreakdown.map((item) => item.value));
  const hasActiveDepartmentMembers = data.departmentBreakdown.some((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <>
            <Button asChild><Link href="/admin/employees/new">Add employee</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/leaves?status=pending">Review leave queue</Link></Button>
          </>
        }
        description="Live workforce, leave, and salary-record signals with explicit reporting scopes."
        eyebrow="Operations briefing"
        title="Admin dashboard"
      />

      <section aria-labelledby="workforce-summary-title" className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white" id="workforce-summary-title">Workforce summary</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active employees and departments are current snapshots; leave outcomes are all-time; salary records are scoped to {data.currentMonthLabel}.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard description="Active account and employment status" icon={Users2} title="Active employees" value={data.activeEmployees} />
          <StatCard description="Configured business units" icon={Building2} title="Departments" value={data.totalDepartments} />
          <StatCard description="Awaiting an admin decision" icon={Clock3} title="Pending leave" value={data.pendingLeaves} variant="warning" />
          <StatCard description="All-time requests" icon={BadgeCheck} title="Approved leave" value={data.approvedLeaves} variant="success" />
          <StatCard description="All-time requests" icon={XCircle} title="Rejected leave" value={data.rejectedLeaves} variant="danger" />
          <StatCard
            description={`${data.salaryRecordCount} record${data.salaryRecordCount === 1 ? "" : "s"} dated this month`}
            icon={WalletCards}
            title="Salary-record total"
            value={data.salaryRecordTotalFormatted}
          />
        </div>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)]">
        <SectionCard
          action={
            <form className="flex flex-wrap items-center gap-2" method="GET">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="trend-months">Trend window</label>
              <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" defaultValue={String(data.months)} id="trend-months" name="months">
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
              <Button size="sm" type="submit" variant="outline">Apply</Button>
            </form>
          }
          description={`Requests grouped by application month across the last ${data.months} calendar months.`}
          title="Leave activity"
        >
          {trendHasData ? <LeaveActivityChart data={data.leaveTrend} /> : (
            <EmptyState
              action={<Button asChild variant="outline"><Link href="/admin/leaves">Open leave requests</Link></Button>}
              description={`No leave requests were submitted in the last ${data.months} months.`}
              icon={CalendarClock}
              title="No leave activity in this window"
            />
          )}
        </SectionCard>

        <SectionCard action={<Button asChild size="sm" variant="ghost"><Link href="/admin/departments">Manage</Link></Button>} description="Active employees with active accounts." title="Department distribution">
          {data.departmentBreakdown.length && hasActiveDepartmentMembers ? (
            <div className="space-y-4">
              {data.departmentBreakdown.map((department) => (
                <div className="space-y-2" key={department.id}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate font-semibold text-slate-700 dark:text-slate-200">{department.label}</span>
                    <span className="font-bold tabular-nums text-slate-950 dark:text-white">{department.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800">
                    <div aria-hidden="true" className="h-full rounded-sm bg-teal-700" style={{ width: `${(department.value / largestDepartment) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {data.departmentBreakdown.length
                ? "Departments are configured, but none currently have active employees with active accounts."
                : "No departments are configured."}
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        action={<Button asChild size="sm" variant="outline"><Link href="/admin/leaves?status=pending">View queue</Link></Button>}
        description="The five most recently submitted requests still awaiting a decision."
        title="Pending leave actions"
      >
        {data.pendingLeaveRows.length ? (
          <Table>
            <caption className="sr-only">Five most recently submitted pending leave requests</caption>
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Days</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.pendingLeaveRows.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell><p className="font-semibold text-slate-900 dark:text-white">{leave.employeeName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{leave.employeeCode}</p></TableCell>
                  <TableCell>{leaveTypeLabels[leave.leaveType]}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</TableCell>
                  <TableCell>{leave.totalDays}</TableCell>
                  <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/leaves/${leave.id}`}>Review</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <EmptyState description="Every submitted leave request has already received a decision." icon={BadgeCheck} title="Leave queue is clear" />}
      </SectionCard>

      <SectionCard action={<Button asChild size="sm" variant="ghost"><Link href="/admin/employees">View directory</Link></Button>} description="Five active accounts with the latest joining dates." title="Recent employee joins">
        {data.recentEmployees.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {data.recentEmployees.map((employee) => (
              <Link className="group flex min-w-0 items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50 focus-visible:ring-2 focus-visible:ring-ring dark:hover:border-teal-800 dark:hover:bg-teal-950/20" href={`/admin/employees/${employee.employeeRecordId}`} key={employee.employeeRecordId}>
                <Avatar alt={employee.name} src={employee.imageUrl} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-teal-800 dark:text-white dark:group-hover:text-teal-300">{employee.name}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{employee.designation}</span>
                  <span className="mt-1 block text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">Joined {formatDate(employee.joiningDate)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState action={<Button asChild><Link href="/admin/employees/new">Add employee</Link></Button>} description="No active employee accounts are available yet." icon={UserPlus} title="No employees to show" />
        )}
      </SectionCard>
    </div>
  );
}
