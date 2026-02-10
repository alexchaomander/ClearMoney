import { expect, test } from "@playwright/test";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";
const DEMO_KEY = "clearmoney-demo-mode";

test.describe("founder coverage planner", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ onboardingKey, demoKey }) => {
        window.localStorage.setItem(onboardingKey, "true");
        window.sessionStorage.setItem(demoKey, "true");
      },
      { onboardingKey: ONBOARDING_KEY, demoKey: DEMO_KEY }
    );
  });

  test("demo preset applies and calendar downloads", async ({ page }) => {
    await page.goto("/tools/founder-coverage-planner?demo=true");

    await expect(
      page.getByRole("heading", { name: /founder coverage planner/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /apply preset/i }).click();

    await expect(
      page.getByRole("heading", { name: /entity recommendation/i })
    ).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("demo-download-calendar").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.ics$/i);
  });

  test("redacted share report renders without currency values", async ({ page }) => {
    await page.goto("/tools/founder-coverage-planner?demo=true");
    await page.getByRole("button", { name: /apply preset/i }).click();

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /open redacted report/i }).click();
    const popup = await popupPromise;

    await expect(popup.getByText(/shared report link/i)).toBeVisible();
    await expect(
      popup.getByText(/redacted mode: currency-like values are removed/i)
    ).toBeVisible();
    await expect(popup.getByText(/\$/)).toHaveCount(0);
  });
});
