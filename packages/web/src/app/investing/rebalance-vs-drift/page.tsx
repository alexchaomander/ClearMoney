import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Rebalance vs Drift Calculator | ClearMoney",
  description:
    "Compare rebalancing costs versus drift risk to decide when to rebalance.",
};

export default function RebalanceVsDriftPage() {
  return <Calculator />;
}
