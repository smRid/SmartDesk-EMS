import { SalaryForm } from "@/components/forms/salary-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveEmployeeOptions, getDepartmentOptions } from "@/lib/queries";

export default async function NewSalaryPage() {
  const [departments, employees] = await Promise.all([
    getDepartmentOptions(),
    getActiveEmployeeOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create a new immutable payroll record for an employee."
        title="Add Salary Entry"
      />
      <Card>
        <CardContent className="pt-6">
          <SalaryForm departments={departments} employees={employees} />
        </CardContent>
      </Card>
    </div>
  );
}
