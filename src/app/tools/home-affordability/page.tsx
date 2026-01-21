import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Home Affordability Reality Check | ClearMoney",
  description:
    "See what you can actually afford using the 28/36 rule and true monthly ownership costs.",
  openGraph: {
    title: "Home Affordability Reality Check | ClearMoney",
    description:
      "See what you can actually afford using the 28/36 rule and true monthly ownership costs.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
