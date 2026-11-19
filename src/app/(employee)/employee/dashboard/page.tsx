import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  FilePenLine,
  Plus,
  WalletCards,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { leaveTypeLabels } from "@/lib/constants";
import { getEmployeeDashboardData } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type EmployeeDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmployeeDashboardPage({ searchParams }: EmployeeDashboardPageProps) {
  const params = await searchParams;
  const requestedYear = normaliseSearchParam(params.year);
  const data = await getEmployeeDashboardData(requestedYear || undefined);

  if (!data) {
    return <EmptyState description="We could not find an employee profile linked to this account." title="Profile missing" />;
  }

  const scopeLabel = data.selectedYear === "all" ? "All available years" : `Calendar year ${data.selectedYear}`;

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <form className="flex flex-wrap items-center gap-2" method="GET">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="dashboard-year">Dashboard scope</label>
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" defaultValue={data.selectedYear} id="dashboard-year" name="year">
              {data.availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
              <option value="all">All years</option>
            </select>
            <Button size="sm" type="submit" variant="outline">Apply</Button>
          </form>
        }
        description="Your own profile, leave requests, and salary records in one focused view."
        eyebrow="Personal workspace"
        title={`Welcome, ${data.profile.name.split(" ")[0]}`}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.4fr)]">
        <SectionCard className="bg-slate-950 text-white dark:bg-slate-900" contentClassName="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar alt={data.profile.name} className="ring-4 ring-white/10" size="lg" src={data.profile.imageUrl} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-300">Employee profile</p>
              <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-white">{data.profile.name}</h2>
              <p className="mt-1 text-sm text-slate-300">{data.profile.designation} · {data.profile.departmentName}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Employee ID: {data.profile.employeeCode}</p>
            </div>
            <Button asChild className="border-white/20 bg-white/10 text-white hover:bg-white/15" variant="outline">
              <Link href="/employee/profile"><FilePenLine aria-hidden="true" className="size-4" />Edit profile</Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard description="Eight existing fields, not job performance." title="Profile completeness">
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-950 dark:text-white">{data.profileCompletion}%</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{data.profileFieldsCompleted} of {data.profileFieldsTotal} fields</span>
            </div>
            <div aria-label={`${data.profileCompletion}% profile fields complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={data.profileCompletion} className="h-2.5 overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800" role="progressbar">
              <div className="h-full rounded-sm bg-teal-700" style={{ width: `${data.profileCompletion}%` }} />
            </div>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Name, email, phone, address, department, designation, date of birth, and profile image.</p>
          </div>
        </SectionCard>
      </section>

      <section aria-labelledby="personal-summary-title" className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white" id="personal-summary-title">Personal summary</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{scopeLabel}. Leave status uses request start date; salary uses record pay date.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard description={scopeLabel} icon={CalendarClock} title="Pending leave" value={data.pendingLeaves} variant="warning" />
          <StatCard description={scopeLabel} icon={CheckCircle2} title="Approved leave" value={data.approvedLeaves} variant="success" />
          <StatCard description={scopeLabel} icon={XCircle} title="Rejected leave" value={data.rejectedLeaves} variant="danger" />
          <StatCard
            description={data.latestSalary ? `Record dated ${formatDate(data.latestSalary.payDate)}` : `No record in ${scopeLabel.toLowerCase()}`}
            icon={WalletCards}
            title="Latest salary record"
            value={data.latestSalary?.formatted ?? "—"}
          />
        </div>
      </section>

      <SectionCard description="Common tasks available to your account." title="Quick actions">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Button asChild className="justify-start" variant="outline"><Link href="/employee/leave/new"><Plus aria-hidden="true" className="size-4" />Request leave</Link></Button>
          <Button asChild className="justify-start" variant="outline"><Link href="/employee/profile"><CircleUserRound aria-hidden="true" className="size-4" />Edit profile</Link></Button>
          <Button asChild className="justify-start" variant="outline"><Link href="/employee/leave"><CalendarClock aria-hidden="true" className="size-4" />View leave history</Link></Button>
          <Button asChild className="justify-start" variant="outline"><Link href="/employee/salary"><WalletCards aria-hidden="true" className="size-4" />View salary history</Link></Button>
        </div>
      </SectionCard>

      <div className="content-grid">
        <SectionCard action={<Button asChild size="sm" variant="ghost"><Link href="/employee/leave">View all</Link></Button>} description={scopeLabel} title="Recent leave requests">
          {data.recentLeaves.length ? (
            <Table className="min-w-[38rem]">
              <caption className="sr-only">Your five most recent leave requests in the selected scope</caption>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.recentLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leaveTypeLabels[leave.leaveType]}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell><StatusChip label={leave.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState action={<Button asChild><Link href="/employee/leave/new">Request leave</Link></Button>} description={`You have no leave requests in ${scopeLabel.toLowerCase()}.`} icon={CalendarClock} title="No leave requests" />
          )}
        </SectionCard>

        <SectionCard action={<Button asChild size="sm" variant="ghost"><Link href="/employee/salary">View all</Link></Button>} description={scopeLabel} title="Recent salary records">
          {data.recentSalaries.length ? (
            <div className="space-y-3">
              {data.recentSalaries.map((salary) => (
                <div className="rounded-xl border border-line p-4" key={salary.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pay date</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{formatDate(salary.payDate)}</p></div>
                    <p className="text-lg font-bold tabular-nums text-slate-950 dark:text-white">{salary.totalFormatted}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Basic<br /><strong className="text-slate-700 dark:text-slate-200">{salary.basicFormatted}</strong></span>
                    <span className="text-slate-500 dark:text-slate-400">Allowance<br /><strong className="text-slate-700 dark:text-slate-200">{salary.allowanceFormatted}</strong></span>
                    <span className="text-slate-500 dark:text-slate-400">Deduction<br /><strong className="text-slate-700 dark:text-slate-200">{salary.deductionFormatted}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description={`No salary records are dated within ${scopeLabel.toLowerCase()}.`} icon={WalletCards} title="No salary records" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
