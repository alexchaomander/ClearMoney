import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Points Valuation Dashboard | ClearMoney",
  description:
    "Transparent, methodology-backed valuations for major points currencies.",
  openGraph: {
    title: "Points Valuation Dashboard | ClearMoney",
    description:
      "Transparent, methodology-backed valuations for major points currencies.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
