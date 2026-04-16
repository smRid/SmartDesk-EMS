"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateAdminProfileAction } from "@/lib/actions";
import {
  adminProfileSchema,
  type AdminProfileInput,
} from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminProfileForm({ defaultValues }: { defaultValues: AdminProfileInput }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<AdminProfileInput>({
    defaultValues,
    resolver: zodResolver(adminProfileSchema),
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateAdminProfileAction(values);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof AdminProfileInput, {
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
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...form.register("name")} />
        <FormError message={form.formState.errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        <FormError message={form.formState.errors.email?.message} />
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Update Profile"}
      </Button>
    </form>
  );
}
