import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your account security."
        title="Settings"
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
