import Link from "next/link";
import { Search } from "lucide-react";
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
import { getSalaryList } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type SalaryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalaryPage({ searchParams }: SalaryPageProps) {
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const from = normaliseSearchParam(params.from);
  const to = normaliseSearchParam(params.to);
  const salaries = await getSalaryList({ from, query, to });

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button asChild>
            <Link href="/admin/salary/new">Add Salary Entry</Link>
          </Button>
        }
        description="Track payroll entries, allowances, deductions, and pay dates."
        title="Salary Management"
      />

      <form className="panel-card grid gap-3 p-4 md:grid-cols-4" method="GET">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            defaultValue={query}
            name="q"
            placeholder="Search by employee ID"
          />
        </div>
        <Input defaultValue={from} name="from" type="date" />
        <Input defaultValue={to} name="to" type="date" />
        <Button className="md:col-span-4 md:w-max" type="submit" variant="outline">
          Apply Filters
        </Button>
      </form>

      {salaries.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/admin/salary/new">Create Salary Record</Link>
            </Button>
          }
          description="No salary records matched the current filters."
          title="No salary records found"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Deduction</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pay Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaries.map((salary, index) => (
              <TableRow key={salary.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{salary.employeeCode}</TableCell>
                <TableCell>{salary.basicSalary}</TableCell>
                <TableCell>{salary.allowance}</TableCell>
                <TableCell>{salary.deduction}</TableCell>
                <TableCell>{salary.totalSalary}</TableCell>
                <TableCell>{formatDate(salary.payDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
