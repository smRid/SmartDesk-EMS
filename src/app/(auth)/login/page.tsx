import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession, getDashboardRedirect } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getDashboardRedirect(session.role));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-shell">
      <div className="absolute inset-x-0 top-0 h-[42%] bg-topbar" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center text-white">
            <p className="font-logo text-5xl">Employee Management System</p>
          </div>

          <Card className="rounded-sm border-slate-100 shadow-2xl shadow-slate-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl">Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
