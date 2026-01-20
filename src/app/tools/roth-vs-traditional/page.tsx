import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Roth vs Traditional Calculator | ClearMoney",
  description:
    "Compare Roth vs Traditional contributions to see which saves you more in taxes.",
  openGraph: {
    title: "Roth vs Traditional Calculator | ClearMoney",
    description:
      "Compare Roth vs Traditional contributions to see which saves you more in taxes.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
