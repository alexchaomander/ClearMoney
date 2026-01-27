import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Amex Gold vs Platinum | ClearMoney",
  description:
    "Compare Amex Gold vs Platinum to see which card is right for your spending and travel habits.",
  openGraph: {
    title: "Amex Gold vs Platinum | ClearMoney",
    description:
      "Compare Amex Gold vs Platinum to see which card is right for your spending and travel habits.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
