import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calculateLateMinutes, calculateWorkedMinutes, isEligibleForAttendance, localDateKey, ownsAttendanceRecord, resolveShiftWorkDate } from "./attendance.ts";

test("uses the organization timezone across UTC midnight", () => {
  assert.equal(localDateKey(new Date("2026-11-20T19:30:00Z"), "Asia/Dhaka"), "2026-11-21");
});
test("keeps overnight worked time on elapsed UTC instants", () => {
  assert.equal(calculateWorkedMinutes(new Date("2026-11-20T16:00:00Z"), new Date("2026-11-21T01:00:00Z")), 540);
  assert.equal(resolveShiftWorkDate(new Date("2026-11-20T19:00:00Z"), "Asia/Dhaka", "06:00", true), "2026-11-20");
});
test("applies grace time when calculating lateness", () => {
  assert.equal(calculateLateMinutes(new Date("2026-11-20T03:25:00Z"), "09:00", 10, "Asia/Dhaka"), 15);
});
test("handles a DST boundary using real instants", () => {
  assert.equal(calculateWorkedMinutes(new Date("2026-11-01T05:30:00Z"), new Date("2026-11-01T07:30:00Z")), 120);
  assert.equal(localDateKey(new Date("2026-11-01T05:30:00Z"), "America/New_York"), "2026-11-01");
});
test("blocks inactive employees", () => {
  assert.equal(isEligibleForAttendance(false, "active"), false);
  assert.equal(isEligibleForAttendance(true, "inactive"), false);
});
test("blocks cross-employee record access", () => {
  assert.equal(ownsAttendanceRecord("employee-a", "employee-b"), false);
  assert.equal(ownsAttendanceRecord("employee-a", "employee-a"), true);
});
test("migration enforces duplicate-punch and assignment concurrency", () => {
  const migration = readFileSync(new URL("../../drizzle/0002_attendance_and_shifts.sql", import.meta.url), "utf8");
  assert.match(migration, /attendance_records_one_open_idx/);
  assert.match(migration, /attendance_events_idempotency_idx/);
  assert.match(migration, /shift_assignments_no_overlap/);
});
