import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth";
import { employeeNavigation } from "@/lib/constants";

export default async function EmployeeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuth("employee");
  return (
    <AppShell items={employeeNavigation} session={session}>
      {children}
    </AppShell>
  );
}
