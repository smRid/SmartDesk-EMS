import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { getEmployeeDetails } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;
  const employee = await getEmployeeDetails(id);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Full employee record, recent leave requests, and salary history."
        title="Employee Details"
      />

      <div className="content-grid">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <Avatar alt={employee.name} size="lg" src={employee.imageUrl} />
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-semibold text-slate-900">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Employee ID</p>
                  <p className="font-semibold text-slate-900">{employee.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="font-semibold text-slate-900">{formatDate(employee.dob)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gender</p>
                  <p className="font-semibold text-slate-900">{employee.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="font-semibold text-slate-900">{employee.departmentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Designation</p>
                  <p className="font-semibold text-slate-900">{employee.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Marital Status</p>
                  <p className="font-semibold text-slate-900">{employee.maritalStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-900">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Joining Date</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(employee.joiningDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <StatusChip label={employee.status.replace("_", " ")} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-semibold text-slate-900">{employee.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Current Salary</p>
              <p className="text-2xl font-semibold text-slate-900">
                {employee.baseSalary.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Leave Requests</p>
              <p className="text-2xl font-semibold text-slate-900">{employee.leaveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Salary History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Date</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowance</TableHead>
                <TableHead>Deduction</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employee.recentSalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>{formatDate(salary.payDate)}</TableCell>
                  <TableCell>{salary.basicSalary}</TableCell>
                  <TableCell>{salary.allowance}</TableCell>
                  <TableCell>{salary.deduction}</TableCell>
                  <TableCell>{salary.totalSalary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
