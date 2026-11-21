import { expect, test } from "@playwright/test";
import { admin, employee, hasAdmin, hasEmployee, login } from "./helpers";

test("admin login, role boundary, and logout", async ({ page }) => {
  test.skip(!hasAdmin, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");
  await login(page, admin, /\/admin\/dashboard/);
  await page.goto("/employee/dashboard");
  await expect(page).toHaveURL(/\/forbidden/);
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /Open profile menu/ }).click();
  await page.getByRole("button", { name: /logout|sign out/i }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("employee login, role boundary, salary page, and logout", async ({ page }) => {
  test.skip(!hasEmployee, "Set E2E_EMPLOYEE_EMAIL and E2E_EMPLOYEE_PASSWORD");
  await login(page, employee, /\/employee\/dashboard/);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/forbidden/);
  await page.goto("/employee/salary");
  await expect(page.getByRole("heading", { name: /salary/i })).toBeVisible();
  await page.getByRole("button", { name: /Open profile menu/ }).click();
  await page.getByRole("button", { name: /logout|sign out/i }).click();
  await expect(page).toHaveURL(/\/login/);
});
