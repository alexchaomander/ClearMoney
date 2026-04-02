import { expect, test } from "@playwright/test";

test("onboarding highlights next steps", async ({ page }) => {
  await page.goto("/onboarding?demo=true");

  await expect(
    page.getByRole("heading", { name: /founder financial baseline/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /start founder setup/i })
  ).toBeVisible();
});
