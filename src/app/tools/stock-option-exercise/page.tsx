import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Stock Option Exercise Decision Tool | ClearMoney",
  description:
    "Model ISO/NSO exercise scenarios with AMT, tax, and cash flow insights.",
  openGraph: {
    title: "Stock Option Exercise Decision Tool | ClearMoney",
    description:
      "Model ISO/NSO exercise scenarios with AMT, tax, and cash flow insights.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
