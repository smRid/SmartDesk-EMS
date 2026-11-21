import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { authRateLimits, passwordResetTokens, users } from "@/db/schema";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();
  try {
    await Promise.all([
      db.execute(sql`select 1`),
      db.select({ id: users.id }).from(users).limit(0),
      db.select({ keyHash: authRateLimits.keyHash }).from(authRateLimits).limit(0),
      db.select({ id: passwordResetTokens.id }).from(passwordResetTokens).limit(0),
    ]);
    return NextResponse.json({
      database: "reachable",
      latencyMs: Math.round(performance.now() - startedAt),
      status: "ok",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logError("health.database_unreachable", { error });
    return NextResponse.json({ database: "unreachable", status: "degraded" }, {
      headers: { "Cache-Control": "no-store" },
      status: 503,
    });
  }
}
