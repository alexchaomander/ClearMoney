import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Strategy Match Finder | ClearMoney",
  description:
    "Rank investing strategy archetypes based on risk, taxes, and behavior in a transparent, educational tool.",
};

export default function StrategyMatchFinderPage() {
  return <Calculator />;
}
