import assert from "node:assert/strict";
import test from "node:test";
import { calculateLeaveDays, formatDate, getInitials, normaliseSearchParam, parseAmount } from "./utils.ts";

test("handles date, amount, initials, and URL parameter edge cases", () => {
  assert.equal(calculateLeaveDays("2024-02-28", "2024-03-01"), 3);
  assert.equal(formatDate("not-a-date"), "--");
  assert.equal(parseAmount("12.50"), 12.5);
  assert.equal(parseAmount("invalid"), 0);
  assert.equal(getInitials("  Ada   Lovelace Byron "), "AL");
  assert.equal(normaliseSearchParam(["first", "second"]), "first");
});
