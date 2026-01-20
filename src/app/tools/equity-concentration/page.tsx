import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Equity Concentration Risk Assessment | ClearMoney",
  description:
    "Understand the risk of having too much wealth tied to employer stock and explore diversification strategies.",
  openGraph: {
    title: "Equity Concentration Risk Assessment | ClearMoney",
    description:
      "Understand the risk of having too much wealth tied to employer stock and explore diversification strategies.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
