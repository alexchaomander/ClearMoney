import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "529-to-Roth Rollover Planner | ClearMoney",
  description:
    "Plan your 529-to-Roth IRA rollover strategy to maximize tax-free retirement savings.",
  openGraph: {
    title: "529-to-Roth Rollover Planner | ClearMoney",
    description:
      "Plan your 529-to-Roth IRA rollover strategy to maximize tax-free retirement savings.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
