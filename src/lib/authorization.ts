import type { SessionUser } from "@/lib/auth";

export function canAccessEmployee(session: Pick<SessionUser, "employeeRecordId" | "role"> | null, employeeRecordId: string) {
  return Boolean(session && (session.role === "admin" || session.employeeRecordId === employeeRecordId));
}

export function isSessionVersionCurrent(tokenVersion: number, storedVersion: number, active: boolean) {
  return active && tokenVersion === storedVersion;
}

export function isResetTokenUsable(input: { active: boolean; expiresAt: Date; now: Date; usedAt: Date | null }) {
  return input.active && !input.usedAt && input.expiresAt.getTime() > input.now.getTime();
}
