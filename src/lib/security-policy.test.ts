import assert from "node:assert/strict";
import test from "node:test";
import { mergeRateLimitOutcomes, rateLimitOutcome, safeCsvCell } from "./security-policy.ts";

test("enforces brute-force cooldown after the configured attempt limit", () => {
  const now = new Date("2026-11-20T00:00:00Z"); const reset = new Date("2026-11-20T00:15:00Z");
  assert.equal(rateLimitOutcome(5, 5, reset, now).allowed, true);
  assert.deepEqual(rateLimitOutcome(6, 5, reset, now), { allowed: false, remaining: 0, retryAfter: 900 });
});
test("blocks when either the client or account cooldown is exceeded", () => {
  assert.deepEqual(mergeRateLimitOutcomes([
    { allowed: true, remaining: 3 },
    { allowed: false, remaining: 0, retryAfter: 120 },
  ]), { allowed: false, remaining: 0, retryAfter: 120 });
});
test("neutralizes spreadsheet formula injection", () => {
  assert.equal(safeCsvCell("=cmd|test"), "\"'=cmd|test\"");
  assert.equal(safeCsvCell("ordinary"), "\"ordinary\"");
});
