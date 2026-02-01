import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator | ClearMoney",
  description:
    "Estimate your capital gains tax liability and see how holding period affects your tax bill.",
  openGraph: {
    title: "Capital Gains Tax Calculator | ClearMoney",
    description:
      "Estimate your capital gains tax liability and see how holding period affects your tax bill.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
