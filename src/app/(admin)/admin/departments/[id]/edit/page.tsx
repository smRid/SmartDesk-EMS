import { notFound } from "next/navigation";
import { DepartmentForm } from "@/components/forms/department-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getDepartmentsList } from "@/lib/queries";

type EditDepartmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDepartmentPage({
  params,
}: EditDepartmentPageProps) {
  const { id } = await params;
  const departments = await getDepartmentsList();
  const department = departments.find((item) => item.id === id);

  if (!department) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Update the department name or its description."
        title="Edit Department"
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <DepartmentForm
            defaultValues={{
              description: department.description ?? "",
              name: department.name,
            }}
            departmentId={department.id}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
