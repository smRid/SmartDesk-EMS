import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth";
import { adminNavigation } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuth("admin");
  return (
    <AppShell items={adminNavigation} session={session}>
      {children}
    </AppShell>
  );
}
