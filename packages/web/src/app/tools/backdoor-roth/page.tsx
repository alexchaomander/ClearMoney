import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Backdoor Roth IRA Guide | ClearMoney",
  description:
    "Navigate the pro-rata rule and optimize your backdoor Roth conversion.",
  openGraph: {
    title: "Backdoor Roth IRA Guide | ClearMoney",
    description:
      "Navigate the pro-rata rule and optimize your backdoor Roth conversion.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
