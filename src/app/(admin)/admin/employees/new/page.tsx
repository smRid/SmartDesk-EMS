import { EmployeeForm } from "@/components/forms/employee-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getDepartmentOptions } from "@/lib/queries";

export default async function NewEmployeePage() {
  const departments = await getDepartmentOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create a new employee profile, assign a department, and set access."
        title="Add New Employee"
      />
      <Card>
        <CardContent className="pt-6">
          <EmployeeForm departments={departments} mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
