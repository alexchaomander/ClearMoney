import { CURRENT_RATES, I_BOND_RULES, LIQUIDITY_SCORES } from "./constants";
import type {
  CalculatorInputs,
  CalculatorResults,
  InvestmentOption,
  OptionId,
} from "./types";

const toDecimal = (percent: number) => percent / 100;

const compoundWithTaxes = (
  amount: number,
  years: number,
  rate: number,
  taxRate: number,
): { value: number; taxPaid: number } => {
  const fullYears = Math.floor(years);
  const remaining = years - fullYears;
  let value = amount;
  let taxPaid = 0;

  for (let year = 0; year < fullYears; year += 1) {
    const interest = value * rate;
    const tax = interest * taxRate;
    taxPaid += tax;
    value += interest - tax;
  }

  if (remaining > 0) {
    const interest = value * rate * remaining;
    const tax = interest * taxRate;
    taxPaid += tax;
    value += interest - tax;
  }

  return { value, taxPaid };
};

const calculateEffectiveRate = (amount: number, netValue: number, years: number) => {
  if (years <= 0 || amount <= 0) {
    return 0;
  }

  return Math.pow(netValue / amount, 1 / years) - 1;
};

const calculateIBondReturn = (
  amount: number,
  years: number,
  fixedRate: number,
  inflationRate: number,
  federalBracket: number,
): InvestmentOption => {
  // The inflationRate input is the annualized rate (e.g., 3.12%).
  // The Treasury formula uses the semiannual rate: composite = fixed + (2 × semiannual) + (fixed × semiannual)
  // Since annualized = 2 × semiannual, we have semiannual = annualized / 2
  // This simplifies to: composite = fixed + annualized + (fixed × annualized / 2)
  const semiannualInflation = inflationRate / 2;
  const compositeRate = fixedRate + 2 * semiannualInflation + fixedRate * semiannualInflation;
  const periods = years * 2;
  const periodRate = compositeRate / 2;
  let value = amount * Math.pow(1 + periodRate, periods);

  if (years < I_BOND_RULES.penaltyExpiresYears) {
    value = value / Math.pow(1 + periodRate, I_BOND_RULES.penaltyMonths / 6);
  }

  const gain = value - amount;
  const federalTax = gain * federalBracket;
  const netValue = value - federalTax;
  const effectiveRate = calculateEffectiveRate(amount, netValue, years);

  return {
    id: "i-bond",
    name: "I Bonds",
    nominalRate: compositeRate,
    afterTaxRate: effectiveRate,
    realReturn: fixedRate,
    valueAfterYears: value,
    taxPaid: federalTax,
    netValue,
    liquidityScore: years < 1 ? LIQUIDITY_SCORES.iBondLocked : LIQUIDITY_SCORES.iBond,
    pros: [
      "Inflation protected",
      "State tax exempt",
      "Deflation floor",
      "Tax-deferred growth",
    ],
    cons: [
      "1-year lockup",
      "3-month penalty if < 5 years",
      "$10,000 annual limit",
      "Rate resets every 6 months",
    ],
  };
};

const calculateHYSAReturn = (
  amount: number,
  years: number,
  rate: number,
  federalBracket: number,
  stateRate: number,
  expectedInflation: number,
): InvestmentOption => {
  const { value, taxPaid } = compoundWithTaxes(
    amount,
    years,
    rate,
    federalBracket + stateRate,
  );
  const effectiveRate = calculateEffectiveRate(amount, value, years);
  const realReturn = effectiveRate - expectedInflation;

  return {
    id: "hysa",
    name: "High-Yield Savings",
    nominalRate: rate,
    afterTaxRate: effectiveRate,
    realReturn,
    valueAfterYears: value + taxPaid,
    taxPaid,
    netValue: value,
    liquidityScore: LIQUIDITY_SCORES.hysa,
    pros: [
      "Fully liquid anytime",
      "FDIC insured",
      "No purchase limits",
      "Simple account access",
    ],
    cons: [
      "Taxed at federal AND state rates",
      "Rates can drop quickly",
      "No inflation protection",
      "Interest taxed annually",
    ],
  };
};

const calculateTIPSReturn = (
  amount: number,
  years: number,
  realYield: number,
  federalBracket: number,
  expectedInflation: number,
): InvestmentOption => {
  const nominalRate = (1 + realYield) * (1 + expectedInflation) - 1;
  const { value, taxPaid } = compoundWithTaxes(amount, years, nominalRate, federalBracket);
  const effectiveRate = calculateEffectiveRate(amount, value, years);

  return {
    id: "tips",
    name: "TIPS (5-Year)",
    nominalRate,
    afterTaxRate: effectiveRate,
    realReturn: realYield,
    valueAfterYears: value + taxPaid,
    taxPaid,
    netValue: value,
    liquidityScore: LIQUIDITY_SCORES.tips,
    pros: [
      "Inflation-adjusted principal",
      "State tax exempt",
      "Direct Treasury backing",
      "Real yield locked in",
    ],
    cons: [
      "Federal tax on inflation adjustments",
      "Price can drop if sold early",
      "Less liquid than HYSA",
      "Real yields can fluctuate",
    ],
  };
};

const calculateCDReturn = (
  amount: number,
  years: number,
  rate: number,
  federalBracket: number,
  stateRate: number,
  expectedInflation: number,
): InvestmentOption => {
  const { value, taxPaid } = compoundWithTaxes(
    amount,
    years,
    rate,
    federalBracket + stateRate,
  );
  const effectiveRate = calculateEffectiveRate(amount, value, years);

  return {
    id: "cd",
    name: "1-Year CD",
    nominalRate: rate,
    afterTaxRate: effectiveRate,
    realReturn: effectiveRate - expectedInflation,
    valueAfterYears: value + taxPaid,
    taxPaid,
    netValue: value,
    liquidityScore: LIQUIDITY_SCORES.cd,
    pros: [
      "Fixed rate locked in",
      "FDIC insured",
      "Higher yield than many savings",
      "Predictable returns",
    ],
    cons: [
      "Early withdrawal penalties",
      "Taxed at federal and state rates",
      "No inflation protection",
      "Less flexible access",
    ],
  };
};

const getBestOption = (options: InvestmentOption[]): OptionId => {
  const best = [...options].sort((a, b) => b.netValue - a.netValue)[0];
  return best.id;
};

const calculateRecommendation = (inputs: CalculatorInputs) => {
  const { amount, years, needsFullLiquidity } = inputs;

  if (needsFullLiquidity) {
    return {
      primary: "HYSA",
      allocation: [
        {
          option: "High-Yield Savings",
          percent: 100,
          reason: "You need immediate access to all funds.",
        },
      ],
    };
  }

  if (years < 1) {
    return {
      primary: "HYSA",
      allocation: [
        {
          option: "High-Yield Savings",
          percent: 100,
          reason: "I Bonds require a 12-month minimum hold.",
        },
      ],
    };
  }

  const iBondAllocation = Math.min(amount, I_BOND_RULES.annualLimit);
  const remaining = amount - iBondAllocation;

  return {
    primary: remaining > 0 ? "Split" : "I Bonds",
    allocation: [
      {
        option: "I Bonds",
        percent: (iBondAllocation / amount) * 100,
        reason: "Best after-tax, inflation-protected yield.",
      },
      ...(remaining > 0
        ? [
            {
              option: "High-Yield Savings",
              percent: (remaining / amount) * 100,
              reason: "Keep extra dollars liquid above the $10k limit.",
            },
          ]
        : []),
    ],
  };
};

const calculateEmergencyFundStrategy = (inputs: CalculatorInputs) => {
  const { amount, years, needsFullLiquidity } = inputs;

  if (needsFullLiquidity || years < 1) {
    return {
      totalNeeded: amount,
      inIBonds: 0,
      inHYSA: amount,
      reasoning: "Keep everything liquid until you can commit to a 12-month hold.",
    };
  }

  const inIBonds = Math.min(amount, I_BOND_RULES.annualLimit);
  const inHYSA = amount - inIBonds;

  return {
    totalNeeded: amount,
    inIBonds,
    inHYSA,
    reasoning:
      "Use I Bonds for inflation protection, but keep excess in HYSA for quick access.",
  };
};

export const calculate = (inputs: CalculatorInputs): CalculatorResults => {
  const fixedRate = toDecimal(inputs.iBondFixedRate);
  const inflationRate = toDecimal(inputs.iBondInflationRate);
  const hysaRate = toDecimal(inputs.hysaRate);
  const expectedInflation = toDecimal(inputs.expectedInflation);
  const federalBracket = inputs.federalBracket;
  const stateRate = toDecimal(inputs.stateRate);

  const options = [
    calculateIBondReturn(
      inputs.amount,
      inputs.years,
      fixedRate,
      inflationRate,
      federalBracket,
    ),
    calculateHYSAReturn(
      inputs.amount,
      inputs.years,
      hysaRate,
      federalBracket,
      stateRate,
      expectedInflation,
    ),
    calculateTIPSReturn(
      inputs.amount,
      inputs.years,
      CURRENT_RATES.tips.realYield,
      federalBracket,
      expectedInflation,
    ),
    calculateCDReturn(
      inputs.amount,
      inputs.years,
      CURRENT_RATES.cd.nominalRate,
      federalBracket,
      stateRate,
      expectedInflation,
    ),
  ];

  return {
    options,
    bestOption: getBestOption(options),
    recommendation: calculateRecommendation(inputs),
    emergencyFundStrategy: calculateEmergencyFundStrategy(inputs),
  };
};
