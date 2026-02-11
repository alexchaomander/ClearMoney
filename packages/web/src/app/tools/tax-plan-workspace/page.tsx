import type { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Tax Plan Workspace | ClearMoney",
  description:
    "Build a practical tax action plan with transparent math for individuals and advisors.",
  openGraph: {
    title: "Tax Plan Workspace | ClearMoney",
    description:
      "Build a practical tax action plan with transparent math for individuals and advisors.",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
