import Link from "next/link";
import { Search } from "lucide-react";
import { DeleteEmployeeButton } from "@/components/shared/delete-employee-button";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDepartmentOptions, getEmployeesList } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const departmentId = normaliseSearchParam(params.department, "all");
  const [departmentOptions, employees] = await Promise.all([
    getDepartmentOptions(),
    getEmployeesList({
      departmentId,
      query,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button asChild>
            <Link href="/admin/employees/new">Add New Employee</Link>
          </Button>
        }
        description="Search by employee ID or name, then drill into each profile."
        title="Manage Employees"
      />

      <form className="panel-card flex flex-col gap-3 p-4 md:flex-row" method="GET">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            defaultValue={query}
            name="q"
            placeholder="Search by Employee ID"
          />
        </div>
        <Select className="md:w-56" defaultValue={departmentId} name="department">
          <option value="all">All Departments</option>
          {departmentOptions.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {employees.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/admin/employees/new">Create the first employee</Link>
            </Button>
          }
          description="No employee matched the current search or filter."
          title="No employees found"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S No</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow key={employee.employeeRecordId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Avatar alt={employee.name} src={employee.imageUrl} />
                </TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.employeeCode}</TableCell>
                <TableCell>{formatDate(employee.dob)}</TableCell>
                <TableCell>{employee.departmentName}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/employees/${employee.employeeRecordId}`}>View</Link>
                    </Button>
                    <Button asChild size="sm" variant="success">
                      <Link href={`/admin/employees/${employee.employeeRecordId}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="warning">
                      <Link href={`/admin/salary?q=${employee.employeeCode}`}>Salary</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/leaves?q=${employee.employeeCode}`}>Leave</Link>
                    </Button>
                    <DeleteEmployeeButton employeeRecordId={employee.employeeRecordId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
