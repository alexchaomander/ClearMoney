import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { CategoryPage } from "@/components/shared/CategoryPage";
import { EquityDashboard } from "@/components/equity/EquityDashboard";
import { getCategoryById } from "@/lib/site-config";

const category = getCategoryById("equity-compensation");
const fallbackTitle = "Equity Compensation";
const fallbackDescription = "Equity compensation tools and insights from ClearMoney.";

export const metadata: Metadata = {
  title: category?.name ?? fallbackTitle,
  description: category?.description ?? fallbackDescription,
  openGraph: {
    title: `${category?.name ?? fallbackTitle} | ClearMoney`,
    description: category?.description ?? fallbackDescription,
  },
};

export default function EquityCompensationPage() {
  if (!category) {
    notFound();
  }

  return (
    <>
      <SignedIn>
        <EquityDashboard />
      </SignedIn>
      <SignedOut>
        <CategoryPage category={category} />
      </SignedOut>
    </>
  );
}
