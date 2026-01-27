import type {
  CalculatorInputs,
  CalculatorResults,
  TaxBreakdown,
  WithholdingBreakdown,
} from "./types";

const FEDERAL_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.1 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.1 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
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

const SS_WAGE_BASE = 168600;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250000;
const ADDITIONAL_MEDICARE_RATE = 0.009;

const SUPPLEMENTAL_WITHHOLDING_RATE = 0.22;
const SUPPLEMENTAL_WITHHOLDING_RATE_OVER_1M = 0.37;
const SUPPLEMENTAL_WITHHOLDING_THRESHOLD = 1000000;

function calculateFederalTax(
  income: number,
  filingStatus: string
): { tax: number; marginalRate: number } {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  let tax = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
      marginalRate = bracket.rate;
    }
  }

  return { tax, marginalRate };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    sharesVesting,
    stockPrice,
    filingStatus,
    annualSalary,
    otherIncome,
    state,
    withholdingMethod,
  } = inputs;

  const grossValue = sharesVesting * stockPrice;
  const totalIncome = annualSalary + otherIncome + grossValue;
  const incomeBeforeRSU = annualSalary + otherIncome;

  const taxWithRSU = calculateFederalTax(totalIncome, filingStatus);
  const taxWithoutRSU = calculateFederalTax(incomeBeforeRSU, filingStatus);
  const federalTaxOnRSU = taxWithRSU.tax - taxWithoutRSU.tax;
  const marginalRate = taxWithRSU.marginalRate;

  const stateRate = STATE_RATES[state] || 0;
  const stateTaxOnRSU = grossValue * stateRate;

  const ssWagesBeforeRSU = Math.min(incomeBeforeRSU, SS_WAGE_BASE);
  const ssWagesAfterRSU = Math.min(totalIncome, SS_WAGE_BASE);
  const socialSecurityOnRSU = (ssWagesAfterRSU - ssWagesBeforeRSU) * SS_RATE;

  const medicareOnRSU = grossValue * MEDICARE_RATE;

  const additionalMedicareThreshold =
    filingStatus === "married"
      ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED
      : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;

  let additionalMedicareOnRSU = 0;
  if (totalIncome > additionalMedicareThreshold) {
    const additionalMedicareIncome = Math.min(
      grossValue,
      totalIncome - additionalMedicareThreshold
    );
    additionalMedicareOnRSU = Math.max(0, additionalMedicareIncome) * ADDITIONAL_MEDICARE_RATE;
  }

  const actualTax: TaxBreakdown = {
    federalIncome: federalTaxOnRSU,
    federalRate: marginalRate,
    stateIncome: stateTaxOnRSU,
    stateRate,
    socialSecurity: socialSecurityOnRSU,
    medicare: medicareOnRSU,
    additionalMedicare: additionalMedicareOnRSU,
    total:
      federalTaxOnRSU +
      stateTaxOnRSU +
      socialSecurityOnRSU +
      medicareOnRSU +
      additionalMedicareOnRSU,
    effectiveRate:
      (federalTaxOnRSU +
        stateTaxOnRSU +
        socialSecurityOnRSU +
        medicareOnRSU +
        additionalMedicareOnRSU) /
      grossValue,
  };

  // Federal supplemental withholding: 22% on first $1M, 37% on amount above $1M
  let federalWithheld: number;
  if (grossValue > SUPPLEMENTAL_WITHHOLDING_THRESHOLD) {
    federalWithheld =
      SUPPLEMENTAL_WITHHOLDING_THRESHOLD * SUPPLEMENTAL_WITHHOLDING_RATE +
      (grossValue - SUPPLEMENTAL_WITHHOLDING_THRESHOLD) * SUPPLEMENTAL_WITHHOLDING_RATE_OVER_1M;
  } else {
    federalWithheld = grossValue * SUPPLEMENTAL_WITHHOLDING_RATE;
  }

  const stateWithheld = grossValue * stateRate;

  // FICA withholding includes Social Security, Medicare, and Additional Medicare Tax
  const ficaWithheld = socialSecurityOnRSU + medicareOnRSU + additionalMedicareOnRSU;
  const totalWithheld = federalWithheld + stateWithheld + ficaWithheld;

  const sharesWithheld =
    withholdingMethod === "sell_to_cover"
      ? Math.ceil(totalWithheld / stockPrice)
      : 0;
  const sharesReceived = sharesVesting - sharesWithheld;

  const withholding: WithholdingBreakdown = {
    federalWithheld,
    stateWithheld,
    ficaWithheld,
    totalWithheld,
    sharesWithheld,
    sharesReceived,
  };

  const withholdingGap = actualTax.total - totalWithheld;
  const isUnderwithheld = withholdingGap > 0;

  const netValue = grossValue - actualTax.total;
  const netShares = netValue / stockPrice;

  const recommendations: string[] = [];

  if (isUnderwithheld && withholdingGap > 1000) {
    recommendations.push(
      `Set aside ~$${Math.round(withholdingGap).toLocaleString()} for taxes. Your company's withholding is insufficient.`
    );
  }

  if (marginalRate >= 0.32) {
    recommendations.push(
      "Consider increasing 401(k) contributions to reduce taxable income."
    );
  }

  if (stateRate > 0.1) {
    recommendations.push(
      `You're in a high-tax state (${(stateRate * 100).toFixed(1)}%). This significantly impacts your RSU value.`
    );
  }

  if (grossValue > 50000) {
    recommendations.push(
      "Consider selling some shares to diversify. Concentration risk is real."
    );
  }

  recommendations.push(
    `Your new cost basis is $${stockPrice.toFixed(2)}/share. Future gains above this are capital gains.`
  );

  return {
    grossValue,
    withholding,
    actualTax,
    withholdingGap,
    isUnderwithheld,
    netValue,
    netShares,
    effectiveTaxRate: actualTax.effectiveRate,
    marginalBracket: marginalRate,
    newCostBasis: stockPrice,
    recommendations,
  };
}

export { STATE_RATES };
