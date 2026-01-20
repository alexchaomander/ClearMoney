import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "HSA Maximization Tool | ClearMoney",
  description:
    "Understand the triple tax advantage of HSAs and how to use them as a stealth retirement account.",
  openGraph: {
    title: "HSA Maximization Tool | ClearMoney",
    description:
      "Understand the triple tax advantage of HSAs and how to use them as a stealth retirement account.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
