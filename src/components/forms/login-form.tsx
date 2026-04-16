"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/form-error";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await loginAction(values);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof LoginInput, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);

      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="user@gmail.com"
          type="email"
          {...form.register("email")}
        />
        <FormError message={form.formState.errors.email?.message} />
      </div>

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

      <div className="flex items-center justify-between text-sm text-slate-500">
        <label className="flex items-center gap-2">
          <input className="rounded border-slate-300" type="checkbox" />
          <span>Remember me</span>
        </label>
        <span>Forgot password?</span>
      </div>

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
