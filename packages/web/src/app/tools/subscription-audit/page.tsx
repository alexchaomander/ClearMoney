import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Subscription Audit Scorer | ClearMoney",
  description:
    "Score your subscriptions by ROI, find which to keep, review, or cancel, and see how much you could save.",
  openGraph: {
    title: "Subscription Audit Scorer | ClearMoney",
    description:
      "Score your subscriptions by ROI and find savings opportunities.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
