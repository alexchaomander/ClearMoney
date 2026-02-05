import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "export", // Static export for Cloudflare Pages
  distDir: "dist", // Output to dist for Cloudflare Pages
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true, // Required for static export
  },
  turbopack: {
    resolveAlias: {
      // Static export has no server runtime. Stub Clerk's Next integration to keep build/export working.
      "@clerk/nextjs": "./src/lib/clerk-static.tsx",
    },
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
