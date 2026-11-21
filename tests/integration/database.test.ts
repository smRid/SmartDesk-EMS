import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test("isolated database supports a user write/read/delete lifecycle", { skip: !testDatabaseUrl }, async () => {
  assert.ok(testDatabaseUrl, "TEST_DATABASE_URL must be set");
  assert.notEqual(testDatabaseUrl, process.env.DATABASE_URL, "TEST_DATABASE_URL must not equal DATABASE_URL");
  const sql = neon(testDatabaseUrl);
  const id = randomUUID();
  const email = `integration-${id}@example.invalid`;

  try {
    await sql`insert into users (id, name, email, password_hash, role, is_active, session_version)
      values (${id}, 'Integration Test', ${email}, 'not-a-login-hash', 'employee', false, 1)`;
    const rows = await sql`select id, email, is_active from users where id = ${id}`;
    assert.deepEqual(rows[0], { email, id, is_active: false });
  } finally {
    await sql`delete from users where id = ${id}`;
  }
});
