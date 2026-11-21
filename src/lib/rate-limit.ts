import "server-only";

import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { authRateLimits } from "@/db/schema";
import { mergeRateLimitOutcomes, rateLimitOutcome } from "@/lib/security-policy";

const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

export async function checkRateLimit(
  key: string,
  options?: { limit?: number; windowMs?: number },
) {
  const limit = options?.limit ?? 5;
  const windowMs = options?.windowMs ?? 5 * 60 * 1000;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const [entry] = await db.insert(authRateLimits).values({
    count: 1, keyHash: hashKey(key), resetAt, updatedAt: now,
  }).onConflictDoUpdate({
    target: authRateLimits.keyHash,
    set: {
      count: sql`case when ${authRateLimits.resetAt} <= ${now} then 1 else ${authRateLimits.count} + 1 end`,
      resetAt: sql`case when ${authRateLimits.resetAt} <= ${now} then ${resetAt} else ${authRateLimits.resetAt} end`,
      updatedAt: now,
    },
  }).returning({ count: authRateLimits.count, resetAt: authRateLimits.resetAt });
  return rateLimitOutcome(entry.count, limit, entry.resetAt, now);
}

export async function checkRateLimits(
  keys: string[],
  options?: { limit?: number; windowMs?: number },
) {
  const outcomes = await Promise.all(keys.map((key) => checkRateLimit(key, options)));
  return mergeRateLimitOutcomes(outcomes);
}

export async function clearRateLimit(key: string) {
  await db.delete(authRateLimits).where(eq(authRateLimits.keyHash, hashKey(key)));
}
