export const LIMITS_2026 = {
  base401k: 24500,
  regularCatchUp: 8000,
  superCatchUp: 11250,
  totalWithSuperCatchUp: 35750,
  rothCatchUpThreshold: 150000,
};

export const SUPER_CATCH_UP_AGES = [60, 61, 62, 63];
export const REGULAR_CATCH_UP_AGE = 50;
export const MAX_PROJECTION_YEARS = 40;

// Estimated marginal tax rate for high earners (24% bracket)
// Used to estimate the tax impact of required Roth catch-up contributions
export const ESTIMATED_MARGINAL_TAX_RATE = 0.24;
