import type { Metadata } from "next";
import { EightyThreeBGenerator } from "@/components/tools/eighty-three-b/EightyThreeBGenerator";

export const metadata: Metadata = {
  title: "83(b) Election Perfect-Generator - ClearMoney",
  description:
    "Don't let a simple form cost you $1M+ in future taxes. Generate a legally perfect IRS 83(b) election in 30 seconds for free.",
  keywords: [
    "83b election generator",
    "irs section 83b form",
    "startup equity tax form",
    "founder tax optimization",
    "stock grant election",
    "83b filing instructions",
  ],
  openGraph: {
    title: "83(b) Election Perfect-Generator - ClearMoney",
    description:
      "Generate your IRS 83(b) election document in seconds. Includes a zero-error mailing checklist for founders.",
    type: "website",
  },
};

export default function EightyThreeBPage() {
  return <EightyThreeBGenerator />;
}
