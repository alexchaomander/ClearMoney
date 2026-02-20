import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Roth Conversion Analyzer | ClearMoney",
  description:
    "Analyze whether converting traditional IRA funds to Roth makes sense for your tax situation, including IRMAA impact and break-even analysis.",
  openGraph: {
    title: "Roth Conversion Analyzer | ClearMoney",
    description:
      "Analyze whether converting traditional IRA funds to Roth makes sense for your tax situation.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
