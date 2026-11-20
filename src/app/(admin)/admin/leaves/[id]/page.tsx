import { notFound } from "next/navigation";
import { ReviewLeavePanel } from "@/components/shared/review-leave-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { leaveTypeLabels } from "@/lib/constants";
import { getLeaveApprovalHistory, getLeaveDetails } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type LeaveDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeaveDetailPage({ params }: LeaveDetailPageProps) {
  const { id } = await params;
  const [leave, history] = await Promise.all([getLeaveDetails(id), getLeaveApprovalHistory(id)]);

  if (!leave) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Inspect the full leave request before approving or rejecting it."
        title="Leave Request Detail"
      />

      <div className="content-grid">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar alt={leave.employeeName} size="lg" src={leave.employeeImageUrl} />
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Employee</p>
                  <p className="font-semibold text-slate-900">{leave.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Employee ID</p>
                  <p className="font-semibold text-slate-900">{leave.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Leave Type</p>
                  <p className="font-semibold text-slate-900">
                    {leaveTypeLabels[leave.leaveType]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="font-semibold text-slate-900">{leave.departmentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Start Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(leave.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">End Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(leave.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Days</p>
                  <p className="font-semibold text-slate-900">{leave.totalDays}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <StatusChip label={leave.status} />
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">Reason</p>
                  <p className="font-semibold text-slate-900">{leave.reason}</p>
                </div>
                {leave.adminNote ? (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500">Admin Note</p>
                    <p className="font-semibold text-slate-900">{leave.adminNote}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Request</CardTitle>
          </CardHeader>
          <CardContent>
            {leave.status === "pending" ? (
              <ReviewLeavePanel leaveId={leave.id} />
            ) : (
              <p className="text-sm text-slate-500">
                This leave request has already been reviewed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card><CardHeader><CardTitle>Approval history</CardTitle></CardHeader><CardContent className="space-y-3">{history.length ? history.map((item) => <div className="rounded-xl border p-4" key={item.id}><div className="flex justify-between gap-3"><span className="font-semibold">{item.fromStatus} → {item.toStatus}</span><span className="text-sm text-muted">{formatDate(item.createdAt, "MMM d, yyyy h:mm a")}</span></div><p className="mt-1 text-sm text-muted">{item.actorName ?? "System"}{item.exceptionApproved ? " · Exception approved" : ""}</p>{item.note ? <p className="mt-2">{item.note}</p> : null}</div>) : <p className="text-sm text-muted">No decision history recorded for this request.</p>}</CardContent></Card>
    </div>
  );
}
