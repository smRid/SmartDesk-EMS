"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions";
import { loginSchema, type LoginInput } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
    <form className="space-y-4.5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-[#344e68] dark:text-slate-200" htmlFor="email">
          Email address
        </Label>
        <Input
          aria-describedby={form.formState.errors.email ? "login-email-error" : undefined}
          aria-invalid={Boolean(form.formState.errors.email)}
          autoComplete="username"
          className="h-12 rounded-xl border-[#d7e4eb] bg-white px-4 text-[#17324d] shadow-none placeholder:text-[#8a9aac] focus-visible:border-[#149b91] focus-visible:ring-[#149b91]/20 dark:border-slate-600 dark:bg-[#102837] dark:text-white"
          id="email"
          placeholder="user@gmail.com"
          spellCheck={false}
          type="email"
          {...form.register("email")}
        />
        <FormError id="login-email-error" message={form.formState.errors.email?.message} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Label
            className="text-xs font-bold text-[#344e68] dark:text-slate-200"
            htmlFor="password"
          >
            Password
          </Label>
          <span className="text-right text-xs font-medium leading-4 text-[#698096] dark:text-slate-400 max-[359px]:hidden">
            Use your assigned credentials
          </span>
        </div>
        <div className="relative">
          <Input
            aria-describedby={form.formState.errors.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(form.formState.errors.password)}
            autoComplete="current-password"
            className="h-12 rounded-xl border-[#d7e4eb] bg-white px-4 pr-12 text-[#17324d] shadow-none placeholder:text-[#8a9aac] focus-visible:border-[#149b91] focus-visible:ring-[#149b91]/20 dark:border-slate-600 dark:bg-[#102837] dark:text-white"
            id="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            {...form.register("password")}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0.5 grid min-h-11 w-11 cursor-pointer place-items-center rounded-lg text-[#61788f] transition-colors hover:bg-[#e8f7f5] hover:text-[#087d73] focus-visible:ring-2 focus-visible:ring-[#149b91] dark:text-slate-300 dark:hover:bg-teal-950/60 dark:hover:text-teal-200"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="size-[1.05rem]" aria-hidden="true" />
            ) : (
              <Eye className="size-[1.05rem]" aria-hidden="true" />
            )}
          </button>
        </div>
        <FormError id="login-password-error" message={form.formState.errors.password?.message} />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-[#f2faf9] px-3 py-2.5 text-xs leading-4 text-[#587086] dark:bg-teal-950/30 dark:text-slate-300">
        <LockKeyhole className="size-3.5 shrink-0 text-[#149b91]" aria-hidden="true" />
        Your session is encrypted and automatically protected.
      </div>

      <Button
        className="h-12 w-full rounded-xl bg-gradient-to-r from-[#087d73] to-[#075f60] text-sm text-white shadow-[0_10px_24px_-12px_rgba(7,95,96,0.85)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:from-[#076c65] hover:to-[#064f51] hover:shadow-[0_14px_28px_-12px_rgba(7,95,96,0.9)] motion-reduce:transition-none"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in..." : "Sign in"}
        {!isPending && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
