import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPage } from "@/components/shared/CategoryPage";
import { getCategoryById } from "@/lib/site-config";

const category = getCategoryById("taxes");
const fallbackTitle = "Taxes";
const fallbackDescription = "Tax strategy tools and insights from ClearMoney.";

export const metadata: Metadata = {
  title: category?.name ?? fallbackTitle,
  description: category?.description ?? fallbackDescription,
  openGraph: {
    title: `${category?.name ?? fallbackTitle} | ClearMoney`,
    description: category?.description ?? fallbackDescription,
  },
};

export default function TaxesPage() {
  if (!category) {
    notFound();
  }
  return <CategoryPage category={category} />;
}
