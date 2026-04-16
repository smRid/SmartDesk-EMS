import { DepartmentForm } from "@/components/forms/department-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NewDepartmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Add a new business unit for employees, payroll, and reporting."
        title="Add New Department"
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <DepartmentForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
