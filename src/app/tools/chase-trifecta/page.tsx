import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Chase Trifecta Calculator | ClearMoney",
  description: "Optimize your Chase cards to maximize Ultimate Rewards points.",
  openGraph: {
    title: "Chase Trifecta Calculator | ClearMoney",
    description: "Optimize your Chase cards to maximize Ultimate Rewards points.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
