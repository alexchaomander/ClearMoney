import type { Metadata } from "next";

import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Conscious Spending Planner | ClearMoney",
  description:
    "Build a guilt-free spending plan using Ramit Sethi's framework.",
  openGraph: {
    title: "Conscious Spending Planner | ClearMoney",
    description:
      "Build a guilt-free spending plan using Ramit Sethi's framework.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
