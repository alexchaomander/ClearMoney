import { expect, test } from "@playwright/test";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";
const DEMO_KEY = "clearmoney-demo-mode";

test.describe("founder activation surfaces", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ onboardingKey, demoKey }) => {
      window.localStorage.setItem(onboardingKey, "true");
      window.sessionStorage.setItem(demoKey, "true");
    }, { onboardingKey: ONBOARDING_KEY, demoKey: DEMO_KEY });
  });

  test("invite page sets expectations before code entry", async ({ page }) => {
    await page.goto("/invite");

    await expect(page.getByText(/fast setup/i)).toBeVisible();
    await expect(page.getByText(/read-only links/i)).toBeVisible();
    await expect(page.getByText(/manual fallback/i)).toBeVisible();
  });

  test("connect page explains trust and manual fallback", async ({ page }) => {
    await page.goto("/connect?demo=true");

    await expect(page.getByText(/usually under two minutes/i)).toBeVisible();
    await expect(page.getByText(/what improves immediately/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /continue (with linked accounts|without links)/i })
    ).toBeVisible();
  });

  test("connect callback error preserves a recovery path", async ({ page }) => {
    await page.goto("/connect/callback?error=access_denied&error_description=User%20cancelled");

    await expect(page.getByRole("heading", { name: /connection failed/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /try again/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /go to dashboard/i })).toBeVisible();
  });
});
