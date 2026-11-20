import Link from "next/link";
import { Download, Search } from "lucide-react";
import { DeleteEmployeeButton } from "@/components/shared/delete-employee-button";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusChip } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDepartmentOptions, getEmployeesList } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const sorts = ["newest", "oldest", "name-asc", "name-desc"] as const;

export default async function EmployeesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const departmentId = normaliseSearchParam(params.department, "all");
  const status = normaliseSearchParam(params.status, "all");
  const rawSort = normaliseSearchParam(params.sort, "newest");
  const sort = sorts.includes(rawSort as (typeof sorts)[number]) ? rawSort as (typeof sorts)[number] : "newest";
  const page = Math.max(Number.parseInt(normaliseSearchParam(params.page, "1"), 10) || 1, 1);
  const pageSize = [10, 20, 50].includes(Number(normaliseSearchParam(params.pageSize))) ? Number(normaliseSearchParam(params.pageSize)) : 10;
  const [departments, result] = await Promise.all([
    getDepartmentOptions(),
    getEmployeesList({ departmentId, page, pageSize, query, sort, status }),
  ]);
  const sharedParams = () => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (departmentId !== "all") next.set("department", departmentId);
    if (status !== "all") next.set("status", status);
    if (sort !== "newest") next.set("sort", sort);
    if (pageSize !== 10) next.set("pageSize", String(pageSize));
    return next;
  };
  const pageHref = (value: number) => {
    const next = sharedParams();
    next.set("page", String(value));
    return `/admin/employees?${next}`;
  };
  const exportParams = sharedParams();
  const first = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const last = Math.min(result.page * result.pageSize, result.total);

  return <div className="space-y-6">
    <PageHeader action={<Button asChild><Link href="/admin/employees/new">Add New Employee</Link></Button>} description="Search, filter, sort, and manage access without losing historical records." breadcrumbs={<Breadcrumbs items={[{ label: "Employees" }]} />} eyebrow="People operations" title="Manage Employees" />
    <SearchFilterBar method="GET">
      <div className="relative min-w-56 flex-1"><label className="sr-only" htmlFor="employee-search">Search employees</label><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" defaultValue={query} id="employee-search" name="q" placeholder="Name or employee ID" /></div>
      <Select className="md:w-48" defaultValue={departmentId} name="department" aria-label="Department"><option value="all">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
      <Select className="md:w-40" defaultValue={status} name="status" aria-label="Status"><option value="all">All statuses</option><option value="active">Active</option><option value="on_leave">On leave</option><option value="inactive">Inactive</option></Select>
      <Select className="md:w-44" defaultValue={sort} name="sort" aria-label="Sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></Select>
      <Select className="md:w-32" defaultValue={String(pageSize)} name="pageSize" aria-label="Rows per page"><option value="10">10 rows</option><option value="20">20 rows</option><option value="50">50 rows</option></Select>
      <Button type="submit" variant="outline">Apply</Button>
      <Button asChild variant="secondary"><a href={`/admin/employees/export?${exportParams}`}><Download className="size-4" />Export CSV</a></Button>
    </SearchFilterBar>
    {result.items.length === 0 ? <EmptyState action={<Button asChild><Link href="/admin/employees/new">Create an employee</Link></Button>} description="No employee matched the current filters." title="No employees found" /> :
      <DataTableShell description={`Showing ${first}–${last} of ${result.total} employees`} title="Employee directory" footer={<div className="flex items-center justify-between gap-4"><span>Page {result.page} of {result.totalPages}</span><div className="flex gap-2">{result.page > 1 ? <Button asChild size="sm" variant="outline"><Link href={pageHref(result.page - 1)}>Previous</Link></Button> : <Button disabled size="sm" variant="outline">Previous</Button>}{result.page < result.totalPages ? <Button asChild size="sm" variant="outline"><Link href={pageHref(result.page + 1)}>Next</Link></Button> : <Button disabled size="sm" variant="outline">Next</Button>}</div></div>}>
        <Table><caption className="sr-only">Employee directory results</caption><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Employee</TableHead><TableHead>ID</TableHead><TableHead>Department</TableHead><TableHead>Designation</TableHead><TableHead>Status</TableHead><TableHead>Date of birth</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{result.items.map((employee, index) => <TableRow key={employee.employeeRecordId}><TableCell>{first + index}</TableCell><TableCell><div className="flex items-center gap-3"><Avatar alt={employee.name} src={employee.imageUrl} /><span className="font-semibold text-slate-900">{employee.name}</span></div></TableCell><TableCell>{employee.employeeCode}</TableCell><TableCell>{employee.departmentName}</TableCell><TableCell>{employee.designation}</TableCell><TableCell><StatusChip label={employee.status.replace("_", " ")} /></TableCell><TableCell>{formatDate(employee.dob)}</TableCell><TableCell><details className="relative"><summary className="cursor-pointer list-none rounded-lg border px-3 py-2 font-semibold">Actions</summary><div className="absolute right-0 z-20 mt-2 flex w-44 flex-col gap-1 rounded-xl border bg-white p-2 shadow-xl dark:bg-slate-900"><Link className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href={`/admin/employees/${employee.employeeRecordId}`}>View details</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href={`/admin/employees/${employee.employeeRecordId}/edit`}>Edit profile</Link><DeleteEmployeeButton employeeRecordId={employee.employeeRecordId} isActive={employee.isActive} /></div></details></TableCell></TableRow>)}</TableBody>
        </Table>
      </DataTableShell>}
  </div>;
}
