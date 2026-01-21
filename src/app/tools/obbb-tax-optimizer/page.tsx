import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "OBBB Tax Optimizer | ClearMoney",
  description:
    "Estimate your tax savings from the One Big Beautiful Bill Act deductions for 2025-2028.",
  openGraph: {
    title: "OBBB Tax Optimizer | ClearMoney",
    description:
      "Estimate your tax savings from the One Big Beautiful Bill Act deductions for 2025-2028.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
