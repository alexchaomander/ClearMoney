import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Tax-Aware Rebalance Impact | ClearMoney",
  description:
    "Estimate taxes from rebalancing and the drift needed to justify them.",
};

export default function TaxAwareRebalancePage() {
  return <Calculator />;
}
