import type { Metadata } from "next";
import BiltCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Bilt 2.0 Calculator - Is the New Bilt Card Worth It?",
  description:
    "Calculate if the Bilt Mastercard 2.0 is worth it for your spending. Compare Blue, Obsidian, and Palladium tiers with our interactive calculator. No affiliate bias, just math.",
  keywords: [
    "bilt calculator",
    "bilt 2.0 calculator",
    "bilt mastercard worth it",
    "bilt obsidian vs palladium",
    "bilt credit card calculator",
    "rent rewards calculator",
  ],
  openGraph: {
    title: "Bilt 2.0 Calculator - Is the New Bilt Card Worth It?",
    description:
      "Calculate if the Bilt Mastercard 2.0 is worth it for your spending patterns. Interactive calculator with no affiliate bias.",
    type: "website",
  },
};

export default function BiltCalculatorPage() {
  return <BiltCalculator />;
}
