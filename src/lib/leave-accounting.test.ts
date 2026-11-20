import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { availableLeaveBalance, canRequestLeave, countChargeableLeaveDays, dateRangesOverlap, getLeaveCycle } from "./leave-accounting.ts";

const policy = { excludeHolidays: true, excludeWeekends: true, weekendDays: [0, 6] };

test("counts leap-day working dates without timezone drift", () => {
  assert.equal(countChargeableLeaveDays({ startDate: "2028-02-28", endDate: "2028-03-01", policy }), 3);
});
test("excludes weekends and configured holidays", () => {
  assert.equal(countChargeableLeaveDays({ startDate: "2026-11-20", endDate: "2026-11-23", holidays: ["2026-11-23"], policy }), 1);
});
test("supports a half-day only on one working day", () => {
  assert.equal(countChargeableLeaveDays({ startDate: "2026-11-20", endDate: "2026-11-20", dayFraction: 0.5, policy }), 0.5);
  assert.throws(() => countChargeableLeaveDays({ startDate: "2026-11-21", endDate: "2026-11-21", dayFraction: 0.5, policy }));
});
test("detects touching and contained overlaps", () => {
  assert.equal(dateRangesOverlap("2026-01-01", "2026-01-03", "2026-01-03", "2026-01-04"), true);
  assert.equal(dateRangesOverlap("2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"), false);
});
test("computes calendar and anniversary cycles", () => {
  assert.deepEqual(getLeaveCycle("2026-02-10", "2022-06-29", "calendar_year"), { start: "2026-01-01", end: "2026-12-31" });
  assert.deepEqual(getLeaveCycle("2026-02-10", "2022-06-29", "anniversary_year"), { start: "2025-06-29", end: "2026-06-28" });
});
test("ledger reservations and releases are deterministic", () => {
  assert.equal(availableLeaveBalance([12, -3, 3, -3]), 9);
});
test("inactive accounts and inactive employment cannot request leave", () => {
  assert.equal(canRequestLeave(false, "active"), false);
  assert.equal(canRequestLeave(true, "inactive"), false);
  assert.equal(canRequestLeave(true, "on_leave"), true);
});
test("migration protects simultaneous decisions, balances, and overlaps", () => {
  const migration = readFileSync(new URL("../../drizzle/0001_leave_policy_ledger.sql", import.meta.url), "utf8");
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /leave_decision_history_guard/);
  assert.match(migration, /EXCLUDE USING gist/);
});
