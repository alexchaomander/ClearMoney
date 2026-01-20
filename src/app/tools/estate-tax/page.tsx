import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Estate Tax Exposure Calculator | ClearMoney",
  description:
    "Estimate federal and state estate taxes and see the 2026 exemption sunset impact.",
  openGraph: {
    title: "Estate Tax Exposure Calculator | ClearMoney",
    description:
      "Estimate federal and state estate taxes and see the 2026 exemption sunset impact.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
