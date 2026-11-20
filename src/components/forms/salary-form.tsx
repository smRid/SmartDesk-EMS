"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createSalaryAction } from "@/lib/actions";
import { APP_CURRENCY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { salarySchema, type SalaryInput } from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type SalaryFormProps = {
  departments: { id: string; name: string }[];
  employees: {
    departmentId: string;
    employeeCode: string;
    id: string;
    name: string;
  }[];
};

export function SalaryForm({ departments, employees }: SalaryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<SalaryInput>({
    defaultValues: {
      allowance: 0,
      basicSalary: 0,
      deduction: 0,
      departmentId: departments[0]?.id ?? "",
      employeeId: "",
      payDate: "",
      periodEnd: "",
      periodStart: "",
    },
    resolver: zodResolver(salarySchema) as never,
  });

  const selectedDepartment = useWatch({
    control: form.control,
    name: "departmentId",
  });
  const filteredEmployees = employees.filter(
    (employee) => employee.departmentId === selectedDepartment,
  );
  const basicSalary = useWatch({
    control: form.control,
    name: "basicSalary",
  });
  const allowance = useWatch({
    control: form.control,
    name: "allowance",
  });
  const deduction = useWatch({
    control: form.control,
    name: "deduction",
  });
  const totalSalary =
    Number(basicSalary || 0) + Number(allowance || 0) - Number(deduction || 0);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createSalaryAction(values);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof SalaryInput, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo ?? "/admin/salary");
      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="periodStart">Period Start</Label>
          <Input id="periodStart" type="date" {...form.register("periodStart")} />
          <FormError message={form.formState.errors.periodStart?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="periodEnd">Period End</Label>
          <Input id="periodEnd" type="date" {...form.register("periodEnd")} />
          <FormError message={form.formState.errors.periodEnd?.message} />
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
          <Label htmlFor="employeeId">Employee</Label>
          <Select id="employeeId" {...form.register("employeeId")}>
            <option value="">Select Employee</option>
            {filteredEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeCode} - {employee.name}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.employeeId?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="basicSalary">Basic Salary</Label>
          <Input id="basicSalary" step="0.01" type="number" {...form.register("basicSalary")} />
          <FormError message={form.formState.errors.basicSalary?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowance">Allowance</Label>
          <Input id="allowance" step="0.01" type="number" {...form.register("allowance")} />
          <FormError message={form.formState.errors.allowance?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deduction">Deduction</Label>
          <Input id="deduction" step="0.01" type="number" {...form.register("deduction")} />
          <FormError message={form.formState.errors.deduction?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payDate">Pay Date</Label>
          <Input id="payDate" type="date" {...form.register("payDate")} />
          <FormError message={form.formState.errors.payDate?.message} />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-topbar/30 bg-topbar/5 px-4 py-3 text-sm text-slate-600 dark:bg-topbar/10 dark:text-slate-300">
        Total salary preview:{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(totalSalary, { currency: APP_CURRENCY })}
        </span>
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save Salary Record"}
      </Button>
    </form>
  );
}
