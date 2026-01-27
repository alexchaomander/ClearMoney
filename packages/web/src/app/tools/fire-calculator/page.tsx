import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "FIRE Calculator | ClearMoney",
  description:
    "Calculate when you can reach financial independence based on your savings rate.",
  openGraph: {
    title: "FIRE Calculator | ClearMoney",
    description:
      "Calculate when you can reach financial independence based on your savings rate.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
