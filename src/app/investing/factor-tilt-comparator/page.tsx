import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Factor Tilt Comparator | ClearMoney",
  description:
    "Compare base portfolio assumptions to common factor tilts in a transparent tool.",
};

export default function FactorTiltComparatorPage() {
  return <Calculator />;
}
