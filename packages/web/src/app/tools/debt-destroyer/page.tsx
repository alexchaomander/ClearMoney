import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Debt Destroyer | ClearMoney",
  description:
    "Compare debt snowball vs avalanche payoff strategies side-by-side.",
  openGraph: {
    title: "Debt Destroyer | ClearMoney",
    description:
      "Compare debt snowball vs avalanche payoff strategies side-by-side.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
