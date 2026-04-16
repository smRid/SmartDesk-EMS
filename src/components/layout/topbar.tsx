import { LogoutButton } from "@/components/shared/logout-button";
import type { SessionUser } from "@/lib/auth";
import { getWelcomeText } from "@/lib/utils";

export function Topbar({ session }: { session: SessionUser }) {
  return (
    <header className="flex h-20 items-center justify-between bg-topbar px-5 text-white shadow-sm lg:px-8">
      <div className="space-y-1">
        <p className="text-lg font-semibold">{getWelcomeText(session.name, session.role)}</p>
        <p className="text-sm text-white/80">
          {session.designation ?? "Employee Management System"}
        </p>
      </div>
      <LogoutButton />
    </header>
  );
}
