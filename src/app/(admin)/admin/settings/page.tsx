import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { AdminProfileForm } from "@/components/forms/admin-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { getAdminProfileData } from "@/lib/queries";

export default async function AdminSettingsPage() {
  const session = await requireAuth("admin");
  const profile = await getAdminProfileData(session.id);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Update your admin identity and security settings."
        title="Admin Settings"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Basics</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminProfileForm
              defaultValues={{
                email: profile?.email ?? session.email,
                name: profile?.name ?? session.name,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
