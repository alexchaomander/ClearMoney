import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "RSU Tax Calculator | ClearMoney",
  description: "Calculate the tax gap between RSU withholding and actual liability",
  openGraph: {
    title: "RSU Tax Calculator | ClearMoney",
    description: "Calculate the tax gap between RSU withholding and actual liability",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
