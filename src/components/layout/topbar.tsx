import { LogoutButton } from "@/components/shared/logout-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { SessionUser } from "@/lib/auth";
import { getWelcomeText } from "@/lib/utils";

export function Topbar({ session }: { session: SessionUser }) {
  return (
    <header className="flex min-h-20 items-center justify-between gap-4 bg-topbar px-5 py-4 text-white shadow-sm lg:px-8">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-lg font-semibold">
          {getWelcomeText(session.name, session.role)}
        </p>
        <p className="truncate text-sm text-white/80">
          {session.designation ?? "Employee Management System"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
