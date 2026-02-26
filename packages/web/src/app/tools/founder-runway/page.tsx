import type { Metadata } from "next";
import { RunwayCalculator } from "@/components/tools/founder-runway/RunwayCalculator";

export const metadata: Metadata = {
  title: "Founder Runway & Burn Tester - ClearMoney",
  description:
    "Is your personal burn killing your startup? Calculate your true survival runway by combining personal and company assets. See the math behind your fundraising triggers.",
  keywords: [
    "founder runway",
    "startup burn rate",
    "personal burn vs startup burn",
    "fundraising trigger",
    "default alive calculator",
    "founder finance tool",
  ],
  openGraph: {
    title: "Founder Runway & Burn Tester - ClearMoney",
    description:
      "Calculate your true survival runway combining personal + company assets. Get math-driven fundraising recommendations.",
    type: "website",
  },
};

export default function FounderRunwayPage() {
  return <RunwayCalculator />;
}
