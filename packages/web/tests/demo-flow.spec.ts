import { expect, test } from "@playwright/test";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";
const DEMO_KEY = "clearmoney-demo-mode";

test.describe("demo mode flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ onboardingKey, demoKey }) => {
      window.localStorage.setItem(onboardingKey, "true");
      window.sessionStorage.setItem(demoKey, "true");
    }, { onboardingKey: ONBOARDING_KEY, demoKey: DEMO_KEY });
  });

  test("dashboard loads with demo data", async ({ page }) => {
    await page.goto("/dashboard?demo=true");
    await expect(page.getByRole("heading", { name: /portfolio dashboard/i })).toBeVisible();
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test("connect page renders in demo mode", async ({ page }) => {
    await page.goto("/connect?demo=true");
    await expect(
      page.getByRole("heading", { name: /connect your investment accounts/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder(/search for your brokerage/i)).toBeVisible();
  });

  test("account detail loads demo account", async ({ page }) => {
    await page.goto("/dashboard/accounts/demo-acc-001?demo=true");
    await expect(page.getByRole("heading", { name: /fidelity 401\(k\)/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /back to dashboard/i })).toBeVisible();
  });

  test("demo banner hides when demo mode disabled", async ({ page }) => {
    await page.goto("/dashboard?demo=true");
    await expect(page.getByText(/demo mode/i)).toBeVisible();

    await page.goto("/dashboard?demo=false");
    await expect(page.getByText(/demo mode/i)).toHaveCount(0);
  });
});
