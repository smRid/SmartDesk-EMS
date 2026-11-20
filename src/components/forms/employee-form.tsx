"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createEmployeeAction,
  updateEmployeeAction,
} from "@/lib/actions";
import {
  employmentStatusLabels,
  EMPLOYMENT_STATUSES,
  genderLabels,
  GENDER_OPTIONS,
  maritalStatusLabels,
  MARITAL_STATUS_OPTIONS,
  USER_ROLES,
} from "@/lib/constants";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeUpdateInput,
} from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type EmployeeFormValues = EmployeeUpdateInput & {
  password?: string;
};

type EmployeeFormProps = {
  defaultValues?: EmployeeFormValues;
  departments: { id: string; name: string }[];
  employeeRecordId?: string;
  mode: "create" | "edit";
};

const createDefaults: EmployeeFormValues = {
  address: "",
  baseSalary: 0,
  departmentId: "",
  designation: "",
  dob: "",
  email: "",
  employeeId: "",
  gender: "male",
  joiningDate: "",
  maritalStatus: "single",
  name: "",
  password: "",
  phone: "",
  role: "employee",
  status: "active",
};

export function EmployeeForm({
  defaultValues,
  departments,
  employeeRecordId,
  mode,
}: EmployeeFormProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmployeeFormValues>({
    defaultValues: defaultValues ?? createDefaults,
    resolver: zodResolver(
      mode === "create" ? employeeCreateSchema : employeeUpdateSchema,
    ) as never,
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const payload = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          payload.append(key, `${value}`);
        }
      });

      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      const result =
        mode === "create"
          ? await createEmployeeAction(payload)
          : await updateEmployeeAction(employeeRecordId!, payload);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof EmployeeFormValues, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo ?? "/admin/employees");
      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <section aria-labelledby="identity-employment-heading" className="space-y-4 rounded-2xl border p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white" id="identity-employment-heading">Identity and employment</h2>
        <p className="text-sm text-muted">Account, personal, role, department, and compensation details.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Insert Name" {...form.register("name")} />
          <FormError message={form.formState.errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="Insert Email" {...form.register("email")} />
          <FormError message={form.formState.errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input id="employeeId" placeholder="Employee ID" {...form.register("employeeId")} />
          <FormError message={form.formState.errors.employeeId?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input id="dob" type="date" {...form.register("dob")} />
          <FormError message={form.formState.errors.dob?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" {...form.register("gender")}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {genderLabels[option]}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.gender?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select id="maritalStatus" {...form.register("maritalStatus")}>
            {MARITAL_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {maritalStatusLabels[option]}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.maritalStatus?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            placeholder="Designation"
            {...form.register("designation")}
          />
          <FormError message={form.formState.errors.designation?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select id="departmentId" {...form.register("departmentId")}>
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.departmentId?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseSalary">Salary</Label>
          <Input id="baseSalary" type="number" {...form.register("baseSalary")} />
          <FormError message={form.formState.errors.baseSalary?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="Phone number" {...form.register("phone")} />
          <FormError message={form.formState.errors.phone?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input id="joiningDate" type="date" {...form.register("joiningDate")} />
          <FormError message={form.formState.errors.joiningDate?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select id="role" {...form.register("role")}>
            {USER_ROLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.role?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...form.register("status")}>
            {EMPLOYMENT_STATUSES.map((option) => (
              <option key={option} value={option}>
                {employmentStatusLabels[option]}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.status?.message} />
        </div>

        {mode === "create" ? (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              {...form.register("password")}
            />
            <FormError message={form.formState.errors.password?.message} />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="image">Upload Image</Label>
          <Input
            id="image"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </div>
      </div>

      </section>

      <section aria-labelledby="contact-heading" className="space-y-4 rounded-2xl border p-5">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white" id="contact-heading">Contact details</h2><p className="text-sm text-muted">Keep the employee’s current contact information on file.</p></div>
        <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" placeholder="Address" {...form.register("address")} /><FormError message={form.formState.errors.address?.message} /></div>
      </section>

      <Button disabled={isPending} type="submit">
        {isPending
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
            ? "Add Employee"
            : "Update Employee"}
      </Button>
    </form>
  );
}
