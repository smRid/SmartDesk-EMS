import { expect, test } from "@playwright/test";
import { SignJWT } from "jose";
import { SESSION_COOKIE_NAME } from "../../src/lib/constants";

test("login renders and protected routes redirect unauthenticated users", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login\?from=%2Fadmin%2Fdashboard/);
});

test("a revoked or stale signed session cannot redirect-loop the login page", async ({ baseURL, context, page }) => {
  test.skip(!process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET is required to construct a stale test session");
  const token = await new SignJWT({ role: "admin", sv: 2_147_483_647 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(crypto.randomUUID())
    .setIssuedAt()
    .setIssuer("smartdesk-ems")
    .setAudience("smartdesk-ems")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET));
  await context.addCookies([{ name: SESSION_COOKIE_NAME, url: baseURL ?? "http://127.0.0.1:3100", value: token }]);

  await page.goto("/login");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
});

test("invalid credentials use a non-enumerating error", async ({ page, request }) => {
  const health = await request.get("/api/health");
  test.skip(health.status() !== 200, "Database migrations are not applied");
  await page.goto("/login");
  await page.getByLabel("Email address").fill("missing-account@example.com");
  await page.getByLabel("Password", { exact: true }).fill("invalid-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("#login-authentication-error")).toContainText("Invalid email or password");
});

test("unknown routes render the accessible not-found page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("health endpoint returns a bounded public status payload", async ({ request }) => {
  const response = await request.get("/api/health");
  expect([200, 503]).toContain(response.status());
  const body = await response.json();
  expect(["ok", "degraded"]).toContain(body.status);
  expect(JSON.stringify(body)).not.toMatch(/password|secret|token|url/i);
});
