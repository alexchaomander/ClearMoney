import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Crypto Cost Basis Tracker | ClearMoney",
  description:
    "Compare crypto tax methods and understand IRS wallet-by-wallet cost basis rules.",
  openGraph: {
    title: "Crypto Cost Basis Tracker | ClearMoney",
    description:
      "Compare crypto tax methods and understand IRS wallet-by-wallet cost basis rules.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
