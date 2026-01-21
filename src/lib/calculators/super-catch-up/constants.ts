export const LIMITS_2026 = {
  base401k: 24500,
  regularCatchUp: 8000,
  superCatchUp: 11250,
  totalWithSuperCatchUp: 35750,
  rothCatchUpThreshold: 150000,
};

export const FILING_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head_of_household", label: "Head of household" },
] as const;

export const ESTIMATED_MARGINAL_TAX_RATE = 0.24;

export const SUPER_CATCH_UP_AGES = [60, 61, 62, 63];
