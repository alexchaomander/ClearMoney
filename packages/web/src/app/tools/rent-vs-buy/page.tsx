import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator | ClearMoney",
  description:
    "Compare the long-term financial impact of renting versus buying a home.",
  openGraph: {
    title: "Rent vs Buy Calculator | ClearMoney",
    description:
      "Compare the long-term financial impact of renting versus buying a home.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
