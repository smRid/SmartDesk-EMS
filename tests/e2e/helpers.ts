import { expect, type Page } from "@playwright/test";

export const admin = {
  email: process.env.E2E_ADMIN_EMAIL ?? "",
  password: process.env.E2E_ADMIN_PASSWORD ?? "",
};
export const employee = {
  email: process.env.E2E_EMPLOYEE_EMAIL ?? "",
  password: process.env.E2E_EMPLOYEE_PASSWORD ?? "",
};

export const hasAdmin = Boolean(admin.email && admin.password);
export const hasEmployee = Boolean(employee.email && employee.password);
export const destructiveEnabled = process.env.E2E_DATABASE_CONFIRMED_ISOLATED === "true"
  && process.env.E2E_ALLOW_DESTRUCTIVE === "true"
  && Boolean(process.env.TEST_DATABASE_URL)
  && process.env.TEST_DATABASE_URL === process.env.DATABASE_URL;

export async function login(page: Page, credentials: { email: string; password: string }, expectedPath: RegExp) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(expectedPath);
}
