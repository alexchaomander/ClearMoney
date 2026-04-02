import { defineConfig } from "@playwright/test";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_placeholder";
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE ?? "true";
const staticExport = process.env.STATIC_EXPORT ?? "false";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerkKey} NEXT_PUBLIC_DEMO_MODE=${demoMode} STATIC_EXPORT=${staticExport} pnpm exec next dev -p 3100`,
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100",
  },
});
