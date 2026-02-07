import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Founder Coverage Planner | ClearMoney",
  description:
    "Map your entity choice, S-Corp savings, payroll plan, and compliance checkpoints in one founder-focused workflow.",
  openGraph: {
    title: "Founder Coverage Planner | ClearMoney",
    description:
      "Map your entity choice, S-Corp savings, payroll plan, and compliance checkpoints in one founder-focused workflow.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
