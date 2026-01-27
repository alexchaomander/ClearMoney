/**
 * Estate Tax Constants
 *
 * These values are based on 2025 tax law.
 * The exemption amounts are adjusted annually for inflation.
 */

// =============================================================================
// FEDERAL ESTATE TAX CONSTANTS (2025)
// =============================================================================

/** Federal estate tax exemption for 2025: $13.99M per person */
export const FEDERAL_EXEMPTION_2025 = 13_990_000;

/** Federal estate tax exemption for married couples (2025): $27.98M with portability */
export const FEDERAL_EXEMPTION_MARRIED_2025 = FEDERAL_EXEMPTION_2025 * 2;

/** Projected federal exemption after TCJA sunsets in 2026: ~$7M per person */
export const FEDERAL_EXEMPTION_POST_SUNSET = 7_000_000;

/** Post-sunset exemption for married couples: ~$14M */
export const FEDERAL_EXEMPTION_MARRIED_POST_SUNSET = FEDERAL_EXEMPTION_POST_SUNSET * 2;

/** Federal estate tax rate: 40% on amounts exceeding the exemption */
export const FEDERAL_ESTATE_TAX_RATE = 0.4;

// =============================================================================
// ANNUAL GIFT TAX EXCLUSION (2025)
// =============================================================================

/** Annual gift tax exclusion for 2025: $19,000 per recipient */
export const ANNUAL_GIFT_EXCLUSION_2025 = 19_000;

/** Annual gift exclusion for married couples with gift-splitting: $38,000 per recipient */
export const ANNUAL_GIFT_EXCLUSION_MARRIED_2025 = ANNUAL_GIFT_EXCLUSION_2025 * 2;

// =============================================================================
// SUNSET TIMING
// =============================================================================

/** Date when TCJA estate tax provisions sunset */
export const EXEMPTION_SUNSET_DATE = new Date("2026-01-01T00:00:00");

// =============================================================================
// URGENCY THRESHOLDS (for sunset exposure warnings)
// =============================================================================

export const URGENCY_THRESHOLDS = {
  /** Additional tax below this is "low" urgency */
  LOW: 500_000,
  /** Additional tax below this is "moderate" urgency */
  MODERATE: 2_000_000,
  /** Additional tax below this is "high" urgency; above is "critical" */
  HIGH: 5_000_000,
} as const;

// =============================================================================
// STATE ESTATE TAX CONSTANTS
// =============================================================================

/** New York cliff threshold: lose entire exemption if estate exceeds by more than 5% */
export const NY_CLIFF_THRESHOLD = 1.05;

/** Factor to estimate average effective rate from maximum marginal rate */
export const STATE_TAX_AVG_RATE_FACTOR = 0.7;

/**
 * State Estate Tax Information
 *
 * States with estate or inheritance taxes have varying exemptions and rates.
 * This data is current as of 2025.
 */
export const STATE_ESTATE_TAX: Record<
  string,
  { exemption: number; maxRate: number; notes: string }
> = {
  CT: { exemption: 13_610_000, maxRate: 0.12, notes: "Exemption tied to federal" },
  DC: { exemption: 4_710_800, maxRate: 0.16, notes: "Graduated rates" },
  HI: { exemption: 5_490_000, maxRate: 0.2, notes: "Graduated rates 10-20%" },
  IL: { exemption: 4_000_000, maxRate: 0.16, notes: "Graduated rates 0.8-16%" },
  ME: { exemption: 6_800_000, maxRate: 0.12, notes: "Graduated rates 8-12%" },
  MD: { exemption: 5_000_000, maxRate: 0.16, notes: "Also has inheritance tax" },
  MA: { exemption: 1_000_000, maxRate: 0.16, notes: "Low exemption, graduated rates" },
  MN: { exemption: 3_000_000, maxRate: 0.16, notes: "Graduated rates" },
  NY: { exemption: 6_940_000, maxRate: 0.16, notes: "Cliff: lose entire exemption if 5% over" },
  OR: { exemption: 1_000_000, maxRate: 0.16, notes: "Very low exemption" },
  RI: { exemption: 1_774_583, maxRate: 0.16, notes: "Indexed for inflation" },
  VT: { exemption: 5_000_000, maxRate: 0.16, notes: "Graduated rates" },
  WA: { exemption: 2_193_000, maxRate: 0.2, notes: "Highest state rate at 20%" },
} as const;

// =============================================================================
// PLANNING OPPORTUNITY THRESHOLDS
// =============================================================================

/** Minimum business interests value to suggest GRAT strategy */
export const GRAT_BUSINESS_THRESHOLD = 1_000_000;

/** Minimum brokerage account value to suggest GRAT strategy */
export const GRAT_BROKERAGE_THRESHOLD = 2_000_000;

/** Assumed annual appreciation rate for GRAT savings calculation */
export const GRAT_APPRECIATION_ASSUMPTION = 0.05;

/** Minimum state tax due to suggest relocation strategy */
export const STATE_RELOCATION_THRESHOLD = 100_000;

// =============================================================================
// WARNING THRESHOLDS
// =============================================================================

/** Life insurance warning threshold: warn if > 10% of exemption */
export const LIFE_INSURANCE_WARNING_FACTOR = 0.1;

/** NY cliff warning threshold: warn if estate > 90% of exemption */
export const NY_CLIFF_WARNING_FACTOR = 0.9;
