import type { Metadata } from "next";
import { ConflictAudit } from "@/components/tools/conflict-audit/ConflictAudit";

export const metadata: Metadata = {
  title: "Credit Card Conflict of Interest Audit - ClearMoney",
  description:
    "Is your favorite credit card blog lying to you? Paste any URL to see estimated affiliate commissions vs. actual user value. No affiliate bias, just math.",
  keywords: [
    "credit card conflict audit",
    "affiliate commission checker",
    "the points guy bias",
    "nerdwallet reviews audit",
    "independent credit card valuation",
    "transparency tool",
  ],
  openGraph: {
    title: "Credit Card Conflict of Interest Audit - ClearMoney",
    description:
      "Audit any credit card review for affiliate bias. See exactly how much they earn from your approval.",
    type: "website",
  },
};

export default function ConflictAuditPage() {
  return <ConflictAudit />;
}
