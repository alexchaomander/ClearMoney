import type { Metadata } from "next";
import { DocumentManager } from "./calculator";

export const metadata: Metadata = {
  title: "Tax Document Extractor | ClearMoney",
  description:
    "Upload W-2s, 1099s, and K-1s — extract fields with AI and send data to your Tax Plan Workspace.",
  openGraph: {
    title: "Tax Document Extractor | ClearMoney",
    description:
      "Upload W-2s, 1099s, and K-1s — extract fields with AI and send data to your Tax Plan Workspace.",
    type: "website",
  },
};

export default function Page() {
  return <DocumentManager />;
}
