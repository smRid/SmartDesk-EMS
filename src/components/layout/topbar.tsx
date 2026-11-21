"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/shared/logout-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { SessionUser } from "@/lib/auth";
import type { NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

function humanizeSegment(segment: string) {
  if (segment === "new") return "New";
  if (segment === "edit") return "Edit";
  if (/^[0-9a-f-]{20,}$/i.test(segment)) return "Details";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRouteContext(pathname: string, items: NavItem[]) {
  const root = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? items[0];
  const remainder = pathname.slice(root.href.length).split("/").filter(Boolean);
  const crumbs: Array<{ href?: string; label: string }> = [
    { href: root.href, label: root.label },
    ...remainder.map((segment) => ({ label: humanizeSegment(segment) })),
  ];
  return {
    crumbs,
  };
}

export function Topbar({ items, mobileMenuOpen, onMobileMenuOpen, session }: { items: NavItem[]; mobileMenuOpen: boolean; onMobileMenuOpen: () => void; session: SessionUser }) {
  const pathname = usePathname();
  const { crumbs } = getRouteContext(pathname, items);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    }
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const accountHref = session.role === "admin" ? "/admin/settings" : "/employee/profile";
  const settingsHref = session.role === "admin" ? "/admin/settings" : "/employee/settings";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-12 w-full max-w-[100rem] items-center gap-3">
        <button aria-controls="mobile-navigation" aria-expanded={mobileMenuOpen} aria-label="Open navigation" className="grid size-11 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden" onClick={onMobileMenuOpen} type="button">
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="hidden items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:flex">
            <Link className="rounded-sm hover:text-teal-800 focus-visible:ring-2 focus-visible:ring-teal-700 dark:hover:text-teal-300" href="/">Workspace</Link>
            {crumbs.map((crumb, index) => {
              const current = index === crumbs.length - 1;
              return (
                <span className="flex min-w-0 items-center gap-1" key={`${crumb.label}-${index}`}>
                  <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                  {crumb.href && !current ? (
                    <Link className="truncate rounded-sm hover:text-teal-800 focus-visible:ring-2 focus-visible:ring-teal-700 dark:hover:text-teal-300" href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={current ? "page" : undefined} className="truncate text-slate-700 dark:text-slate-200">{crumb.label}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <ThemeToggle className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" compact />
        <div className="relative" ref={menuRef}>
          <button aria-expanded={profileOpen} aria-haspopup="menu" aria-label={`Open profile menu for ${session.name}`} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 text-left hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800" onClick={() => setProfileOpen((open) => !open)} ref={profileButtonRef} type="button">
            <Avatar alt={session.name} size="sm" src={session.imageUrl} />
            <span className="hidden min-w-0 max-w-36 sm:block">
              <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{session.name}</span>
              <span className="block truncate text-[0.625rem] font-semibold capitalize text-slate-500 dark:text-slate-400">{session.role}</span>
            </span>
            <ChevronDown aria-hidden="true" className={cn("hidden size-4 text-slate-400 transition-transform sm:block", profileOpen && "rotate-180")} />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.6rem)] w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900" role="menu">
              <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                <p className="truncate text-sm font-extrabold text-slate-950 dark:text-white">{session.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{session.email}</p>
                <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-teal-800 dark:text-teal-300">
                  {session.designation ?? (session.role === "admin" ? "Administrator" : "Employee")}{session.departmentName ? ` · ${session.departmentName}` : ""}
                </p>
              </div>
              <div className="py-1">
                <Link className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-700 dark:text-slate-200 dark:hover:bg-slate-800" href={accountHref} onClick={() => setProfileOpen(false)} role="menuitem">
                  <UserRound aria-hidden="true" className="size-4" />{session.role === "admin" ? "Account profile" : "My profile"}
                </Link>
                {settingsHref !== accountHref ? (
                  <Link className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-700 dark:text-slate-200 dark:hover:bg-slate-800" href={settingsHref} onClick={() => setProfileOpen(false)} role="menuitem"><Settings aria-hidden="true" className="size-4" />Settings</Link>
                ) : null}
              </div>
              <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                <LogoutButton className="h-11 w-full justify-start bg-transparent text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-200" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
