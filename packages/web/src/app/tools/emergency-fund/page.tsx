import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Emergency Fund Planner | ClearMoney",
  description:
    "Calculate your personalized emergency fund target based on your risk factors.",
  openGraph: {
    title: "Emergency Fund Planner | ClearMoney",
    description:
      "Calculate your personalized emergency fund target based on your risk factors.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
