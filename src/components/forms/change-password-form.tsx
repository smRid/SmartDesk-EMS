"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/actions";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ChangePasswordInput>({
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
      oldPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await changePasswordAction(values);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof ChangePasswordInput, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);
      form.reset();
      if (result.redirectTo) router.push(result.redirectTo);
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="oldPassword">Old Password</Label>
        <Input
          id="oldPassword"
          placeholder="Current password"
          type="password"
          {...form.register("oldPassword")}
        />
        <FormError message={form.formState.errors.oldPassword?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          placeholder="New password"
          type="password"
          {...form.register("newPassword")}
        />
        <FormError message={form.formState.errors.newPassword?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          placeholder="Confirm password"
          type="password"
          {...form.register("confirmPassword")}
        />
        <FormError message={form.formState.errors.confirmPassword?.message} />
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}
