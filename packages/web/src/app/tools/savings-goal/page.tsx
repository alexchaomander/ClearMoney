import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Savings Goal Calculator | ClearMoney",
  description:
    "Plan your path to any savings goal with monthly contributions and projected growth.",
  openGraph: {
    title: "Savings Goal Calculator | ClearMoney",
    description:
      "Plan your path to any savings goal with monthly contributions and projected growth.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
