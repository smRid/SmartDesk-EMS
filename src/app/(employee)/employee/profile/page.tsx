import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeProfileForm } from "@/components/forms/employee-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { getEmployeeProfileData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function EmployeeProfilePage() {
  const session = await requireAuth("employee");
  const profile = await getEmployeeProfileData(session.id);

  if (!profile) {
    return (
      <EmptyState
        description="We could not find an employee profile linked to this account."
        title="Profile missing"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="View your profile summary and update the fields you are allowed to edit."
        title="My Profile"
      />

      <div className="content-grid">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <Avatar alt={profile.name} size="lg" src={profile.imageUrl} />
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-semibold text-slate-900">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Employee ID</p>
                  <p className="font-semibold text-slate-900">{profile.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="font-semibold text-slate-900">{profile.departmentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Designation</p>
                  <p className="font-semibold text-slate-900">{profile.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Joining Date</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(profile.joiningDate)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeProfileForm
              defaultValues={{
                address: profile.address,
                maritalStatus: profile.maritalStatus,
                name: profile.name,
                phone: profile.phone,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
