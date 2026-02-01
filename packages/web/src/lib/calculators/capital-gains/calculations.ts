import type {
  CalculatorInputs,
  CalculatorResults,
  FilingStatus,
  TaxBreakdown,
} from "./types";

// ---------------------------------------------------------------------------
// 2024/2025 Federal Long-Term Capital Gains Brackets (0%, 15%, 20%)
// Thresholds based on taxable income (ordinary income + capital gains).
// ---------------------------------------------------------------------------
const LONG_TERM_BRACKETS: Record<
  FilingStatus,
  Array<{ min: number; max: number; rate: number }>
> = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.2 },
  ],
  married_filing_jointly: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.2 },
  ],
  married_filing_separately: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 291850, rate: 0.15 },
    { min: 291850, max: Infinity, rate: 0.2 },
  ],
  head_of_household: [
    { min: 0, max: 63000, rate: 0 },
    { min: 63000, max: 551350, rate: 0.15 },
    { min: 551350, max: Infinity, rate: 0.2 },
  ],
};

// ---------------------------------------------------------------------------
// Simplified Federal Ordinary Income Brackets (short-term gains)
// ---------------------------------------------------------------------------
const ORDINARY_BRACKETS: Record<
  FilingStatus,
  Array<{ min: number; max: number; rate: number }>
> = {
  single: [
    { min: 0, max: 11600, rate: 0.1 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0, max: 23200, rate: 0.1 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  married_filing_separately: [
    { min: 0, max: 11600, rate: 0.1 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.1 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// ---------------------------------------------------------------------------
// NIIT thresholds (Net Investment Income Tax at 3.8%)
// ---------------------------------------------------------------------------
const NIIT_RATE = 0.038;
const NIIT_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  married_filing_jointly: 250000,
  married_filing_separately: 125000,
  head_of_household: 200000,
};

// ---------------------------------------------------------------------------
// State Tax Rates (simplified flat rate for top marginal rate)
// ---------------------------------------------------------------------------
const STATE_RATES: Record<string, number> = {
  AL: 0.05,
  AK: 0,
  AZ: 0.025,
  AR: 0.047,
  CA: 0.133,
  CO: 0.044,
  CT: 0.0699,
  DE: 0.066,
  FL: 0,
  GA: 0.0549,
  HI: 0.11,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0315,
  IA: 0.06,
  KS: 0.057,
  KY: 0.04,
  LA: 0.0425,
  ME: 0.0715,
  MD: 0.0575,
  MA: 0.09,
  MI: 0.0425,
  MN: 0.0985,
  MS: 0.05,
  MO: 0.048,
  MT: 0.059,
  NE: 0.0664,
  NV: 0,
  NH: 0,
  NJ: 0.1075,
  NM: 0.059,
  NY: 0.109,
  NC: 0.0525,
  ND: 0.025,
  OH: 0.0399,
  OK: 0.0475,
  OR: 0.099,
  PA: 0.0307,
  RI: 0.0599,
  SC: 0.064,
  SD: 0,
  TN: 0,
  TX: 0,
  UT: 0.0465,
  VT: 0.0875,
  VA: 0.0575,
  WA: 0,
  WV: 0.0512,
  WI: 0.0765,
  WY: 0,
  DC: 0.1075,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate marginal federal tax on ordinary income using the progressive
 * bracket system. Returns the incremental tax owed on the capital gain
 * portion by computing tax(income + gain) - tax(income).
 */
function calculateMarginalOrdinaryTax(
  baseIncome: number,
  gain: number,
  filingStatus: FilingStatus
): { tax: number; marginalRate: number } {
  const brackets = ORDINARY_BRACKETS[filingStatus];

  function taxAt(income: number) {
    let t = 0;
    for (const b of brackets) {
      if (income > b.min) {
        t += (Math.min(income, b.max) - b.min) * b.rate;
      }
    }
    return t;
  }

  const totalIncome = baseIncome + gain;
  const tax = taxAt(totalIncome) - taxAt(baseIncome);

  // Determine marginal rate at total income level
  let marginalRate = 0;
  for (const b of brackets) {
    if (totalIncome > b.min) marginalRate = b.rate;
  }

  return { tax, marginalRate };
}

/**
 * Calculate long-term capital gains federal tax. Long-term gains are stacked
 * on top of ordinary income to determine which bracket(s) apply.
 */
function calculateLongTermTax(
  ordinaryIncome: number,
  gain: number,
  filingStatus: FilingStatus
): { tax: number; effectiveRate: number } {
  if (gain <= 0) return { tax: 0, effectiveRate: 0 };

  const brackets = LONG_TERM_BRACKETS[filingStatus];
  const start = ordinaryIncome;
  const end = ordinaryIncome + gain;
  let tax = 0;

  for (const b of brackets) {
    if (end <= b.min) break;
    const taxableStart = Math.max(start, b.min);
    const taxableEnd = Math.min(end, b.max);
    if (taxableEnd > taxableStart) {
      tax += (taxableEnd - taxableStart) * b.rate;
    }
  }

  return { tax, effectiveRate: tax / gain };
}

/**
 * Calculate NIIT on net investment income when AGI exceeds the threshold.
 */
function calculateNIIT(
  agi: number,
  investmentIncome: number,
  filingStatus: FilingStatus
): number {
  const threshold = NIIT_THRESHOLDS[filingStatus];
  const excess = agi - threshold;
  if (excess <= 0) return 0;
  return Math.min(excess, investmentIncome) * NIIT_RATE;
}

/**
 * Build a full TaxBreakdown for a given holding-period scenario.
 */
function computeBreakdown(
  inputs: CalculatorInputs,
  holdingType: "short" | "long"
): TaxBreakdown {
  const capitalGain = Math.max(0, inputs.salePrice - inputs.purchasePrice);

  if (capitalGain === 0) {
    return {
      capitalGain: 0,
      federalRate: 0,
      federalTax: 0,
      stateTaxRate: 0,
      stateTax: 0,
      niitTax: 0,
      totalTax: 0,
      effectiveRate: 0,
      netProceeds: inputs.salePrice,
    };
  }

  const stateRate = STATE_RATES[inputs.state] ?? 0.05;
  const agi = inputs.annualIncome + capitalGain;

  let federalTax: number;
  let federalRate: number;

  if (holdingType === "short") {
    const result = calculateMarginalOrdinaryTax(
      inputs.annualIncome,
      capitalGain,
      inputs.filingStatus
    );
    federalTax = result.tax;
    federalRate = result.marginalRate;
  } else {
    const result = calculateLongTermTax(
      inputs.annualIncome,
      capitalGain,
      inputs.filingStatus
    );
    federalTax = result.tax;
    federalRate = result.effectiveRate;
  }

  const stateTax = capitalGain * stateRate;
  const niitTax = calculateNIIT(agi, capitalGain, inputs.filingStatus);

  const totalTax = federalTax + stateTax + niitTax;
  const effectiveRate = capitalGain > 0 ? totalTax / capitalGain : 0;
  const netProceeds = inputs.salePrice - totalTax;

  return {
    capitalGain,
    federalRate,
    federalTax,
    stateTaxRate: stateRate,
    stateTax,
    niitTax,
    totalTax,
    effectiveRate,
    netProceeds,
  };
}

// ---------------------------------------------------------------------------
// Main calculate function
// ---------------------------------------------------------------------------

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const shortTerm = computeBreakdown(inputs, "short");
  const longTerm = computeBreakdown(inputs, "long");

  const taxSavingsFromLongTerm = shortTerm.totalTax - longTerm.totalTax;

  // Generate recommendation
  let recommendation: string;
  const gain = Math.max(0, inputs.salePrice - inputs.purchasePrice);

  if (gain === 0) {
    recommendation =
      "No capital gain on this sale. If your sale price is below the purchase price, you may be able to claim a capital loss deduction.";
  } else if (taxSavingsFromLongTerm > 5000) {
    recommendation = `Holding for over one year saves you ${formatDollar(taxSavingsFromLongTerm)} in taxes. Long-term treatment significantly reduces your federal rate from ${formatRate(shortTerm.federalRate)} to ${formatRate(longTerm.federalRate)}.`;
  } else if (taxSavingsFromLongTerm > 1000) {
    recommendation = `Long-term holding saves ${formatDollar(taxSavingsFromLongTerm)}. Consider waiting past the one-year mark if you're approaching it.`;
  } else if (taxSavingsFromLongTerm > 0) {
    recommendation = `The savings from long-term holding are modest (${formatDollar(taxSavingsFromLongTerm)}). At your income level, the long-term rate is close to your marginal ordinary rate.`;
  } else {
    recommendation =
      "At your income level, long-term and short-term rates are similar. You can sell whenever it makes sense for your portfolio strategy.";
  }

  return {
    shortTerm,
    longTerm,
    taxSavingsFromLongTerm,
    recommendation,
  };
}

function formatDollar(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export { STATE_RATES };
