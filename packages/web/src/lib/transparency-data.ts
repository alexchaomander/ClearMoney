export interface PayoutDisclosureRow {
  card: string;
  payoutUsd: number;
  recommendationRank: number;
  reason: string;
  source: string;
  updatedAt: string;
}

export interface IndependenceAuditRow {
  card: string;
  ourRank: number;
  payoutRank: number;
  delta: number;
  reason: string;
}

export interface CorrectionEntry {
  date: string;
  type: "Correction" | "Update";
  summary: string;
  impact: string;
}

export const transparencyLastUpdated = "2026-02-01";

export const payoutDisclosureRows: PayoutDisclosureRow[] = [
  {
    card: "Chase Sapphire Preferred",
    payoutUsd: 175,
    recommendationRank: 4,
    reason: "Net value trails no-fee alternatives for low travel spend profiles.",
    source: "Affiliate network midpoint range",
    updatedAt: transparencyLastUpdated,
  },
  {
    card: "Amex Platinum",
    payoutUsd: 450,
    recommendationRank: 6,
    reason: "Statement credit utilization assumptions reduce realistic net value.",
    source: "Affiliate network midpoint range",
    updatedAt: transparencyLastUpdated,
  },
  {
    card: "Capital One Venture X",
    payoutUsd: 350,
    recommendationRank: 3,
    reason: "Strong travel value but weaker for low-frequency travelers.",
    source: "Affiliate network midpoint range",
    updatedAt: transparencyLastUpdated,
  },
];

export const independenceAuditRows: IndependenceAuditRow[] = [
  {
    card: "Chase Sapphire Preferred",
    ourRank: 4,
    payoutRank: 1,
    delta: -3,
    reason: "Lower net value for dining-light spend profiles.",
  },
  {
    card: "Amex Gold",
    ourRank: 1,
    payoutRank: 2,
    delta: 1,
    reason: "Highest net value for grocery-heavy households.",
  },
  {
    card: "Capital One Venture X",
    ourRank: 3,
    payoutRank: 1,
    delta: -2,
    reason: "Annual fee drag without travel spend.",
  },
];

export const correctionsLog: CorrectionEntry[] = [
  {
    date: "2026-01-19",
    type: "Correction",
    summary: "Updated Hilton valuation after program devaluation notice.",
    impact: "-0.05 cpp",
  },
  {
    date: "2026-01-12",
    type: "Update",
    summary: "Adjusted Amex Platinum credit usability defaults based on user surveys.",
    impact: "No change to net value for median user",
  },
  {
    date: "2026-01-05",
    type: "Correction",
    summary: "Fixed Chase Freedom Flex 5x category mapping bug.",
    impact: "+$24/year average",
  },
];
