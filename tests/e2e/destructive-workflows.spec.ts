import { expect, test } from "@playwright/test";
import { admin, destructiveEnabled, employee, hasAdmin, hasEmployee, login } from "./helpers";

test.describe("isolated database workflows", () => {
  test.skip(!destructiveEnabled || !hasAdmin || !hasEmployee, "Requires confirmed isolated DB and both E2E accounts");
  test.describe.configure({ mode: "serial" });

  test("admin can open employee create/edit workflow", async ({ page }) => {
    await login(page, admin, /\/admin\/dashboard/);
    await page.goto("/admin/employees/new");
    await expect(page.getByRole("heading", { name: "Add New Employee" })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeEditable();
    await page.goto("/admin/employees");
    await expect(page.getByRole("heading", { name: /employees/i })).toBeVisible();
  });

  test("employee can submit leave and use attendance punch actions", async ({ page }) => {
    await login(page, employee, /\/employee\/dashboard/);
    await page.goto("/employee/leave/new");
    await expect(page.getByRole("heading", { name: "Request Leave" })).toBeVisible();
    await page.goto("/employee/attendance");
    const punch = page.getByRole("button", { name: /Check In|Check Out/ });
    await expect(punch).toBeVisible();
    await punch.click();
    await expect(page.getByText(/Attendance (check-in|check-out) recorded/i)).toBeVisible();
  });

  test("admin can access leave approval, attendance correction, and salary workflows", async ({ page }) => {
    await login(page, admin, /\/admin\/dashboard/);
    await page.goto("/admin/leaves");
    await expect(page.getByRole("heading", { name: /leave/i })).toBeVisible();
    await page.goto("/admin/attendance");
    await expect(page.getByRole("heading", { name: /attendance/i })).toBeVisible();
    await page.goto("/admin/salary/new");
    await expect(page.getByRole("heading", { name: /salary/i })).toBeVisible();
  });
});
