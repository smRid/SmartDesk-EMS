import { expect, test } from "@playwright/test";

test("login renders and protected routes redirect unauthenticated users", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login\?from=%2Fadmin%2Fdashboard/);
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
