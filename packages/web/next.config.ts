import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";

const isStaticExport = process.env.STATIC_EXPORT === "true";

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
];

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        distDir: "dist",
      }
    : {}),
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
