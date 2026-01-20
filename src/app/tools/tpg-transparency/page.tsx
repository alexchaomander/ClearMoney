import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "TPG Transparency Tool | ClearMoney",
  description:
    "Compare The Points Guy valuations with realistic math for popular credit cards.",
  openGraph: {
    title: "TPG Transparency Tool | ClearMoney",
    description:
      "Compare The Points Guy valuations with realistic math for popular credit cards.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
