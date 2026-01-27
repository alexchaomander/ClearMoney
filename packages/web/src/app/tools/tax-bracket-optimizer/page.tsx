import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Tax Bracket Optimizer | ClearMoney",
  description:
    "Visualize your tax situation and find opportunities to optimize across brackets and thresholds.",
  openGraph: {
    title: "Tax Bracket Optimizer | ClearMoney",
    description:
      "Visualize your tax situation and find opportunities to optimize across brackets and thresholds.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
