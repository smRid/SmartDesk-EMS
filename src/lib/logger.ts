const SENSITIVE_KEY = /(authorization|cookie|password|secret|token|database_url|api_key)/i;

function redactText(value: string) {
  return value
    .replace(/(bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(params:\s*)[^\n]+/gi, "$1[REDACTED]");
}

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      stack: value.stack ? redactText(value.stack) : undefined,
    };
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  if (typeof value === "string") return redactText(value);
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    SENSITIVE_KEY.test(key) ? "[REDACTED]" : redact(item, seen),
  ]));
}

export function createLogRecord(
  level: "error" | "info" | "warn",
  event: string,
  details: Record<string, unknown> = {},
): Record<string, unknown> & { event: string; level: string; timestamp: string } {
  return {
    ...redact(details) as Record<string, unknown>,
    event,
    level,
    timestamp: new Date().toISOString(),
  };
}

export function logError(event: string, details: Record<string, unknown> = {}) {
  console.error(JSON.stringify(createLogRecord("error", event, details)));
}

export function logInfo(event: string, details: Record<string, unknown> = {}) {
  console.info(JSON.stringify(createLogRecord("info", event, details)));
}
