type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  options?: {
    limit?: number;
    windowMs?: number;
  },
) {
  const limit = options?.limit ?? 5;
  const windowMs = options?.windowMs ?? 5 * 60 * 1000;
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt < now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: limit - 1,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  attempts.set(key, current);

  return {
    allowed: true,
    remaining: limit - current.count,
  };
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
