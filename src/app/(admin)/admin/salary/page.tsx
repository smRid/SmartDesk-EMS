import Link from "next/link";
import { Search } from "lucide-react";
import { SalaryActions } from "@/components/salary/salary-actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import { Card, CardContent } from "@/components/ui/card";
import { APP_CURRENCY } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSalaryList } from "@/lib/queries";
import { formatCurrency, formatDate, normaliseSearchParam } from "@/lib/utils";

type SalaryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalaryPage({ searchParams }: SalaryPageProps) {
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const from = normaliseSearchParam(params.from);
  const to = normaliseSearchParam(params.to);
  const status = normaliseSearchParam(params.status, "all");
  const salaries = await getSalaryList({ from, query, status, to });
  const total = salaries.reduce((value, salary) => value + salary.totalSalary, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button asChild>
            <Link href="/admin/salary/new">Add Salary Entry</Link>
          </Button>
        }
        description="Track defined salary components through draft, approval, finalization, and payment."
        title="Salary Management"
      />

      <div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-muted">Entries</p><p className="text-3xl font-bold">{salaries.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted">Filtered net total</p><p className="text-2xl font-bold">{formatCurrency(total, { currency: APP_CURRENCY })}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted">Definition</p><p className="font-semibold">Basic + allowance - deduction</p></CardContent></Card></div>
      <form className="panel-card grid gap-3 p-4 md:grid-cols-5" method="GET">
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
        <Select defaultValue={status} name="status"><option value="all">All statuses</option><option value="draft">Draft</option><option value="approved">Approved</option><option value="finalized">Finalized</option><option value="paid">Paid</option></Select>
        <Button className="md:col-span-5 md:w-max" type="submit" variant="outline">
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
              <TableHead>Period</TableHead><TableHead>Basic</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Deduction</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaries.map((salary, index) => (
              <TableRow key={salary.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{salary.employeeCode}</TableCell>
                <TableCell>{formatDate(salary.periodStart)} - {formatDate(salary.periodEnd)}</TableCell>
                <TableCell>{formatCurrency(salary.basicSalary, { currency: salary.currency })}</TableCell>
                <TableCell>{formatCurrency(salary.allowance, { currency: salary.currency })}</TableCell>
                <TableCell>{formatCurrency(salary.deduction, { currency: salary.currency })}</TableCell>
                <TableCell>{formatCurrency(salary.totalSalary, { currency: salary.currency })}</TableCell>
                <TableCell>{formatDate(salary.payDate)}</TableCell>
                <TableCell><StatusChip label={salary.status} /></TableCell><TableCell><SalaryActions salaryId={salary.id} status={salary.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
