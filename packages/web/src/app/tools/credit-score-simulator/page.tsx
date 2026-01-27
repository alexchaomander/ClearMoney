import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Credit Score Simulator | ClearMoney",
  description:
    "Estimate how different actions could affect your credit score range.",
  openGraph: {
    title: "Credit Score Simulator | ClearMoney",
    description:
      "Estimate how different actions could affect your credit score range.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
