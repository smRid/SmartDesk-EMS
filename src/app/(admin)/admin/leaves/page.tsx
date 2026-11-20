import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LEAVE_STATUSES, leaveTypeLabels } from "@/lib/constants";
import { getLeaveList } from "@/lib/queries";
import { normaliseSearchParam } from "@/lib/utils";

type LeavesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeavesPage({ searchParams }: LeavesPageProps) {
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const status = normaliseSearchParam(params.status, "all");
  const leaves = await getLeaveList({ query, status });

  return (
    <div className="space-y-6">
      <PageHeader
        action={<Button asChild><Link href="/admin/leaves/policies">Policies & calendar</Link></Button>}
        description="Review pending leave requests and track historical decisions."
        title="Leave Management"
      />

      <form className="panel-card flex flex-col gap-3 p-4 md:flex-row" method="GET">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            defaultValue={query}
            name="q"
            placeholder="Search by employee ID"
          />
        </div>
        <Select className="md:w-56" defaultValue={status} name="status">
          <option value="all">All statuses</option>
          {LEAVE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {leaves.length === 0 ? (
        <EmptyState
          description="No leave requests matched the current filters."
          title="No leave requests found"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave, index) => (
              <TableRow key={leave.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{leave.employeeCode}</TableCell>
                <TableCell>{leave.employeeName}</TableCell>
                <TableCell>{leaveTypeLabels[leave.leaveType]}</TableCell>
                <TableCell>{leave.departmentName}</TableCell>
                <TableCell>{leave.totalDays}</TableCell>
                <TableCell>
                  <StatusChip label={leave.status} />
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/leaves/${leave.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
