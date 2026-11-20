import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function ForgotPasswordPage() { return <Card className="w-full max-w-md"><CardHeader><CardTitle>Reset your password</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm text-muted">Enter your work email. The response is intentionally the same whether an account exists.</p><ForgotPasswordForm/><Link className="text-sm font-semibold text-accent-text" href="/login">Back to sign in</Link></CardContent></Card>; }
