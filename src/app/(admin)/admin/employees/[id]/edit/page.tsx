import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/forms/employee-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getDepartmentOptions, getEmployeeDetails } from "@/lib/queries";

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;
  const [departments, employee] = await Promise.all([
    getDepartmentOptions(),
    getEmployeeDetails(id),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Adjust employee profile details, role, department, and salary."
        title="Edit Employee"
      />
      <Card>
        <CardContent className="pt-6">
          <EmployeeForm
            defaultValues={{
              address: employee.address,
              baseSalary: employee.baseSalary,
              departmentId: employee.departmentId ?? "",
              designation: employee.designation,
              dob: employee.dob,
              email: employee.email,
              employeeId: employee.employeeCode,
              gender: employee.gender,
              joiningDate: employee.joiningDate,
              maritalStatus: employee.maritalStatus,
              name: employee.name,
              phone: employee.phone,
              role: employee.role,
              status: employee.status,
            }}
            departments={departments}
            employeeRecordId={employee.employeeRecordId}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
