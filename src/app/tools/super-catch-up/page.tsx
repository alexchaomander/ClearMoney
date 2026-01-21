import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Super Catch-Up Optimizer (Ages 60-63) | ClearMoney",
  description:
    "Maximize the 4-year window for enhanced 401(k) super catch-up contributions.",
  openGraph: {
    title: "Super Catch-Up Optimizer (Ages 60-63) | ClearMoney",
    description:
      "Maximize the 4-year window for enhanced 401(k) super catch-up contributions.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
