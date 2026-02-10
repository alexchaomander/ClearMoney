"use client";

import { FOUNDER_COVERAGE_CHECKLIST_STORAGE_KEY } from "@/lib/calculators/founder-coverage-planner/storage";
import { FOUNDER_DEMO_FLOW_STORAGE_KEY } from "@/lib/demo/founderDemoFlow";

const SHARE_TOKENS_STORAGE_KEY = "clearmoney-share-report-tokens.v1";
const DEMO_SHARE_REPORTS_STORAGE_KEY = "clearmoney-demo-share-reports.v1";
const DEMO_BANK_TX_REIMBURSEMENTS_STORAGE_KEY = "clearmoney-demo-bank-tx-reimbursements.v1";

export function resetFounderShowcaseArtifacts(): void {
  if (typeof window === "undefined") return;

  const keys = [
    SHARE_TOKENS_STORAGE_KEY,
    DEMO_SHARE_REPORTS_STORAGE_KEY,
    DEMO_BANK_TX_REIMBURSEMENTS_STORAGE_KEY,
    FOUNDER_COVERAGE_CHECKLIST_STORAGE_KEY,
    FOUNDER_DEMO_FLOW_STORAGE_KEY,
  ];

  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

