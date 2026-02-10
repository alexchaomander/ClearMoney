import { expect, test } from "@playwright/test";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";
const DEMO_KEY = "clearmoney-demo-mode";

test.describe("founder showcase", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ onboardingKey, demoKey }) => {
        window.localStorage.setItem(onboardingKey, "true");
        window.sessionStorage.setItem(demoKey, "true");
      },
      { onboardingKey: ONBOARDING_KEY, demoKey: DEMO_KEY }
    );
  });

  test("one-time full share links work once", async ({ page }) => {
    await page.goto("/tools/founder-coverage-planner/report?demo=true");

    await expect(page.getByRole("heading", { name: /founder coverage/i })).toBeVisible();

    const shareSection = page.locator("#share-links");
    await expect(shareSection).toBeVisible();

    await shareSection.getByTestId("create-one-time-full").click();

    await expect(shareSection.getByText(/no share links created yet/i)).toHaveCount(0);
    await expect(shareSection.getByText(/created:/i)).toBeVisible();

    const popupPromise1 = page.waitForEvent("popup");
    await shareSection.getByRole("button", { name: "Open" }).first().click();
    const popup1 = await popupPromise1;
    await expect(popup1.getByText(/shared report link/i)).toBeVisible();
    await expect(popup1.getByText(/shared report not found/i)).toHaveCount(0);

    const popupPromise2 = page.waitForEvent("popup");
    await shareSection.getByRole("button", { name: "Open" }).first().click();
    const popup2 = await popupPromise2;
    await expect(popup2.getByText(/shared report not found/i)).toBeVisible();
  });

  test("reset demo clears created share links", async ({ page }) => {
    await page.goto("/tools/founder-coverage-planner/report?demo=true");

    const shareSection = page.locator("#share-links");
    await shareSection.getByTestId("create-one-time-full").click();
    await expect(shareSection.getByText(/created:/i)).toBeVisible();

    await page.getByTestId("report-demo-reset").click();

    // Reset triggers reload; assert the UI is back to an empty state.
    await expect(page.locator("#share-links").getByText(/no share links created yet/i)).toBeVisible();
  });

  test("reimbursement ledger supports marking a transaction reimbursed", async ({ page }) => {
    await page.goto("/tools/founder-coverage-planner?demo=true");

    // Ledger may be below the fold.
    await page.locator("#reimbursement-ledger").scrollIntoViewIfNeeded();

    const ledger = page.locator("#reimbursement-ledger");
    await expect(ledger).toBeVisible();

    // Toggle the first row reimbursed and verify it shows a reimbursed timestamp.
    await ledger.getByRole("button", { name: "Toggle reimbursed" }).first().click();
    await expect(ledger.getByText(/reimbursed at:/i).first()).toBeVisible();
  });
});
