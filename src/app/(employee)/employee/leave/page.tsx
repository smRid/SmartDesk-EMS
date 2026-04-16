import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { StatusChip } from "@/components/ui/status-chip";
import { requireAuth } from "@/lib/auth";
import { LEAVE_STATUSES, leaveTypeLabels } from "@/lib/constants";
import { getLeaveList } from "@/lib/queries";
import { formatDate, normaliseSearchParam } from "@/lib/utils";

type EmployeeLeavePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmployeeLeavePage({
  searchParams,
}: EmployeeLeavePageProps) {
  const session = await requireAuth("employee");
  const params = await searchParams;
  const query = normaliseSearchParam(params.q);
  const status = normaliseSearchParam(params.status, "all");
  const leaves = await getLeaveList({
    employeeRecordId: session.employeeRecordId ?? undefined,
    query,
    status,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button asChild>
            <Link href="/employee/leave/new">Create Leave Request</Link>
          </Button>
        }
        description="View your leave history and submit new requests."
        title="Leave"
      />

      <form className="panel-card flex flex-col gap-3 p-4 md:flex-row" method="GET">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            defaultValue={query}
            name="q"
            placeholder="Search by leave type or status"
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
          action={
            <Button asChild>
              <Link href="/employee/leave/new">Request Leave</Link>
            </Button>
          }
          description="No leave request matched the current filters."
          title="No leave requests found"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leaveTypeLabels[leave.leaveType]}</TableCell>
                <TableCell>{formatDate(leave.startDate)}</TableCell>
                <TableCell>{formatDate(leave.endDate)}</TableCell>
                <TableCell>{leave.totalDays}</TableCell>
                <TableCell>
                  <StatusChip label={leave.status} />
                </TableCell>
                <TableCell>{leave.adminNote ?? "--"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
