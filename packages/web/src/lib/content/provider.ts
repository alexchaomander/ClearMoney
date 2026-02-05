import { getMdxProvider } from "./providers/mdx";
import { getCmsProvider } from "./providers/cms";
import type { ContentProvider } from "./types";

const PROVIDER = process.env.NEXT_PUBLIC_CONTENT_PROVIDER ?? "mdx";

export function getContentProvider(): ContentProvider {
  if (PROVIDER === "cms") {
    return getCmsProvider();
  }
  return getMdxProvider();
}
