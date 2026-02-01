import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Mortgage Calculator | ClearMoney",
  description:
    "Calculate your monthly mortgage payment with principal, interest, taxes, and insurance breakdown.",
  openGraph: {
    title: "Mortgage Calculator | ClearMoney",
    description:
      "Calculate your monthly mortgage payment with principal, interest, taxes, and insurance breakdown.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
