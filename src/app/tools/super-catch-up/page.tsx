import type { Metadata } from "next";

import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Super Catch-Up Optimizer (Ages 60-63) | ClearMoney",
  description:
    "Maximize your 4-year window for enhanced 401(k) catch-up contributions and project the retirement impact.",
  openGraph: {
    title: "Super Catch-Up Optimizer (Ages 60-63) | ClearMoney",
    description:
      "Maximize your 4-year window for enhanced 401(k) catch-up contributions and project the retirement impact.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
