"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/constants";
import { APP_LOGO } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: NavItem[];
};

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-[270px] shrink-0 bg-sidebar px-4 py-6 text-white lg:flex lg:flex-col">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-5">
          <p className="font-logo text-4xl text-white">{APP_LOGO}</p>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/8 hover:text-white",
                  active && "bg-sidebar-accent text-white shadow-lg shadow-black/15",
                )}
                href={item.href}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:hidden">
        <div className="overflow-x-auto border-b border-slate-200 bg-sidebar px-4 py-3">
          <div className="flex min-w-max items-center gap-2">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/80",
                    active && "bg-sidebar-accent text-white",
                  )}
                  href={item.href}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
