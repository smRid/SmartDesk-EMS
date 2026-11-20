"use client";
import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ForgotPasswordForm() {
  const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const email = String(new FormData(event.currentTarget).get("email") ?? ""); startTransition(async () => setMessage((await forgotPasswordAction({ email })).message)); }}>
    <div className="space-y-2"><Label htmlFor="recovery-email">Work email</Label><Input autoComplete="email" id="recovery-email" name="email" required type="email" /></div>
    {message ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-muted" role="status">{message}</p> : null}
    <Button disabled={pending} type="submit">{pending ? "Submitting..." : "Send reset link"}</Button>
  </form>;
}
