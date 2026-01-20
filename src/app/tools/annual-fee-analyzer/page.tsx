import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Annual Fee Analyzer | ClearMoney",
  description:
    "Calculate if any credit card annual fee is worth it for your actual spending patterns. Honest math, no affiliate bias.",
  openGraph: {
    title: "Annual Fee Analyzer | ClearMoney",
    description:
      "Calculate if any credit card annual fee is worth it for your actual spending patterns. Honest math, no affiliate bias.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
