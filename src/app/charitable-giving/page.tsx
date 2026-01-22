import type { Metadata } from "next";
import { CategoryPage } from "@/components/shared/CategoryPage";
import { getCategoryById } from "@/lib/site-config";

const category = getCategoryById("charitable-giving")!;

export const metadata: Metadata = {
  title: category.name,
  description: category.description,
  openGraph: {
    title: `${category.name} | ClearMoney`,
    description: category.description,
  },
};

export default function CharitableGivingPage() {
  return <CategoryPage category={category} />;
}
