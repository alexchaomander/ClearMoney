import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";

const isStaticExport = process.env.STATIC_EXPORT === "true";

// CSP directives — joined into a single header value below.
// Next.js injects inline scripts for hydration, so script-src needs 'unsafe-inline'.
// Styles use 'unsafe-inline' because Tailwind + Next.js inject <style> tags.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.posthog.com https://*.sentry.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.clerk.com https://*.gravatar.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.posthog.com https://*.sentry.io https://*.ingest.sentry.io ws://localhost:* http://localhost:*",
  "frame-src 'self' https://*.clerk.accounts.dev",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        distDir: "dist",
      }
    : {}),
  // Security headers are applied by the server at response time.
  // They have no effect during static exports (output: "export").
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Playwright uses 127.0.0.1; Next will increasingly require explicit allow-listing for dev origins.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: isStaticExport,
  },
  transpilePackages: ["@clearmoney/strata-sdk"],
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  ...(isStaticExport
    ? {
        turbopack: {
          resolveAlias: {
            // Static export has no server runtime. Stub Clerk's Next integration to keep build/export working.
            "@clerk/nextjs": "./src/lib/clerk-static.tsx",
          },
        },
      }
    : {}),
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withSentryConfig(withMDX(nextConfig), {
  silent: true,
  disableLogger: true,
});
