import type { Metadata } from "next";
import { ShotLayout } from "@/components/layout";
import { ShotHero, ShotWorkspace } from "@/components/shared";
import { TaxShieldAudit } from "@/components/tools/tax-shield-audit/TaxShieldAudit";

export const metadata: Metadata = {
  title: "AI Tax Shield Audit - ClearMoney",
  description:
    "Upload a W-2 or Schedule C to surface common tax signals and review the public decision trace behind the result.",
  keywords: [
    "tax audit ai",
    "tax review",
    "W-2 deduction finder",
    "Schedule C audit",
    "tax document upload",
    "decision trace",
  ],
  openGraph: {
    title: "AI Tax Shield Audit - ClearMoney",
    description:
      "Upload a tax document, review common tax signals, and inspect the reasoning behind the result.",
    type: "website",
  },
};

export default function TaxShieldAuditPage() {
  return (
    <ShotLayout>
      <ShotHero
        title="Shot #3: Tax Intelligence"
        subtitle="Did your return leave money on the table?"
        description="Upload your tax docs for a fast public-audit preview. We extract the visible signals, apply simple deterministic checks, and show the reasoning behind the result."
      />
      
      <ShotWorkspace>
        <TaxShieldAudit showShell={false} />
      </ShotWorkspace>
    </ShotLayout>
  );
}
