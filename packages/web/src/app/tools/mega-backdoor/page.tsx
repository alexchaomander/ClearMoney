import type { Metadata } from "next";
import { MegaBackdoorSimulator } from "@/components/tools/mega-backdoor/MegaBackdoorSimulator";

export const metadata: Metadata = {
  title: "Mega Backdoor Roth Simulator - ClearMoney",
  description:
    "Are you leaving $40,000+ in tax-free space on the table? Calculate your 401(k) opportunity cost and see the math on the Mega Backdoor Roth loophole.",
  keywords: [
    "mega backdoor roth",
    "401k limits 2026",
    "after-tax 401k",
    "roth conversion",
    "HENRY finance",
    "tax optimization tool",
  ],
  openGraph: {
    title: "Mega Backdoor Roth Simulator - ClearMoney",
    description:
      "Calculate your untapped Roth space and the 20-year tax impact of the Mega Backdoor strategy.",
    type: "website",
  },
};

export default function MegaBackdoorPage() {
  return <MegaBackdoorSimulator />;
}
