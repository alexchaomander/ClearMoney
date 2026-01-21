import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Medicare IRMAA Planner | ClearMoney",
  description:
    "Plan your retirement income to avoid or minimize Medicare IRMAA surcharges.",
  openGraph: {
    title: "Medicare IRMAA Planner | ClearMoney",
    description:
      "Plan your retirement income to avoid or minimize Medicare IRMAA surcharges.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
