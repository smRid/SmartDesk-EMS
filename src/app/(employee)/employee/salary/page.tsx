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
import { requireAuth } from "@/lib/auth";
import { getSalaryList } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

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
    to,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Review your personal salary history and pay dates."
        title="Salary"
      />

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
              <TableHead>Pay Date</TableHead>
              <TableHead>Basic</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Deduction</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaries.map((salary) => (
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
      )}
    </div>
  );
}
