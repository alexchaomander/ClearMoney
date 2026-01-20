# Agent Prompt: Stock Option Exercise Decision Tool

## Your Mission

Build the Stock Option Exercise Decision Tool for ClearMoney. This tool helps employees with stock options (ISOs or NSOs) understand when and how to exercise, modeling different scenarios including tax implications, AMT impact, and cash flow requirements.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/stock-option-exercise/`
**Your calculator logic:** `/src/lib/calculators/stock-option-exercise/`
**Branch name:** `feature/app-stock-option-exercise`

## Background Research

**The Problem:**
- Stock option exercise decisions can swing taxes by 6 figures
- Most employees don't understand ISO vs NSO tax treatment
- AMT (Alternative Minimum Tax) catches ISO holders off guard
- 90-day post-termination exercise windows create urgent decisions
- Wrong timing can mean losing LTCG treatment or triggering massive AMT

**Types of Stock Options:**

**ISOs (Incentive Stock Options):**
- No tax at exercise (if held)
- Bargain element is AMT preference item
- Must hold 2 years from grant + 1 year from exercise for LTCG
- "Disqualifying disposition" if sold early = ordinary income
- Only available to employees

**NSOs (Non-Qualified Stock Options):**
- Taxed as ordinary income at exercise (spread × shares)
- FICA taxes also apply (Social Security + Medicare)
- No AMT impact
- Available to contractors, advisors, employees

**Key Exercise Strategies:**
1. **Exercise and Hold:** Pay for exercise, hold for LTCG (ISO or NSO)
2. **Exercise and Sell (Same-Day):** No cash outlay, immediate liquidity
3. **Cashless Exercise:** Use portion of shares to cover cost
4. **Early Exercise + 83(b):** Exercise before vesting at low FMV

**AMT (Alternative Minimum Tax):**
- ISO spread is an AMT preference item
- AMT rate: 26% up to $220,700, 28% above
- AMT exemption (2024): $85,700 single, $133,300 married
- AMT credit can be recaptured in future years

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Amber (#f59e0b) - decision-focused, wealth
- **Design Style:** Scenario comparison, decision-support
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Option Grant Details
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| optionType | Option Type | iso | iso, nso |
| totalOptions | Total Options | 10000 | 1 | 1000000 | 100 |
| strikePrice | Strike Price | 5 | 0.01 | 1000 | 0.01 |
| currentFMV | Current FMV | 50 | 0.01 | 5000 | 0.01 |
| vestedOptions | Vested Options | 2500 | 0 | 1000000 | 100 |
| grantDate | Grant Date | 2022-01-01 | date |
| vestStartDate | Vest Start Date | 2022-01-01 | date |

### Tax Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| filingStatus | Filing Status | single | single, married, head_of_household |
| annualIncome | Annual Income (W-2) | 200000 | 0 | 5000000 | 10000 |
| stateCode | State | CA | (all states) |
| existingAMTPreference | Other AMT Preference Items | 0 | 0 | 1000000 | 1000 |

### Exercise Scenario
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| optionsToExercise | Options to Exercise | 2500 | 0 | 1000000 | 100 |
| exerciseDate | Planned Exercise Date | today | date |
| holdingPeriod | Holding Period (months) | 12 | 0 | 60 | 1 |
| expectedFMVAtSale | Expected FMV at Sale | 75 | 0.01 | 10000 | 1 |

## Calculation Logic

```typescript
// src/lib/calculators/stock-option-exercise/types.ts
export type OptionType = 'iso' | 'nso';
export type FilingStatus = 'single' | 'married' | 'head_of_household';
export type ExerciseStrategy = 'exercise_and_hold' | 'exercise_and_sell' | 'cashless';

export interface OptionGrant {
  optionType: OptionType;
  totalOptions: number;
  vestedOptions: number;
  strikePrice: number;
  currentFMV: number;
  grantDate: Date;
  vestStartDate: Date;
}

export interface TaxInfo {
  filingStatus: FilingStatus;
  annualIncome: number;
  stateCode: string;
  existingAMTPreference: number;
}

export interface ExerciseScenario {
  optionsToExercise: number;
  exerciseDate: Date;
  holdingPeriod: number; // months
  expectedFMVAtSale: number;
}

export interface CalculatorInputs {
  option: OptionGrant;
  tax: TaxInfo;
  scenario: ExerciseScenario;
}

export interface ExerciseCost {
  cashRequired: number;        // strike × shares
  isoAMTLiability: number;     // AMT triggered by ISO spread
  nsoOrdinaryIncome: number;   // Ordinary income for NSO
  nsoFederalTax: number;
  nsoStateTax: number;
  nsoFICATax: number;
  totalOutOfPocket: number;
}

export interface SaleAnalysis {
  saleProceeds: number;
  totalGain: number;
  qualifiesForLTCG: boolean;   // ISO: 2yr+1yr rule
  capitalGainType: 'short_term' | 'long_term' | 'ordinary'; // ISO disqualifying = ordinary
  federalTaxOnSale: number;
  stateTaxOnSale: number;
  niitTax: number;
  netProceeds: number;
}

export interface ScenarioComparison {
  strategy: ExerciseStrategy;
  exerciseCost: ExerciseCost;
  saleAnalysis: SaleAnalysis;
  totalTaxPaid: number;
  netProfit: number;
  effectiveTaxRate: number;
  cashFlowTimeline: {
    date: string;
    event: string;
    amount: number;
    cumulative: number;
  }[];
}

export interface AMTAnalysis {
  regularTax: number;
  tentativeMinimumTax: number;
  amtOwed: number;
  isInAMT: boolean;
  amtCreditGenerated: number;
  effectiveAMTRate: number;
  breakEvenSpread: number; // How much spread triggers AMT
}

export interface CalculatorResults {
  // Scenario comparisons
  exerciseAndHold: ScenarioComparison;
  exerciseAndSell: ScenarioComparison;
  cashlessExercise: ScenarioComparison;

  // AMT Analysis (ISO only)
  amtAnalysis: AMTAnalysis | null;

  // Key metrics
  bargainElement: number;           // (FMV - strike) × shares
  exerciseCost: number;             // strike × shares
  intrinsicValue: number;           // FMV × shares

  // Qualifying disposition analysis (ISO)
  qualifyingDispositionDate: Date | null;
  daysUntilQualifying: number | null;

  // Recommendations
  recommendedStrategy: ExerciseStrategy;
  recommendations: string[];
  warnings: string[];
}
```

```typescript
// src/lib/calculators/stock-option-exercise/calculations.ts
import type { CalculatorInputs, CalculatorResults, ExerciseCost, SaleAnalysis, ScenarioComparison, AMTAnalysis } from "./types";

// 2024 Federal Tax Brackets
const FEDERAL_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// Capital gains rates
const LTCG_BRACKETS = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.20 },
  ],
  married: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.20 },
  ],
  head_of_household: [
    { min: 0, max: 63000, rate: 0 },
    { min: 63000, max: 551350, rate: 0.15 },
    { min: 551350, max: Infinity, rate: 0.20 },
  ],
};

// AMT parameters
const AMT_EXEMPTION = {
  single: 85700,
  married: 133300,
  head_of_household: 85700,
};

const AMT_PHASEOUT_START = {
  single: 609350,
  married: 1218700,
  head_of_household: 609350,
};

const AMT_RATE_THRESHOLD = 220700;

// NIIT threshold
const NIIT_THRESHOLD = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

// State tax rates (simplified - top marginal rate)
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.133, NY: 0.109, NJ: 0.1075, OR: 0.099, MN: 0.0985,
  HI: 0.11, VT: 0.0875, IA: 0.085, WI: 0.0765, ME: 0.0715,
  SC: 0.07, CT: 0.0699, ID: 0.058, MT: 0.0675, NE: 0.0684,
  DE: 0.066, WV: 0.065, GA: 0.055, MA: 0.05, VA: 0.0575,
  DC: 0.085, RI: 0.0599, NC: 0.0525, KY: 0.045, OK: 0.0475,
  MS: 0.05, AR: 0.047, MO: 0.048, KS: 0.057, LA: 0.0425,
  AL: 0.05, MI: 0.0425, AZ: 0.025, IN: 0.0305, PA: 0.0307,
  OH: 0.0399, ND: 0.0225, IL: 0.0495, UT: 0.0465, CO: 0.044,
  NM: 0.059, WA: 0, TX: 0, FL: 0, NV: 0, SD: 0, WY: 0,
  AK: 0, TN: 0, NH: 0,
};

function calculateFederalTax(income: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

function getMarginalRate(income: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }
  return 0.37;
}

function calculateLTCGTax(gain: number, ordinaryIncome: number, filingStatus: string): number {
  const brackets = LTCG_BRACKETS[filingStatus as keyof typeof LTCG_BRACKETS];
  // LTCG "stacks on top" of ordinary income for rate determination
  const totalIncome = ordinaryIncome + gain;

  let tax = 0;
  let gainRemaining = gain;

  for (const bracket of brackets) {
    if (gainRemaining <= 0) break;

    // How much of this bracket is "used" by ordinary income?
    const ordinaryInBracket = Math.max(0, Math.min(ordinaryIncome, bracket.max) - bracket.min);
    const bracketSize = bracket.max - bracket.min - ordinaryInBracket;

    if (totalIncome > bracket.min) {
      const taxableInBracket = Math.min(gainRemaining, bracketSize);
      tax += taxableInBracket * bracket.rate;
      gainRemaining -= taxableInBracket;
    }
  }

  return tax;
}

function calculateAMT(
  regularIncome: number,
  isoSpread: number,
  existingPreference: number,
  filingStatus: string
): AMTAnalysis {
  const exemption = AMT_EXEMPTION[filingStatus as keyof typeof AMT_EXEMPTION];
  const phaseoutStart = AMT_PHASEOUT_START[filingStatus as keyof typeof AMT_PHASEOUT_START];

  // AMT income
  const amtIncome = regularIncome + isoSpread + existingPreference;

  // Exemption phaseout (25 cents per dollar over threshold)
  let adjustedExemption = exemption;
  if (amtIncome > phaseoutStart) {
    const phaseout = (amtIncome - phaseoutStart) * 0.25;
    adjustedExemption = Math.max(0, exemption - phaseout);
  }

  const amtBase = Math.max(0, amtIncome - adjustedExemption);

  // AMT rates: 26% up to threshold, 28% above
  let tentativeMinimumTax = 0;
  if (amtBase <= AMT_RATE_THRESHOLD) {
    tentativeMinimumTax = amtBase * 0.26;
  } else {
    tentativeMinimumTax = AMT_RATE_THRESHOLD * 0.26 + (amtBase - AMT_RATE_THRESHOLD) * 0.28;
  }

  const regularTax = calculateFederalTax(regularIncome, filingStatus);
  const amtOwed = Math.max(0, tentativeMinimumTax - regularTax);

  // Calculate break-even spread (where AMT kicks in)
  let breakEvenSpread = 0;
  if (amtOwed === 0) {
    // Binary search to find where AMT kicks in
    let low = 0;
    let high = 10000000;
    while (high - low > 100) {
      const mid = (low + high) / 2;
      const testAMT = calculateAMT(regularIncome, mid, existingPreference, filingStatus);
      if (testAMT.amtOwed > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }
    breakEvenSpread = high;
  }

  return {
    regularTax,
    tentativeMinimumTax,
    amtOwed,
    isInAMT: amtOwed > 0,
    amtCreditGenerated: amtOwed, // ISO AMT generates credit for future years
    effectiveAMTRate: isoSpread > 0 ? amtOwed / isoSpread : 0,
    breakEvenSpread,
  };
}

function calculateScenario(
  inputs: CalculatorInputs,
  strategy: 'exercise_and_hold' | 'exercise_and_sell' | 'cashless'
): ScenarioComparison {
  const { option, tax, scenario } = inputs;
  const { optionsToExercise } = scenario;

  const bargainElement = (option.currentFMV - option.strikePrice) * optionsToExercise;
  const cashRequired = option.strikePrice * optionsToExercise;
  const intrinsicValue = option.currentFMV * optionsToExercise;

  // Exercise costs
  let exerciseCost: ExerciseCost = {
    cashRequired: 0,
    isoAMTLiability: 0,
    nsoOrdinaryIncome: 0,
    nsoFederalTax: 0,
    nsoStateTax: 0,
    nsoFICATax: 0,
    totalOutOfPocket: 0,
  };

  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;

  if (option.optionType === 'iso') {
    // ISO: No regular tax at exercise, but AMT on spread
    if (strategy === 'exercise_and_hold') {
      exerciseCost.cashRequired = cashRequired;
      const amtAnalysis = calculateAMT(tax.annualIncome, bargainElement, tax.existingAMTPreference, tax.filingStatus);
      exerciseCost.isoAMTLiability = amtAnalysis.amtOwed;
      exerciseCost.totalOutOfPocket = cashRequired + amtAnalysis.amtOwed;
    } else {
      // Same-day sale = disqualifying disposition = ordinary income
      exerciseCost.nsoOrdinaryIncome = bargainElement;
      const marginalRate = getMarginalRate(tax.annualIncome + bargainElement, tax.filingStatus);
      exerciseCost.nsoFederalTax = bargainElement * marginalRate;
      exerciseCost.nsoStateTax = bargainElement * stateRate;
      // No FICA on ISO disqualifying disposition
      exerciseCost.totalOutOfPocket = strategy === 'cashless' ? 0 : cashRequired;
    }
  } else {
    // NSO: Ordinary income at exercise
    exerciseCost.nsoOrdinaryIncome = bargainElement;
    const marginalRate = getMarginalRate(tax.annualIncome + bargainElement, tax.filingStatus);
    exerciseCost.nsoFederalTax = bargainElement * marginalRate;
    exerciseCost.nsoStateTax = bargainElement * stateRate;

    // FICA on NSO spread (Social Security up to limit, Medicare always)
    const ssCap = 168600;
    const ssIncome = Math.min(tax.annualIncome, ssCap);
    const remainingSS = Math.max(0, ssCap - ssIncome);
    const ssOnSpread = Math.min(bargainElement, remainingSS) * 0.062;
    const medicareOnSpread = bargainElement * 0.0145;
    const additionalMedicare = (tax.annualIncome + bargainElement) > 200000 ? bargainElement * 0.009 : 0;
    exerciseCost.nsoFICATax = ssOnSpread + medicareOnSpread + additionalMedicare;

    exerciseCost.cashRequired = strategy === 'cashless' ? 0 : cashRequired;
    exerciseCost.totalOutOfPocket = exerciseCost.cashRequired + exerciseCost.nsoFederalTax + exerciseCost.nsoStateTax + exerciseCost.nsoFICATax;
  }

  // Sale analysis
  let saleAnalysis: SaleAnalysis;

  if (strategy === 'exercise_and_hold') {
    const saleProceeds = scenario.expectedFMVAtSale * optionsToExercise;
    const totalGain = saleProceeds - cashRequired;

    // Check qualifying disposition for ISO
    const grantDate = new Date(option.grantDate);
    const exerciseDate = new Date(scenario.exerciseDate);
    const saleDate = new Date(exerciseDate);
    saleDate.setMonth(saleDate.getMonth() + scenario.holdingPeriod);

    const twoYearsFromGrant = new Date(grantDate);
    twoYearsFromGrant.setFullYear(twoYearsFromGrant.getFullYear() + 2);

    const oneYearFromExercise = new Date(exerciseDate);
    oneYearFromExercise.setFullYear(oneYearFromExercise.getFullYear() + 1);

    const qualifiesForLTCG = option.optionType === 'nso'
      ? scenario.holdingPeriod >= 12
      : saleDate >= twoYearsFromGrant && saleDate >= oneYearFromExercise;

    let capitalGainType: 'short_term' | 'long_term' | 'ordinary' =
      qualifiesForLTCG ? 'long_term' : 'short_term';

    // For ISO, LTCG basis is strike price; for NSO, basis is FMV at exercise
    const costBasis = option.optionType === 'iso' ? cashRequired : intrinsicValue;
    const capitalGain = saleProceeds - costBasis;

    let federalTaxOnSale = 0;
    let stateTaxOnSale = 0;
    let niitTax = 0;

    if (capitalGainType === 'long_term') {
      federalTaxOnSale = calculateLTCGTax(capitalGain, tax.annualIncome, tax.filingStatus);
    } else {
      federalTaxOnSale = capitalGain * getMarginalRate(tax.annualIncome + capitalGain, tax.filingStatus);
    }

    stateTaxOnSale = capitalGain * stateRate;

    // NIIT: 3.8% on investment income if over threshold
    const niitThreshold = NIIT_THRESHOLD[tax.filingStatus as keyof typeof NIIT_THRESHOLD];
    if (tax.annualIncome + capitalGain > niitThreshold) {
      const niitableIncome = Math.min(capitalGain, (tax.annualIncome + capitalGain) - niitThreshold);
      niitTax = niitableIncome * 0.038;
    }

    saleAnalysis = {
      saleProceeds,
      totalGain,
      qualifiesForLTCG,
      capitalGainType,
      federalTaxOnSale,
      stateTaxOnSale,
      niitTax,
      netProceeds: saleProceeds - federalTaxOnSale - stateTaxOnSale - niitTax,
    };
  } else {
    // Exercise and sell or cashless - immediate sale
    saleAnalysis = {
      saleProceeds: intrinsicValue,
      totalGain: bargainElement,
      qualifiesForLTCG: false,
      capitalGainType: option.optionType === 'iso' ? 'ordinary' : 'short_term',
      federalTaxOnSale: 0, // Already taxed at exercise
      stateTaxOnSale: 0,
      niitTax: 0,
      netProceeds: intrinsicValue - exerciseCost.nsoFederalTax - exerciseCost.nsoStateTax - exerciseCost.nsoFICATax - exerciseCost.cashRequired,
    };
  }

  const totalTaxPaid = exerciseCost.isoAMTLiability + exerciseCost.nsoFederalTax + exerciseCost.nsoStateTax + exerciseCost.nsoFICATax + saleAnalysis.federalTaxOnSale + saleAnalysis.stateTaxOnSale + saleAnalysis.niitTax;

  const netProfit = (strategy === 'exercise_and_hold' ? saleAnalysis.netProceeds : saleAnalysis.netProceeds) - exerciseCost.cashRequired;

  const effectiveTaxRate = totalTaxPaid / bargainElement;

  // Build cash flow timeline
  const cashFlowTimeline: ScenarioComparison['cashFlowTimeline'] = [];
  const exerciseDateStr = new Date(scenario.exerciseDate).toLocaleDateString();

  if (strategy === 'exercise_and_hold') {
    cashFlowTimeline.push({
      date: exerciseDateStr,
      event: 'Exercise options',
      amount: -exerciseCost.cashRequired,
      cumulative: -exerciseCost.cashRequired,
    });

    if (exerciseCost.isoAMTLiability > 0) {
      cashFlowTimeline.push({
        date: 'April (Tax Day)',
        event: 'AMT payment',
        amount: -exerciseCost.isoAMTLiability,
        cumulative: -exerciseCost.cashRequired - exerciseCost.isoAMTLiability,
      });
    }

    const saleDate = new Date(scenario.exerciseDate);
    saleDate.setMonth(saleDate.getMonth() + scenario.holdingPeriod);

    cashFlowTimeline.push({
      date: saleDate.toLocaleDateString(),
      event: 'Sell shares',
      amount: saleAnalysis.saleProceeds,
      cumulative: saleAnalysis.netProceeds - exerciseCost.cashRequired - exerciseCost.isoAMTLiability,
    });
  } else {
    cashFlowTimeline.push({
      date: exerciseDateStr,
      event: strategy === 'cashless' ? 'Cashless exercise' : 'Exercise + sell',
      amount: saleAnalysis.netProceeds,
      cumulative: saleAnalysis.netProceeds,
    });
  }

  return {
    strategy,
    exerciseCost,
    saleAnalysis,
    totalTaxPaid,
    netProfit,
    effectiveTaxRate,
    cashFlowTimeline,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { option, tax, scenario } = inputs;

  const bargainElement = (option.currentFMV - option.strikePrice) * scenario.optionsToExercise;
  const exerciseCost = option.strikePrice * scenario.optionsToExercise;
  const intrinsicValue = option.currentFMV * scenario.optionsToExercise;

  // Calculate all three scenarios
  const exerciseAndHold = calculateScenario(inputs, 'exercise_and_hold');
  const exerciseAndSell = calculateScenario(inputs, 'exercise_and_sell');
  const cashlessExercise = calculateScenario(inputs, 'cashless');

  // AMT analysis for ISOs
  let amtAnalysis: AMTAnalysis | null = null;
  if (option.optionType === 'iso') {
    amtAnalysis = calculateAMT(
      tax.annualIncome,
      bargainElement,
      tax.existingAMTPreference,
      tax.filingStatus
    );
  }

  // Qualifying disposition date calculation (ISO only)
  let qualifyingDispositionDate: Date | null = null;
  let daysUntilQualifying: number | null = null;

  if (option.optionType === 'iso') {
    const grantDate = new Date(option.grantDate);
    const exerciseDate = new Date(scenario.exerciseDate);

    const twoYearsFromGrant = new Date(grantDate);
    twoYearsFromGrant.setFullYear(twoYearsFromGrant.getFullYear() + 2);

    const oneYearFromExercise = new Date(exerciseDate);
    oneYearFromExercise.setFullYear(oneYearFromExercise.getFullYear() + 1);

    qualifyingDispositionDate = twoYearsFromGrant > oneYearFromExercise ? twoYearsFromGrant : oneYearFromExercise;

    const today = new Date();
    daysUntilQualifying = Math.max(0, Math.ceil((qualifyingDispositionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Determine recommended strategy
  let recommendedStrategy: 'exercise_and_hold' | 'exercise_and_sell' | 'cashless';
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Compare net profits
  const strategies = [
    { strategy: 'exercise_and_hold' as const, profit: exerciseAndHold.netProfit, taxRate: exerciseAndHold.effectiveTaxRate },
    { strategy: 'exercise_and_sell' as const, profit: exerciseAndSell.netProfit, taxRate: exerciseAndSell.effectiveTaxRate },
    { strategy: 'cashless' as const, profit: cashlessExercise.netProfit, taxRate: cashlessExercise.effectiveTaxRate },
  ];

  const bestStrategy = strategies.reduce((best, current) =>
    current.profit > best.profit ? current : best
  );

  recommendedStrategy = bestStrategy.strategy;

  // Generate recommendations and warnings
  if (option.optionType === 'iso') {
    if (amtAnalysis && amtAnalysis.isInAMT) {
      warnings.push(`This exercise will trigger $${amtAnalysis.amtOwed.toLocaleString()} in AMT. You'll get an AMT credit to use in future years.`);
    }

    if (exerciseAndHold.exerciseCost.totalOutOfPocket > tax.annualIncome * 0.2) {
      warnings.push(`Exercise cost (${((exerciseAndHold.exerciseCost.totalOutOfPocket / tax.annualIncome) * 100).toFixed(0)}% of income) is significant. Ensure you have liquidity.`);
    }

    if (qualifyingDispositionDate && daysUntilQualifying && daysUntilQualifying > 0) {
      recommendations.push(`Hold until ${qualifyingDispositionDate.toLocaleDateString()} (${daysUntilQualifying} days) for long-term capital gains treatment.`);
    }

    if (amtAnalysis && !amtAnalysis.isInAMT && amtAnalysis.breakEvenSpread > 0) {
      recommendations.push(`You can exercise up to $${amtAnalysis.breakEvenSpread.toLocaleString()} in spread before triggering AMT.`);
    }
  } else {
    recommendations.push(`NSO spread is taxed as ordinary income at exercise. Consider timing exercise in a lower-income year.`);

    if (exerciseAndHold.saleAnalysis.qualifiesForLTCG) {
      const ltcgSavings = exerciseAndSell.totalTaxPaid - exerciseAndHold.totalTaxPaid;
      if (ltcgSavings > 0) {
        recommendations.push(`Holding for ${scenario.holdingPeriod} months saves $${ltcgSavings.toLocaleString()} via LTCG rates.`);
      }
    }
  }

  // Concentration warning
  if (intrinsicValue > tax.annualIncome * 0.5) {
    warnings.push(`This represents significant concentration in one stock. Consider diversification after exercise.`);
  }

  return {
    exerciseAndHold,
    exerciseAndSell,
    cashlessExercise,
    amtAnalysis,
    bargainElement,
    exerciseCost,
    intrinsicValue,
    qualifyingDispositionDate,
    daysUntilQualifying,
    recommendedStrategy,
    recommendations,
    warnings,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Stock Option Exercise Decision Tool"
   - Subtitle: "Model different exercise scenarios—understand AMT, taxes, and cash flow"

2. **Option Details Section**
   - Option type toggle (ISO/NSO)
   - Grant details inputs
   - Strike price and current FMV
   - Visual showing "in the money" amount

3. **Tax Profile Section**
   - Filing status, income, state
   - For ISOs: existing AMT preference items

4. **Exercise Scenario Section**
   - Options to exercise (slider)
   - Planned exercise date
   - Expected holding period
   - Expected FMV at sale

5. **Scenario Comparison Cards** (3 columns)
   - **Exercise & Hold:** LTCG strategy
   - **Exercise & Sell:** Immediate liquidity
   - **Cashless Exercise:** No cash outlay
   - Each shows: Cash required, taxes, net profit

6. **AMT Analysis Section** (ISO only)
   - Regular tax vs AMT comparison
   - AMT credit generated
   - Break-even spread calculator

7. **Cash Flow Timeline**
   - Visual timeline of cash in/out
   - Key dates highlighted

8. **Qualifying Disposition Tracker** (ISO only)
   - Days until qualifying
   - Grant date + 2 years
   - Exercise date + 1 year

9. **Recommendations Panel**
   - Strategy recommendation with reasoning
   - Warnings (AMT, concentration, liquidity)
   - Actionable next steps

10. **Methodology Section** (collapsible)
    - ISO vs NSO tax treatment
    - AMT calculation explanation
    - LTCG holding period rules

## Files to Create

```
src/
├── app/tools/stock-option-exercise/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/stock-option-exercise/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "stock-option-exercise",
  name: "Stock Option Exercise Decision Tool",
  description: "Model ISO/NSO exercise scenarios—AMT impact, taxes, and optimal timing",
  href: "/tools/stock-option-exercise",
  categoryId: "equity-compensation",
  status: "live",
  primaryColor: "#f59e0b",
  designStyle: "analytical",
  inspiredBy: ["Secfi", "Compound Planning"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] ISO exercise triggers correct AMT calculation
- [ ] NSO exercise includes FICA taxes
- [ ] Qualifying disposition dates calculated correctly
- [ ] LTCG vs STCG rates applied properly
- [ ] Cashless exercise shows no cash outlay
- [ ] All three scenarios compare correctly
- [ ] Recommendations make sense for different situations

## Git Workflow

```bash
git checkout -b feature/app-stock-option-exercise
# ... build the app ...
git add .
git commit -m "Add Stock Option Exercise Decision Tool"
git push -u origin feature/app-stock-option-exercise
```

## Do NOT

- Modify shared components
- Provide specific tax advice (educational only)
- Ignore AMT for ISO exercises
- Forget FICA taxes on NSO exercises
- Skip the qualifying disposition rules
- Oversimplify—these decisions can cost users tens of thousands
