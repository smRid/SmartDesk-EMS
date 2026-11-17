"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Building2, CalendarDays, ChevronLeft, LayoutDashboard, PanelLeftOpen,
  Settings, UserCircle2, Users2, WalletCards, X, type LucideIcon,
} from "lucide-react";
import type { NavItem, NavIcon } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;
  items: NavItem[];
  mobileOpen: boolean;
  onCollapseToggle: () => void;
  onMobileClose: () => void;
};

const iconMap: Record<NavIcon, LucideIcon> = {
  building2: Building2, calendarDays: CalendarDays, layoutDashboard: LayoutDashboard,
  settings: Settings, userCircle2: UserCircle2, users2: Users2, walletCards: WalletCards,
};

function NavigationLinks({ collapsed = false, items, onNavigate }: { collapsed?: boolean; items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace navigation" className="flex flex-1 flex-col gap-1.5">
      <p className={cn("mb-2 px-3 text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-slate-400", collapsed && "sr-only")}>Workspace</p>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = iconMap[item.icon];
        return (
          <Link
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              active && "bg-white/10 text-white", collapsed && "justify-center px-0",
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
          >
            <span aria-hidden="true" className={cn("absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-transparent", active && "bg-teal-300")} />
            <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" />
            <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="ArenaDesk dashboard" className={cn("flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 focus-visible:ring-2 focus-visible:ring-teal-300", compact && "justify-center px-0")} href="/">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-700 text-xs font-black tracking-tight text-white">AD</span>
      <span className={cn("min-w-0", compact && "sr-only")}>
        <span className="block truncate text-sm font-extrabold tracking-tight text-white">ArenaDesk</span>
        <span className="block truncate text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400">EMS workspace</span>
      </span>
    </Link>
  );
}

export function Sidebar({ collapsed, items, mobileOpen, onCollapseToggle, onMobileClose }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMobileClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden bg-sidebar px-3 py-4 text-white transition-[width] duration-200 motion-reduce:transition-none lg:flex", collapsed ? "w-20" : "w-64")}>
        <Brand compact={collapsed} />
        <div className="my-5 h-px bg-white/10" />
        <NavigationLinks collapsed={collapsed} items={items} />
        <button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-white/10 px-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300", collapsed && "justify-center px-0")} onClick={onCollapseToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} type="button">
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-[1.125rem]" /> : <ChevronLeft aria-hidden="true" className="size-[1.125rem]" />}
          <span className={collapsed ? "sr-only" : undefined}>Collapse sidebar</span>
        </button>
      </aside>

      <div className={cn("fixed inset-0 z-50 lg:hidden", !mobileOpen && "pointer-events-none invisible")}>
        <button aria-label="Close navigation" className={cn("absolute inset-0 bg-slate-950/55 transition-opacity motion-reduce:transition-none", mobileOpen ? "opacity-100" : "opacity-0")} onClick={onMobileClose} tabIndex={mobileOpen ? 0 : -1} type="button" />
        <aside aria-label="Mobile workspace navigation" aria-modal="true" className={cn("relative flex h-full w-[min(19rem,88vw)] flex-col bg-sidebar px-4 py-4 text-white shadow-2xl transition-transform duration-200 motion-reduce:transition-none", mobileOpen ? "translate-x-0" : "-translate-x-full")} id="mobile-navigation" ref={mobileDrawerRef} role="dialog">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1"><Brand /></div>
            <button aria-label="Close navigation" className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300" onClick={onMobileClose} ref={closeButtonRef} type="button"><X aria-hidden="true" className="size-5" /></button>
          </div>
          <div className="my-5 h-px bg-white/10" />
          <NavigationLinks items={items} onNavigate={onMobileClose} />
          <p className="border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">Navigation is limited to your assigned workspace.</p>
        </aside>
      </div>
    </>
  );
}
