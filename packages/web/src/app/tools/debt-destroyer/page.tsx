import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Debt Destroyer | ClearMoney",
  description:
    "Compare Debt Snowball vs. Debt Avalanche strategies to find your optimal path to debt freedom.",
};

export default function DebtDestroyerPage() {
  return <Calculator />;
}