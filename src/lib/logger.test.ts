import assert from "node:assert/strict";
import test from "node:test";
import { createLogRecord } from "./logger.ts";

test("redacts sensitive structured logging fields", () => {
  const record = createLogRecord("error", "test.failed", {
    authorization: "Bearer private",
    nested: { password: "private", safe: "visible" },
    tokenHash: "private",
  });
  assert.equal(record.authorization, "[REDACTED]");
  assert.deepEqual(record.nested, { password: "[REDACTED]", safe: "visible" });
  assert.equal(record.tokenHash, "[REDACTED]");
});

test("redacts bearer values and database parameters embedded in errors", () => {
  const record = createLogRecord("error", "test.failed", {
    error: new Error("Failed query\nparams: private-value,another-value\nAuthorization: Bearer private-token"),
  });
  assert.match(JSON.stringify(record), /params: \[REDACTED\]/);
  assert.doesNotMatch(JSON.stringify(record), /private-value|private-token/);
});
