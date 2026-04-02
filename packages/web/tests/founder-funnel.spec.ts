import { expect, test } from "@playwright/test";

test.describe("founder-first funnel", () => {
  test("landing page prioritizes founder beta path", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/founder beta, see the math/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /try founder runway/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /enter founder beta/i }).first()).toBeVisible();
  });

  test("invite page explains founder beta next steps", async ({ page }) => {
    await page.goto("/invite");

    await expect(page.getByRole("heading", { name: /private beta access/i })).toBeVisible();
    await expect(page.getByText(/what happens next/i)).toBeVisible();
    await expect(page.getByText(/founder-first beta/i)).toBeVisible();
  });
});
