import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Appreciated Stock Donation Calculator | ClearMoney",
  description:
    "See how much you save by donating appreciated stock instead of cash.",
  openGraph: {
    title: "Appreciated Stock Donation Calculator | ClearMoney",
    description:
      "See how much you save by donating appreciated stock instead of cash.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
