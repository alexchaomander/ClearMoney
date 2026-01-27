import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "I Bond vs HYSA Comparison | ClearMoney",
  description:
    "Compare I Bonds, high-yield savings, TIPS, and CDs to find the best safe-money option.",
  openGraph: {
    title: "I Bond vs HYSA Comparison | ClearMoney",
    description:
      "Compare I Bonds, high-yield savings, TIPS, and CDs to find the best safe-money option.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
