import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "2026 Contribution Limits Dashboard | ClearMoney",
  description:
    "A comprehensive reference dashboard with personalized 2026 contribution limits for retirement, HSA, and FSA accounts.",
  openGraph: {
    title: "2026 Contribution Limits Dashboard | ClearMoney",
    description:
      "A comprehensive reference dashboard with personalized 2026 contribution limits for retirement, HSA, and FSA accounts.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
