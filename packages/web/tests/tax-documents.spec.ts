import { expect, test } from "@playwright/test";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";
const DEMO_KEY = "clearmoney-demo-mode";
const TAX_DOCS_KEY = "clearmoney-demo-tax-docs.v1";
const TAX_PLANS_KEY = "clearmoney-demo-tax-plans.v1";

function makeDemoDoc(overrides: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    user_id: "demo-user-001",
    original_filename: "w2_2025.png",
    mime_type: "image/png",
    file_size_bytes: 12345,
    document_type: "w2",
    tax_year: 2025,
    status: "completed",
    provider_used: "demo",
    extracted_data: {
      employer_name: "Acme Corp",
      wages_tips_compensation: 125000,
      federal_income_tax_withheld: 22000,
    },
    confidence_score: 0.92,
    validation_errors: null,
    error_message: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function makeDemoPlan() {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    user_id: "demo-user-001",
    name: "2025 Tax Plan",
    description: "My tax plan",
    filing_status: "single",
    tax_year: 2025,
    status: "draft",
    versions: [],
    created_at: now,
    updated_at: now,
  };
}

test.describe("tax documents", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ onboardingKey, demoKey }) => {
        window.localStorage.setItem(onboardingKey, "true");
        window.sessionStorage.setItem(demoKey, "true");
      },
      { onboardingKey: ONBOARDING_KEY, demoKey: DEMO_KEY }
    );
  });

  test("upload flow — upload file and see completed doc", async ({ page }) => {
    await page.goto("/tools/tax-documents?demo=true");

    // Wait for the page to load
    await expect(page.getByRole("heading", { name: /tax document extractor/i })).toBeVisible();

    // Verify empty state
    await expect(page.getByText(/no documents yet/i)).toBeVisible();

    // Upload a file via the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "w2_test.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image content"),
    });

    // Wait for upload to complete and doc to appear
    await expect(page.getByText("w2_test.png processed.")).toBeVisible({ timeout: 10000 });

    // Verify doc appears in the list
    const docRow = page.getByTestId("document-row").first();
    await expect(docRow).toBeVisible();
    await expect(docRow.getByText("w2_test.png")).toBeVisible();
    await expect(docRow.getByText("Completed")).toBeVisible();

    // Expand the row and verify extracted fields
    await docRow.getByRole("button").first().click();
    await expect(page.getByText("employer_name")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
  });

  test("delete flow — upload doc then delete it", async ({ page }) => {
    await page.goto("/tools/tax-documents?demo=true");
    await expect(page.getByRole("heading", { name: /tax document extractor/i })).toBeVisible();

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "delete_me.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image content"),
    });
    await expect(page.getByText("delete_me.png processed.")).toBeVisible({ timeout: 10000 });

    // Expand the row
    const docRow = page.getByTestId("document-row").first();
    await docRow.getByRole("button").first().click();

    // Click delete, then confirm inline
    await docRow.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText(/delete this document/i)).toBeVisible();
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify doc is removed
    await expect(page.getByText("delete_me.png")).toHaveCount(0, { timeout: 5000 });
  });

  test("send to tax plan — prefill modal works", async ({ page }) => {
    // Seed a tax plan
    const plan = makeDemoPlan();
    await page.addInitScript(
      ({ key, plans }) => {
        window.localStorage.setItem(key, JSON.stringify(plans));
      },
      { key: TAX_PLANS_KEY, plans: [plan] }
    );

    await page.goto("/tools/tax-documents?demo=true");
    await expect(page.getByRole("heading", { name: /tax document extractor/i })).toBeVisible();

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "w2_prefill.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image content"),
    });
    await expect(page.getByText("w2_prefill.png processed.")).toBeVisible({ timeout: 10000 });

    // Expand doc and click "Send to Tax Plan"
    const docRow = page.getByTestId("document-row").first();
    await docRow.getByRole("button").first().click();
    await docRow.getByRole("button", { name: /send to tax plan/i }).click();

    // Verify the prefill modal appears
    await expect(page.getByText(/send to tax plan workspace/i)).toBeVisible();

    // Select the plan
    const planSelect = page.locator("select").filter({ has: page.getByText("Select a plan") });
    await planSelect.selectOption({ label: plan.name });

    // Click Import
    await page.getByRole("button", { name: /import/i }).click();

    // Verify success message
    await expect(page.getByText(/populated/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: /open workspace/i })).toBeVisible();
  });

  test("workspace import panel — seeded doc visible in workspace", async ({ page }) => {
    // Seed a completed doc and a plan
    const doc = makeDemoDoc();
    const plan = makeDemoPlan();

    await page.addInitScript(
      ({ docsKey, plansKey, docs, plans }) => {
        window.localStorage.setItem(docsKey, JSON.stringify(docs));
        window.localStorage.setItem(plansKey, JSON.stringify(plans));
      },
      {
        docsKey: TAX_DOCS_KEY,
        plansKey: TAX_PLANS_KEY,
        docs: [doc],
        plans: [plan],
      }
    );

    await page.goto("/tools/tax-plan-workspace?demo=true");

    // Click the "Import from Documents" button to open the panel
    const importBtn = page.getByTestId("import-from-docs-btn");
    await expect(importBtn).toBeVisible({ timeout: 10000 });
    await importBtn.click();

    // Verify the import panel opens and shows the seeded document
    const importPanel = page.getByTestId("doc-import-panel");
    await expect(importPanel).toBeVisible({ timeout: 5000 });
    await expect(importPanel.getByText("w2_2025.png")).toBeVisible();
  });

  test("dashboard card — shows when docs exist", async ({ page }) => {
    // Seed a completed doc
    const doc = makeDemoDoc();

    await page.addInitScript(
      ({ key, docs }) => {
        window.localStorage.setItem(key, JSON.stringify(docs));
      },
      { key: TAX_DOCS_KEY, docs: [doc] }
    );

    await page.goto("/dashboard?demo=true");

    // Wait for dashboard to load
    await expect(page.getByRole("heading", { name: /portfolio dashboard/i })).toBeVisible({
      timeout: 15000,
    });

    // Verify the tax documents card appears
    const card = page.getByTestId("tax-documents-card");
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.getByText("Tax Documents")).toBeVisible();
    await expect(card.getByText("Completed")).toBeVisible();
    await expect(card.getByText("w2_2025.png")).toBeVisible();
  });
});
