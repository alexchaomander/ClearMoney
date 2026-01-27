export const LIMITS_2026 = {
  catchUpThreshold: 150000,
  regularCatchUp: 8000,
  superCatchUp: 11250,
  base401k: 24500,
};

export const MAX_CATCH_UP_YEARS = 15;

export const TAX_RATE_OPTIONS = [10, 12, 22, 24, 32, 35, 37];

export const FILING_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "head_of_household", label: "Head of Household" },
] as const;

export const THRESHOLD_MARGIN = 10000;

export const ALTERNATIVE_STRATEGIES = {
  noRothOption: [
    "Ask HR if the plan will add a Roth option before 2026.",
    "Increase regular 401(k) contributions up to the base limit.",
    "Use a Roth IRA or backdoor Roth if eligible.",
    "Direct excess savings to a taxable brokerage account.",
  ],
  underThreshold: [
    "Consider Roth vs Traditional based on your retirement tax outlook.",
    "Use catch-up contributions to reduce required minimum distributions later.",
  ],
};
