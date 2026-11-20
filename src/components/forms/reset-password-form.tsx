"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, startTransition] = useTransition();
  return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const password = String(new FormData(event.currentTarget).get("password") ?? ""); startTransition(async () => { const result = await resetPasswordAction({ password, token }); if (result.status === "success") router.push(result.redirectTo ?? "/login"); else setError(result.message); }); }}>
    <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input autoComplete="new-password" id="new-password" minLength={12} name="password" required type="password" /></div>
    <p className="text-xs text-muted">Use at least 12 characters with uppercase, lowercase, number, and symbol.</p>
    {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
    <Button disabled={pending} type="submit">{pending ? "Resetting..." : "Reset password"}</Button>
  </form>;
}
