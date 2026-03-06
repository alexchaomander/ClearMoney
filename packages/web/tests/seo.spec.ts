import { expect, test } from "@playwright/test";

test.describe("SEO and meta", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);

    const text = await page.textContent("body");
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Disallow: /dashboard");
    expect(text).toContain("Sitemap:");
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("security headers are present", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
  });

  test("opengraph image returns a PNG", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("landing page has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");

    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector(
        'script[type="application/ld+json"]'
      );
      return script ? JSON.parse(script.textContent || "{}") : null;
    });

    expect(jsonLd).not.toBeNull();
    expect(jsonLd["@type"]).toBe("Organization");
    expect(jsonLd.name).toBe("ClearMoney");
  });
});
