import type { Metadata } from "next";
import { ShotLayout } from "@/components/layout";
import { ShotHero, ShotWorkspace } from "@/components/shared";
import { TaxShieldAudit } from "@/components/tools/tax-shield-audit/TaxShieldAudit";

export const metadata: Metadata = {
  title: "AI Tax Shield Audit - ClearMoney",
  description:
    "Auditing your W-2 or Schedule C for missing tax shields. Find hidden deductions, QSBS eligibility, and RSU optimization in seconds.",
  keywords: [
    "tax audit ai",
    "missing tax shields",
    "W-2 deduction finder",
    "Schedule C audit",
    "RSU tax optimization",
    "QSBS eligibility checker",
  ],
  openGraph: {
    title: "AI Tax Shield Audit - ClearMoney",
    description:
      "Our AI scans your tax docs for missing deductions and shields. See the math behind your savings.",
    type: "website",
  },
};

export default function TaxShieldAuditPage() {
  return (
    <ShotLayout>
      <ShotHero
        title="Shot #3: Tax Intelligence"
        subtitle="Did you miss a massive tax shield?"
        description="Upload your tax docs for an instant AI audit. We'll scan for missed deductions, credits, and optimization opportunities grounded in deterministic tax rules."
      />
      
      <ShotWorkspace>
        <TaxShieldAudit showShell={false} />
      </ShotWorkspace>
    </ShotLayout>
  );
}
