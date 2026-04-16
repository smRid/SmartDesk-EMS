"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateEmployeeProfileAction } from "@/lib/actions";
import {
  employeeProfileSchema,
  type EmployeeProfileInput,
} from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { maritalStatusLabels, MARITAL_STATUS_OPTIONS } from "@/lib/constants";

export function EmployeeProfileForm({
  defaultValues,
}: {
  defaultValues: EmployeeProfileInput;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmployeeProfileInput>({
    defaultValues,
    resolver: zodResolver(employeeProfileSchema),
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const payload = new FormData();
      Object.entries(values).forEach(([key, value]) => payload.append(key, `${value}`));

      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      const result = await updateEmployeeProfileAction(payload);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof EmployeeProfileInput, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...form.register("name")} />
          <FormError message={form.formState.errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
          <FormError message={form.formState.errors.phone?.message} />
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
          <Label htmlFor="image">Profile Image</Label>
          <Input
            id="image"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...form.register("address")} />
        <FormError message={form.formState.errors.address?.message} />
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Update Profile"}
      </Button>
    </form>
  );
}
