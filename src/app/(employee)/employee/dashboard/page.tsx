import { CalendarClock, CheckCircle2, WalletCards, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { requireAuth } from "@/lib/auth";
import { leaveTypeLabels } from "@/lib/constants";
import { getEmployeeDashboardData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function EmployeeDashboardPage() {
  const session = await requireAuth("employee");
  const data = await getEmployeeDashboardData(session.id);

  if (!data) {
    return (
      <EmptyState
        description="We could not find an employee profile linked to this account."
        title="Profile missing"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Track your leave activity, payroll history, and profile summary."
        title="Employee Dashboard"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar alt={data.profile.name} size="lg" src={data.profile.imageUrl} />
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Welcome Back
                <br />
                {data.profile.name.split(" ")[0]}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {data.profile.designation} · {data.profile.departmentName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarClock} title="Pending Leaves" value={data.pendingLeaves} />
        <StatCard icon={CheckCircle2} title="Approved Leaves" value={data.approvedLeaves} />
        <StatCard icon={XCircle} title="Rejected Leaves" value={data.rejectedLeaves} />
        <StatCard icon={WalletCards} title="Latest Salary" value={data.latestSalary} />
      </div>

      <div className="content-grid">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leaveTypeLabels[leave.leaveType]}</TableCell>
                    <TableCell>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <StatusChip label={leave.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>{formatDate(salary.payDate)}</TableCell>
                    <TableCell>{salary.totalSalary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
