import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPage } from "@/components/shared/CategoryPage";
import { getCategoryById } from "@/lib/site-config";

const category = getCategoryById("credit-cards");
const fallbackTitle = "Credit Cards";
const fallbackDescription = "Credit card tools and insights from ClearMoney.";

export const metadata: Metadata = {
  title: category?.name ?? fallbackTitle,
  description: category?.description ?? fallbackDescription,
  openGraph: {
    title: `${category?.name ?? fallbackTitle} | ClearMoney`,
    description: category?.description ?? fallbackDescription,
  },
};

export default function CreditCardsPage() {
  if (!category) {
    notFound();
  }
  return <CategoryPage category={category} />;
}
