import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Clock3,
  WalletCards,
  Users2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { leaveTypeLabels } from "@/lib/constants";
import { getAdminDashboardData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/employees/new">Add Employee</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/salary/new">Create Salary</Link>
            </Button>
          </div>
        }
        description="Keep an eye on staffing, payroll, and leave activity from one place."
        title="Admin Dashboard"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} title="Total Employees" value={data.totalEmployees} />
        <StatCard icon={Building2} title="Total Departments" value={data.totalDepartments} />
        <StatCard
          icon={WalletCards}
          title="Monthly Payroll"
          value={data.monthlyPayrollFormatted}
        />
        <StatCard icon={CalendarClock} title="Total Leave Requests" value={data.totalLeaves} />
        <StatCard icon={BadgeCheck} title="Approved Leaves" value={data.approvedLeaves} />
        <StatCard icon={Clock3} title="Pending Leaves" value={data.pendingLeaves} />
        <StatCard icon={XCircle} title="Rejected Leaves" value={data.rejectedLeaves} />
      </div>

      <div className="content-grid">
        <Card>
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentEmployees.map((employee) => (
                  <TableRow key={employee.employeeRecordId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar alt={employee.name} src={employee.imageUrl} />
                        <div>
                          <p className="font-medium text-slate-800">{employee.name}</p>
                          <p className="text-xs text-slate-500">{employee.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.employeeCode}</TableCell>
                    <TableCell>{employee.departmentName}</TableCell>
                    <TableCell>
                      <StatusChip label={employee.status.replace("_", " ")} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {data.departmentBreakdown.map((department) => (
                <div
                  key={department.label}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-800">{department.label}</p>
                    <p className="text-xs text-slate-500">Active employees</p>
                  </div>
                  <p className="text-xl font-semibold text-topbar">{department.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700">Salary Snapshot</h3>
              {data.salaryTrend.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-800">
                    {item.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-800">{leave.employeeName}</p>
                      <p className="text-xs text-slate-500">{leave.employeeCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>{leaveTypeLabels[leave.leaveType]}</TableCell>
                  <TableCell>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusChip label={leave.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
