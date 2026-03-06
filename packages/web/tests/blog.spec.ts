import { expect, test } from "@playwright/test";

test.describe("blog", () => {
  test("blog index renders with posts", async ({ page }) => {
    await page.goto("/blog");

    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();

    // Should have at least one article link
    const articles = page.getByRole("article");
    await expect(articles.first()).toBeVisible();
  });

  test("blog post page renders content", async ({ page }) => {
    await page.goto("/blog");

    // Click the first post link
    const firstPostLink = page.getByRole("article").first().getByRole("link").first();
    await firstPostLink.click();

    // Post page should have a heading and content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
