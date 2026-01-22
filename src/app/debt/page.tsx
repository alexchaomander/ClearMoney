import type { Metadata } from "next";
import { CategoryPage } from "@/components/shared/CategoryPage";
import { getCategoryById } from "@/lib/site-config";

const category = getCategoryById("debt")!;

export const metadata: Metadata = {
  title: category.name,
  description: category.description,
  openGraph: {
    title: `${category.name} | ClearMoney`,
    description: category.description,
  },
};

export default function DebtPage() {
  return <CategoryPage category={category} />;
}
