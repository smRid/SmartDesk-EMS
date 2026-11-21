"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [authenticationError, setAuthenticationError] = useState("");
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
    setAuthenticationError("");
    startTransition(async () => {
      const result = await loginAction(values);

      if (result.status === "error") {
        setAuthenticationError(result.message);
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
    <form
      aria-describedby={authenticationError ? "login-authentication-error" : undefined}
      className="space-y-5"
      noValidate
      onSubmit={onSubmit}
    >
      {authenticationError ? (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200"
          id="login-authentication-error"
          role="alert"
        >
          {authenticationError}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-[#344e68] dark:text-slate-200" htmlFor="email">
          <Mail className="size-4" aria-hidden="true" /> Email address
        </Label>
        <Input
          aria-describedby={form.formState.errors.email ? "login-email-error" : undefined}
          aria-invalid={Boolean(form.formState.errors.email)}
          autoComplete="username"
          className="h-13 rounded-xl border-[#d7e4eb] bg-white px-4 text-[#17324d] shadow-none placeholder:text-[#8a9aac] focus-visible:border-[#149b91] focus-visible:ring-[#149b91]/20 dark:border-slate-600 dark:bg-[#102837] dark:text-white"
          id="email"
          placeholder="name@company.com"
          spellCheck={false}
          type="email"
          {...form.register("email")}
        />
        <FormError id="login-email-error" message={form.formState.errors.email?.message} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[#344e68] dark:text-slate-200" htmlFor="password">
            <LockKeyhole className="size-4" aria-hidden="true" /> Password
          </Label>
          <Link className="text-xs font-semibold text-[#078f83] hover:text-[#066d65] hover:underline dark:text-teal-300" href="/forgot-password">Forgot password?</Link>
        </div>
        <div className="relative">
          <Input
            aria-describedby={form.formState.errors.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(form.formState.errors.password)}
            autoComplete="current-password"
            className="h-13 rounded-xl border-[#d7e4eb] bg-white px-4 pr-12 text-[#17324d] shadow-none placeholder:text-[#8a9aac] focus-visible:border-[#149b91] focus-visible:ring-[#149b91]/20 dark:border-slate-600 dark:bg-[#102837] dark:text-white"
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

      <div className="flex items-center gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
        <LockKeyhole
          className="size-3.5 shrink-0 text-teal-700 dark:text-teal-300"
          aria-hidden="true"
        />
        Access is limited by your assigned account role.
      </div>

      <Button
        aria-busy={isPending}
        className="h-13 w-full rounded-xl bg-[#078f83] text-sm font-extrabold text-white shadow-[0_14px_30px_-16px_rgba(7,143,131,0.9)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#087b72] hover:shadow-[0_18px_34px_-18px_rgba(7,143,131,0.95)] motion-reduce:transform-none motion-reduce:transition-none"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in..." : "Sign in"}
        {!isPending && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
