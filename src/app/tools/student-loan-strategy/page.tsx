import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Student Loan Strategy Planner | ClearMoney",
  description:
    "Compare student loan IDR plans and see monthly payments, forgiveness, and tax impacts for 2026 changes.",
  openGraph: {
    title: "Student Loan Strategy Planner | ClearMoney",
    description:
      "Compare student loan IDR plans and see monthly payments, forgiveness, and tax impacts for 2026 changes.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
