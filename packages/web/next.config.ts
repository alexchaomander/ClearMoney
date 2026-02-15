import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        distDir: "dist",
      }
    : {}),
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

export default withMDX(nextConfig);
