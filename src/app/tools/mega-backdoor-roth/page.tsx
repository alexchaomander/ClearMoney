import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Mega Backdoor Roth Calculator | ClearMoney",
  description:
    "Calculate your after-tax 401(k) contribution capacity and mega backdoor Roth potential.",
  openGraph: {
    title: "Mega Backdoor Roth Calculator | ClearMoney",
    description:
      "Calculate your after-tax 401(k) contribution capacity and mega backdoor Roth potential.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
