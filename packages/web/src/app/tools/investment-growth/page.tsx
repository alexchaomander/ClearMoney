import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Investment Growth Calculator | ClearMoney",
  description:
    "Project your investment growth over time with compound returns and regular contributions.",
  openGraph: {
    title: "Investment Growth Calculator | ClearMoney",
    description:
      "Project your investment growth over time with compound returns and regular contributions.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
