import Link from "next/link";
import { Search } from "lucide-react";
import { DeleteDepartmentButton } from "@/components/shared/delete-department-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDepartmentsList } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type DepartmentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DepartmentsPage({
  searchParams,
}: DepartmentsPageProps) {
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const departments = await getDepartmentsList(query);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button asChild>
            <Link href="/admin/departments/new">Add New Department</Link>
          </Button>
        }
        description="Manage department metadata and keep assignments tidy."
        title="Manage Departments"
      />

      <form className="panel-card flex gap-3 p-4" method="GET">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            defaultValue={query}
            name="q"
            placeholder="Search by department"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {departments.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/admin/departments/new">Create Department</Link>
            </Button>
          }
          description="No departments matched the current filter."
          title="No departments found"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S No</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department, index) => (
              <TableRow key={department.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{department.name}</TableCell>
                <TableCell>{department.description}</TableCell>
                <TableCell>{department.employeeCount}</TableCell>
                <TableCell>{formatDate(department.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="success">
                      <Link href={`/admin/departments/${department.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteDepartmentButton departmentId={department.id} />
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
