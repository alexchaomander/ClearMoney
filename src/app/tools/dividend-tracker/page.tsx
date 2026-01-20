import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Dividend Income Tracker | ClearMoney",
  description:
    "Visualize your dividend income and project when it covers your expenses.",
  openGraph: {
    title: "Dividend Income Tracker | ClearMoney",
    description:
      "Visualize your dividend income and project when it covers your expenses.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
