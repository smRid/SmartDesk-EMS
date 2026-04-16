"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createDepartmentAction,
  updateDepartmentAction,
} from "@/lib/actions";
import { departmentSchema, type DepartmentInput } from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DepartmentFormProps = {
  defaultValues?: DepartmentInput;
  departmentId?: string;
  mode: "create" | "edit";
};

export function DepartmentForm({
  defaultValues,
  departmentId,
  mode,
}: DepartmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<DepartmentInput>({
    defaultValues: defaultValues ?? {
      description: "",
      name: "",
    },
    resolver: zodResolver(departmentSchema),
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createDepartmentAction(values)
          : await updateDepartmentAction(departmentId!, values);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof DepartmentInput, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo ?? "/admin/departments");
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Department Name</Label>
        <Input id="name" placeholder="Database" {...form.register("name")} />
        <FormError message={form.formState.errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Write a short description for this department."
          {...form.register("description")}
        />
        <FormError message={form.formState.errors.description?.message} />
      </div>

      <Button disabled={isPending} type="submit">
        {isPending
          ? mode === "create"
            ? "Saving..."
            : "Updating..."
          : mode === "create"
            ? "Add Department"
            : "Update Department"}
      </Button>
    </form>
  );
}
