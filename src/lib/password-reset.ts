import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";

export const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function deliverPasswordReset(email: string, resetUrl: string) {
  if (!env.PASSWORD_RESET_DELIVERY_URL || !env.PASSWORD_RESET_DELIVERY_SECRET) return false;
  const response = await fetch(env.PASSWORD_RESET_DELIVERY_URL, {
    body: JSON.stringify({ email, resetUrl, template: "smartdesk-password-reset" }),
    headers: { "Authorization": `Bearer ${env.PASSWORD_RESET_DELIVERY_SECRET}`, "Content-Type": "application/json" },
    method: "POST", signal: AbortSignal.timeout(8_000),
  });
  return response.ok;
}
