import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { APP_CURRENCY } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAuth } from "@/lib/auth";
import { getSalaryList } from "@/lib/queries";
import { formatCurrency, formatDate, normaliseSearchParam } from "@/lib/utils";

type EmployeeSalaryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmployeeSalaryPage({
  searchParams,
}: EmployeeSalaryPageProps) {
  const session = await requireAuth("employee");
  const params = await searchParams;
  const from = normaliseSearchParam(params.from);
  const to = normaliseSearchParam(params.to);
  const salaries = await getSalaryList({
    employeeRecordId: session.employeeRecordId ?? undefined,
    from,
    publishedOnly: true,
    to,
  });
  const latest = salaries[0];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Review finalized salary periods, component breakdowns, and private payslips."
        title="Salary"
      />
      {latest ? <div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-muted">Latest net pay</p><p className="text-2xl font-bold">{formatCurrency(latest.totalSalary, { currency: latest.currency ?? APP_CURRENCY })}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted">Latest period</p><p className="font-semibold">{formatDate(latest.periodStart)} - {formatDate(latest.periodEnd)}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted">Salary definition</p><p className="font-semibold">Basic + allowance - deduction</p></CardContent></Card></div> : null}

      <form className="panel-card grid gap-3 p-4 md:grid-cols-2 lg:max-w-xl" method="GET">
        <Input defaultValue={from} name="from" type="date" />
        <Input defaultValue={to} name="to" type="date" />
        <Button className="md:col-span-2 md:w-max" type="submit" variant="outline">
          Apply Filter
        </Button>
      </form>

      {salaries.length === 0 ? (
        <EmptyState
          description="No salary records matched the selected date range."
          title="No salary records found"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead><TableHead>Pay Date</TableHead>
              <TableHead>Basic</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Deduction</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead><TableHead>Payslip</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaries.map((salary) => (
              <TableRow key={salary.id}>
                <TableCell>{formatDate(salary.periodStart)} - {formatDate(salary.periodEnd)}</TableCell><TableCell>{formatDate(salary.payDate)}</TableCell>
                <TableCell>{formatCurrency(salary.basicSalary, { currency: salary.currency })}</TableCell>
                <TableCell>{formatCurrency(salary.allowance, { currency: salary.currency })}</TableCell>
                <TableCell>{formatCurrency(salary.deduction, { currency: salary.currency })}</TableCell>
                <TableCell>{formatCurrency(salary.totalSalary, { currency: salary.currency })}</TableCell>
                <TableCell><StatusChip label={salary.status} /></TableCell><TableCell><Button asChild size="sm" variant="secondary"><a href={`/salary/${salary.id}/payslip`}>Download PDF</a></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
