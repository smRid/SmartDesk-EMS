import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normaliseSearchParam } from "@/lib/utils";
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const token = normaliseSearchParam((await searchParams).token); return <Card className="w-full max-w-md"><CardHeader><CardTitle>Choose a new password</CardTitle></CardHeader><CardContent><ResetPasswordForm token={token}/></CardContent></Card>; }
