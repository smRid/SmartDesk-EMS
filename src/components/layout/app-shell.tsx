"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        setCollapsed(window.localStorage.getItem("arenadesk-sidebar-collapsed") === "true");
      } catch {
        // Keep the expanded default when storage is unavailable.
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("arenadesk-sidebar-collapsed", String(next));
      } catch {
        // The control still works for the current page when storage is unavailable.
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-shell lg:flex">
      <a className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-xl transition-transform focus:translate-y-0 dark:bg-slate-900 dark:text-white" href="#main-content">
        Skip to main content
      </a>
      <Sidebar collapsed={collapsed} items={items} mobileOpen={mobileOpen} onCollapseToggle={toggleCollapsed} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar items={items} mobileMenuOpen={mobileOpen} onMobileMenuOpen={() => setMobileOpen(true)} session={session} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8" id="main-content" tabIndex={-1}>
          <div className="mx-auto w-full max-w-[100rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
