export function rateLimitOutcome(count: number, limit: number, resetAt: Date, now: Date) {
  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfter: allowed ? undefined : Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
  };
}

export function safeCsvCell(value: unknown) {
  const raw = String(value ?? "");
  const protectedValue = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${protectedValue.replaceAll('"', '""')}"`;
}
