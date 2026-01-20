import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Total Compensation Calculator | ClearMoney",
  description:
    "Compare total pay across base salary, bonus, equity, and benefits to evaluate offers.",
  openGraph: {
    title: "Total Compensation Calculator | ClearMoney",
    description:
      "Compare total pay across base salary, bonus, equity, and benefits to evaluate offers.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
