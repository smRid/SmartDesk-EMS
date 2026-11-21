export function rateLimitOutcome(count: number, limit: number, resetAt: Date, now: Date) {
  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfter: allowed ? undefined : Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
  };
}

export function mergeRateLimitOutcomes(
  outcomes: Array<{ allowed: boolean; remaining: number; retryAfter?: number }>,
) {
  const blocked = outcomes.filter((outcome) => !outcome.allowed);
  return {
    allowed: blocked.length === 0,
    remaining: Math.min(...outcomes.map((outcome) => outcome.remaining)),
    retryAfter: blocked.length
      ? Math.max(...blocked.map((outcome) => outcome.retryAfter ?? 1))
      : undefined,
  };
}

export function safeCsvCell(value: unknown) {
  const raw = String(value ?? "");
  const protectedValue = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${protectedValue.replaceAll('"', '""')}"`;
}
