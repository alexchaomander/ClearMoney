import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Student Loan Strategy Planner | ClearMoney",
  description:
    "Compare IDR plans (IBR, PAYE, ICR, RAP), forgiveness timelines, and tax impacts as SAVE sunsets and RAP launches in 2026.",
};

export default function StudentLoanStrategyPage() {
  return <Calculator />;
}
