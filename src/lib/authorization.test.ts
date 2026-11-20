import assert from "node:assert/strict";
import test from "node:test";
import { canAccessEmployee, isResetTokenUsable, isSessionVersionCurrent } from "./authorization.ts";

test("enforces admin, employee, unauthenticated, and cross-user scopes", () => {
  assert.equal(canAccessEmployee({ employeeRecordId: null, role: "admin" }, "employee-b"), true);
  assert.equal(canAccessEmployee({ employeeRecordId: "employee-a", role: "employee" }, "employee-a"), true);
  assert.equal(canAccessEmployee({ employeeRecordId: "employee-a", role: "employee" }, "employee-b"), false);
  assert.equal(canAccessEmployee(null, "employee-a"), false);
});
test("revokes disabled and version-stale sessions", () => {
  assert.equal(isSessionVersionCurrent(2, 2, true), true);
  assert.equal(isSessionVersionCurrent(1, 2, true), false);
  assert.equal(isSessionVersionCurrent(2, 2, false), false);
});
test("rejects reset replay and expiry", () => {
  const now = new Date("2026-11-20T00:00:00Z");
  assert.equal(isResetTokenUsable({ active: true, expiresAt: new Date("2026-11-20T00:01:00Z"), now, usedAt: null }), true);
  assert.equal(isResetTokenUsable({ active: true, expiresAt: new Date("2026-11-20T00:01:00Z"), now, usedAt: now }), false);
  assert.equal(isResetTokenUsable({ active: true, expiresAt: new Date("2026-11-19T23:59:00Z"), now, usedAt: null }), false);
});
