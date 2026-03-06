import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("renders hero and key sections", async ({ page }) => {
    await page.goto("/");

    // Hero heading
    await expect(
      page.getByRole("heading", { name: /feel confident/i })
    ).toBeVisible();

    // CTA buttons
    await expect(
      page.getByRole("link", { name: /get started/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /see how it works/i })
    ).toBeVisible();

    // Persona carousel is visible
    await expect(page.getByText(/featured tool/i)).toBeVisible();
  });

  test("persona carousel navigates with arrows", async ({ page }) => {
    await page.goto("/");

    // First persona should be visible
    await expect(page.getByText(/founder/i).first()).toBeVisible();

    // Click next arrow
    await page.getByRole("button", { name: /next persona/i }).click();

    // Should advance to a different persona
    await expect(page.getByText(/new grad/i).first()).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");

    // Click blog link
    await page.getByRole("link", { name: /insights/i }).click();
    await expect(page).toHaveURL(/\/blog/);
  });

  test("footer renders with legal links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /privacy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /terms/i })).toBeVisible();
  });
});
