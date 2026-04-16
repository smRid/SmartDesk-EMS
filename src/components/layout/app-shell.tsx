import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import type { NavItem } from "@/lib/constants";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
  items: NavItem[];
  session: SessionUser;
};

export function AppShell({ children, items, session }: AppShellProps) {
  return (
    <div className="min-h-screen bg-shell lg:flex">
      <Sidebar items={items} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar session={session} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
