import { LeaveRequestForm } from "@/components/forms/leave-request-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NewLeavePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Submit a new leave request with date range and reason."
        title="Request Leave"
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <LeaveRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
