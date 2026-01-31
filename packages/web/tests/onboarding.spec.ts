import { expect, test } from "@playwright/test";

test("onboarding highlights next steps", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(
    page.getByRole("heading", { name: /financial command center/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue to connect/i })
  ).toBeVisible();
});
