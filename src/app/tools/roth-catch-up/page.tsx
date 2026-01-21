import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Roth Catch-Up Planner | ClearMoney",
  description:
    "Navigate the mandatory Roth catch-up rule for high earners and compare tax impacts.",
  openGraph: {
    title: "Roth Catch-Up Planner | ClearMoney",
    description:
      "Navigate the mandatory Roth catch-up rule for high earners and compare tax impacts.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
