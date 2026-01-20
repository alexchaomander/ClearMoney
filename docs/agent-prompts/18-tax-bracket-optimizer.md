# Agent Prompt: Tax Bracket Optimizer

## Your Mission

Build the Tax Bracket Optimizer for ClearMoney. This tool helps high-income earners visualize exactly where they fall in the tax bracket system, understand marginal vs effective rates, and identify strategies to stay below key thresholds like NIIT, IRMAA, and bracket boundaries.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/tax-bracket-optimizer/`
**Your calculator logic:** `/src/lib/calculators/tax-bracket-optimizer/`
**Branch name:** `feature/app-tax-bracket-optimizer`

## Background Research

**The Problem:**
- People don't understand marginal vs effective tax rates
- "I don't want to make more because I'll be in a higher bracket" is a common misconception
- High earners don't realize how much control they have over bracket positioning
- Hidden tax cliffs (NIIT, IRMAA, ACA subsidies) can create >100% marginal rates
- Capital gains brackets are separate from ordinary income brackets

**Key Concepts:**

**Marginal vs Effective Tax Rate:**
- Marginal: Rate on your next dollar (what bracket you're in)
- Effective: Total tax / Total income (your actual average rate)
- Example: $200K income, 32% marginal bracket, ~22% effective rate

**Key Federal Thresholds (2024):**
- $47,150 → 22% bracket (single)
- $100,525 → 24% bracket (single)
- $191,950 → 32% bracket (single)
- $243,725 → 35% bracket (single)
- $609,350 → 37% bracket (single)
- $200,000 → 3.8% NIIT kicks in (single)
- $250,000 → 3.8% NIIT kicks in (married)

**Capital Gains Brackets (2024):**
- 0% up to $47,025 (single)
- 15% from $47,025 to $518,900
- 20% above $518,900
- Plus 3.8% NIIT if over threshold

**Medicare IRMAA (Income-Related Monthly Adjustment Amount):**
Higher Medicare Part B/D premiums if MAGI exceeds:
- Tier 1: $103,000 single / $206,000 married
- Tier 2: $129,000 / $258,000
- Tier 3: $161,000 / $322,000
- Tier 4: $193,000 / $386,000
- Tier 5: $500,000 / $750,000+

**Optimization Strategies:**
1. Roth conversions to "fill up" lower brackets
2. Timing income recognition
3. Bunching deductions
4. Capital gains harvesting at 0% rate
5. Charitable giving strategies

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Teal (#14b8a6) - clarity, financial planning
- **Design Style:** Visual, bracket-focused, interactive
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Income Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| filingStatus | Filing Status | single | single, married, head_of_household |
| wagesIncome | W-2 Wages | 200000 | 0 | 5000000 | 5000 |
| selfEmploymentIncome | Self-Employment Income | 0 | 0 | 2000000 | 5000 |
| shortTermCapitalGains | Short-Term Capital Gains | 0 | -500000 | 2000000 | 1000 |
| longTermCapitalGains | Long-Term Capital Gains | 0 | -500000 | 2000000 | 1000 |
| qualifiedDividends | Qualified Dividends | 5000 | 0 | 500000 | 1000 |
| ordinaryDividends | Ordinary Dividends | 1000 | 0 | 500000 | 1000 |
| interestIncome | Interest Income | 2000 | 0 | 500000 | 1000 |
| rentalIncome | Rental Income (Net) | 0 | -100000 | 500000 | 1000 |
| otherOrdinaryIncome | Other Ordinary Income | 0 | 0 | 1000000 | 1000 |

### Deductions
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| deductionType | Deduction Type | standard | standard, itemized |
| stateLocalTaxes | State & Local Taxes | 10000 | 0 | 50000 | 1000 |
| mortgageInterest | Mortgage Interest | 0 | 0 | 100000 | 1000 |
| charitableGiving | Charitable Contributions | 0 | 0 | 500000 | 1000 |
| otherItemized | Other Itemized | 0 | 0 | 100000 | 1000 |
| retirement401k | 401(k) Contributions | 23000 | 0 | 30500 | 500 |
| traditionalIRA | Traditional IRA Contribution | 0 | 0 | 8000 | 500 |
| hsaContribution | HSA Contribution | 0 | 0 | 8300 | 100 |

### Scenario Modeling
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| rothConversionAmount | Roth Conversion Amount | 0 | 0 | 500000 |
| additionalIncome | Additional Income (what-if) | 0 | 0 | 1000000 |
| additionalDeduction | Additional Deduction (what-if) | 0 | 0 | 200000 |

## Calculation Logic

```typescript
// src/lib/calculators/tax-bracket-optimizer/types.ts
export type FilingStatus = 'single' | 'married' | 'head_of_household';
export type DeductionType = 'standard' | 'itemized';

export interface IncomeInputs {
  wagesIncome: number;
  selfEmploymentIncome: number;
  shortTermCapitalGains: number;
  longTermCapitalGains: number;
  qualifiedDividends: number;
  ordinaryDividends: number;
  interestIncome: number;
  rentalIncome: number;
  otherOrdinaryIncome: number;
}

export interface DeductionInputs {
  deductionType: DeductionType;
  stateLocalTaxes: number;
  mortgageInterest: number;
  charitableGiving: number;
  otherItemized: number;
  retirement401k: number;
  traditionalIRA: number;
  hsaContribution: number;
}

export interface ScenarioInputs {
  rothConversionAmount: number;
  additionalIncome: number;
  additionalDeduction: number;
}

export interface CalculatorInputs {
  filingStatus: FilingStatus;
  income: IncomeInputs;
  deductions: DeductionInputs;
  scenario: ScenarioInputs;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  taxInBracket: number;
  cumulativeTax: number;
  yourIncomeInBracket: number;
  yourTaxInBracket: number;
}

export interface BracketVisualization {
  brackets: TaxBracket[];
  yourPosition: number;
  marginalRate: number;
  effectiveRate: number;
  roomInCurrentBracket: number;
  nextBracketStarts: number;
}

export interface CapitalGainsAnalysis {
  qualifiedIncome: number;    // LTCG + qualified dividends
  ordinaryIncome: number;
  capitalGainsRate: number;
  capitalGainsTax: number;
  niitApplies: boolean;
  niitAmount: number;
}

export interface ThresholdAnalysis {
  threshold: string;
  amount: number;
  yourDistance: number;       // Negative = over, positive = under
  impact: string;
  isOver: boolean;
}

export interface OptimizationOpportunity {
  strategy: string;
  description: string;
  potentialSavings: number;
  action: string;
}

export interface CalculatorResults {
  // Income Summary
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;

  // Tax Breakdown
  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  niitTax: number;
  selfEmploymentTax: number;
  totalFederalTax: number;

  // Rates
  marginalOrdinaryRate: number;
  marginalCapGainsRate: number;
  effectiveRate: number;

  // Visualizations
  ordinaryBrackets: BracketVisualization;
  capitalGainsBrackets: BracketVisualization;
  capitalGainsAnalysis: CapitalGainsAnalysis;

  // Threshold Analysis
  thresholds: ThresholdAnalysis[];

  // Optimization
  opportunities: OptimizationOpportunity[];

  // Scenario Comparison
  baselineScenario: {
    taxableIncome: number;
    totalTax: number;
    effectiveRate: number;
  };
  modifiedScenario: {
    taxableIncome: number;
    totalTax: number;
    effectiveRate: number;
    difference: number;
  };
}
```

```typescript
// src/lib/calculators/tax-bracket-optimizer/calculations.ts
import type { CalculatorInputs, CalculatorResults, TaxBracket, BracketVisualization, ThresholdAnalysis, OptimizationOpportunity, CapitalGainsAnalysis } from "./types";

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

// Capital Gains Brackets (2024)
const CAPITAL_GAINS_BRACKETS = {
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

// Standard Deductions (2024)
const STANDARD_DEDUCTION = {
  single: 14600,
  married: 29200,
  head_of_household: 21900,
};

// NIIT Threshold
const NIIT_THRESHOLD = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

// IRMAA Thresholds (2024 for 2022 income)
const IRMAA_THRESHOLDS = {
  single: [103000, 129000, 161000, 193000, 500000],
  married: [206000, 258000, 322000, 386000, 750000],
  head_of_household: [103000, 129000, 161000, 193000, 500000],
};

const IRMAA_MONTHLY_SURCHARGE = [0, 69.90, 174.70, 279.50, 384.30, 419.30];

function calculateBracketVisualization(
  income: number,
  brackets: { min: number; max: number; rate: number }[]
): BracketVisualization {
  const result: TaxBracket[] = [];
  let cumulativeTax = 0;
  let marginalRate = 0;
  let yourPosition = 0;

  for (const bracket of brackets) {
    const bracketSize = bracket.max === Infinity ? Infinity : bracket.max - bracket.min;
    const taxInBracket = bracket.max === Infinity ? 0 : bracketSize * bracket.rate;

    const yourIncomeInBracket = Math.max(0, Math.min(income - bracket.min, bracket.max - bracket.min));
    const yourTaxInBracket = yourIncomeInBracket * bracket.rate;

    result.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxInBracket,
      cumulativeTax,
      yourIncomeInBracket,
      yourTaxInBracket,
    });

    cumulativeTax += taxInBracket;

    if (income > bracket.min && income <= bracket.max) {
      marginalRate = bracket.rate;
      yourPosition = income;
    } else if (income > bracket.max) {
      marginalRate = bracket.rate;
    }
  }

  // Find room in current bracket
  let roomInCurrentBracket = 0;
  let nextBracketStarts = 0;

  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      roomInCurrentBracket = bracket.max - income;
      nextBracketStarts = bracket.max;
      break;
    }
  }

  const totalTax = result.reduce((sum, b) => sum + b.yourTaxInBracket, 0);
  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    brackets: result,
    yourPosition: income,
    marginalRate,
    effectiveRate,
    roomInCurrentBracket,
    nextBracketStarts,
  };
}

function calculateCapitalGainsAnalysis(
  ordinaryTaxableIncome: number,
  ltcg: number,
  qualifiedDividends: number,
  filingStatus: CalculatorInputs['filingStatus'],
  magi: number
): CapitalGainsAnalysis {
  const qualifiedIncome = ltcg + qualifiedDividends;
  const brackets = CAPITAL_GAINS_BRACKETS[filingStatus];

  // Capital gains "stack on top" of ordinary income for rate determination
  let capitalGainsTax = 0;
  let remainingGains = qualifiedIncome;
  let currentPosition = ordinaryTaxableIncome;

  for (const bracket of brackets) {
    if (remainingGains <= 0) break;

    const bracketStart = Math.max(bracket.min, currentPosition);
    const bracketEnd = bracket.max;

    if (currentPosition < bracketEnd) {
      const gainsInBracket = Math.min(remainingGains, bracketEnd - bracketStart);
      capitalGainsTax += gainsInBracket * bracket.rate;
      remainingGains -= gainsInBracket;
      currentPosition += gainsInBracket;
    }
  }

  // Determine effective capital gains rate
  let capitalGainsRate = 0;
  const totalIncome = ordinaryTaxableIncome + qualifiedIncome;
  for (const bracket of brackets) {
    if (totalIncome > bracket.min) {
      capitalGainsRate = bracket.rate;
    }
  }

  // NIIT
  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  const niitApplies = magi > niitThreshold;
  const niitAmount = niitApplies
    ? Math.min(qualifiedIncome, magi - niitThreshold) * 0.038
    : 0;

  return {
    qualifiedIncome,
    ordinaryIncome: ordinaryTaxableIncome,
    capitalGainsRate,
    capitalGainsTax,
    niitApplies,
    niitAmount,
  };
}

function analyzeThresholds(
  magi: number,
  filingStatus: CalculatorInputs['filingStatus']
): ThresholdAnalysis[] {
  const thresholds: ThresholdAnalysis[] = [];

  // NIIT Threshold
  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  thresholds.push({
    threshold: "Net Investment Income Tax (3.8%)",
    amount: niitThreshold,
    yourDistance: niitThreshold - magi,
    impact: "3.8% additional tax on investment income",
    isOver: magi > niitThreshold,
  });

  // IRMAA Thresholds
  const irmaaThresholds = IRMAA_THRESHOLDS[filingStatus];
  irmaaThresholds.forEach((threshold, index) => {
    if (index === 0 || magi > irmaaThresholds[index - 1] * 0.9) {
      thresholds.push({
        threshold: `Medicare IRMAA Tier ${index + 1}`,
        amount: threshold,
        yourDistance: threshold - magi,
        impact: `+$${IRMAA_MONTHLY_SURCHARGE[index + 1]}/month Medicare premium`,
        isOver: magi > threshold,
      });
    }
  });

  // Key bracket thresholds
  const brackets = FEDERAL_BRACKETS[filingStatus];
  const importantBrackets = brackets.filter(b => b.rate >= 0.32);

  importantBrackets.forEach(bracket => {
    if (bracket.min < Infinity) {
      thresholds.push({
        threshold: `${(bracket.rate * 100).toFixed(0)}% Tax Bracket`,
        amount: bracket.min,
        yourDistance: bracket.min - magi,
        impact: `Marginal rate increases to ${(bracket.rate * 100).toFixed(0)}%`,
        isOver: magi > bracket.min,
      });
    }
  });

  return thresholds.sort((a, b) => a.amount - b.amount);
}

function identifyOpportunities(
  inputs: CalculatorInputs,
  results: Partial<CalculatorResults>
): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  const { filingStatus, income, deductions } = inputs;

  // Roth Conversion Opportunity
  if (results.ordinaryBrackets && results.ordinaryBrackets.roomInCurrentBracket > 10000) {
    const room = results.ordinaryBrackets.roomInCurrentBracket;
    const rate = results.ordinaryBrackets.marginalRate;
    const nextRate = FEDERAL_BRACKETS[filingStatus].find(b => b.rate > rate)?.rate || rate;

    if (nextRate > rate) {
      opportunities.push({
        strategy: "Roth Conversion",
        description: `Convert up to $${room.toLocaleString()} from Traditional to Roth IRA at ${(rate * 100).toFixed(0)}% instead of potentially ${(nextRate * 100).toFixed(0)}% later.`,
        potentialSavings: room * (nextRate - rate),
        action: "Consider Roth conversion before year-end",
      });
    }
  }

  // 0% Capital Gains Opportunity
  const capGainsBrackets = CAPITAL_GAINS_BRACKETS[filingStatus];
  const zeroRateBracket = capGainsBrackets[0];
  if (results.ordinaryBrackets && results.ordinaryBrackets.yourPosition < zeroRateBracket.max) {
    const roomAtZero = zeroRateBracket.max - results.ordinaryBrackets.yourPosition;
    if (roomAtZero > 0 && income.longTermCapitalGains === 0) {
      opportunities.push({
        strategy: "Tax Gain Harvesting",
        description: `You can realize up to $${roomAtZero.toLocaleString()} in long-term capital gains at 0% federal tax rate.`,
        potentialSavings: roomAtZero * 0.15,
        action: "Consider selling appreciated assets to reset cost basis",
      });
    }
  }

  // HSA Maximization
  const hsaLimit = filingStatus === 'single' ? 4150 : 8300;
  if (deductions.hsaContribution < hsaLimit) {
    const additionalHSA = hsaLimit - deductions.hsaContribution;
    const marginalRate = results.marginalOrdinaryRate || 0.24;
    opportunities.push({
      strategy: "HSA Maximization",
      description: `Contribute $${additionalHSA.toLocaleString()} more to HSA. Triple tax advantage: deduction now, tax-free growth, tax-free medical withdrawals.`,
      potentialSavings: additionalHSA * marginalRate,
      action: "Increase HSA contributions before year-end",
    });
  }

  // Charitable Bunching
  if (deductions.charitableGiving > 0 && deductions.charitableGiving < 10000) {
    const standardDeduction = STANDARD_DEDUCTION[filingStatus];
    opportunities.push({
      strategy: "Charitable Bunching",
      description: `Your charitable giving is below the threshold to itemize. Consider "bunching" 2-3 years of giving into one year via a Donor-Advised Fund.`,
      potentialSavings: deductions.charitableGiving * (results.marginalOrdinaryRate || 0.24),
      action: "Research Donor-Advised Funds (DAFs)",
    });
  }

  // Near NIIT threshold
  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  const distanceToNIIT = niitThreshold - (results.adjustedGrossIncome || 0);
  if (distanceToNIIT > 0 && distanceToNIIT < 20000) {
    opportunities.push({
      strategy: "Stay Below NIIT Threshold",
      description: `You're $${distanceToNIIT.toLocaleString()} below the ${(niitThreshold / 1000).toFixed(0)}K NIIT threshold. Crossing it adds 3.8% tax on investment income.`,
      potentialSavings: income.longTermCapitalGains * 0.038,
      action: "Consider deferring income or increasing deductions",
    });
  }

  return opportunities;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { filingStatus, income, deductions, scenario } = inputs;

  // Calculate gross income
  const ordinaryIncome =
    income.wagesIncome +
    income.selfEmploymentIncome +
    income.shortTermCapitalGains +
    income.ordinaryDividends +
    income.interestIncome +
    income.rentalIncome +
    income.otherOrdinaryIncome +
    scenario.rothConversionAmount +
    scenario.additionalIncome;

  const qualifiedIncome = income.longTermCapitalGains + income.qualifiedDividends;

  const grossIncome = ordinaryIncome + qualifiedIncome;

  // Calculate above-the-line deductions (to get AGI)
  const aboveLineDeductions =
    deductions.retirement401k +
    deductions.traditionalIRA +
    deductions.hsaContribution +
    (income.selfEmploymentIncome > 0 ? income.selfEmploymentIncome * 0.0765 : 0); // SE tax deduction

  const adjustedGrossIncome = grossIncome - aboveLineDeductions;

  // Calculate itemized vs standard deduction
  const saltCap = 10000; // SALT cap
  const itemizedDeductions =
    Math.min(deductions.stateLocalTaxes, saltCap) +
    deductions.mortgageInterest +
    deductions.charitableGiving +
    deductions.otherItemized +
    scenario.additionalDeduction;

  const standardDeduction = STANDARD_DEDUCTION[filingStatus];
  const actualDeduction = deductions.deductionType === 'standard'
    ? standardDeduction
    : Math.max(itemizedDeductions, standardDeduction);

  // Taxable income (ordinary portion)
  const taxableOrdinaryIncome = Math.max(0, ordinaryIncome - aboveLineDeductions - actualDeduction);
  const taxableIncome = taxableOrdinaryIncome + qualifiedIncome;

  // Calculate ordinary income tax
  const ordinaryBrackets = calculateBracketVisualization(
    taxableOrdinaryIncome,
    FEDERAL_BRACKETS[filingStatus]
  );
  const ordinaryIncomeTax = ordinaryBrackets.brackets.reduce((sum, b) => sum + b.yourTaxInBracket, 0);

  // Calculate capital gains tax
  const capitalGainsAnalysis = calculateCapitalGainsAnalysis(
    taxableOrdinaryIncome,
    income.longTermCapitalGains,
    income.qualifiedDividends,
    filingStatus,
    adjustedGrossIncome
  );

  const capitalGainsBrackets = calculateBracketVisualization(
    taxableOrdinaryIncome + qualifiedIncome,
    CAPITAL_GAINS_BRACKETS[filingStatus]
  );

  // Self-employment tax
  const seNetEarnings = income.selfEmploymentIncome * 0.9235;
  const ssTax = Math.min(seNetEarnings, 168600) * 0.124;
  const medicareTax = seNetEarnings * 0.029;
  const additionalMedicareTax = Math.max(0, seNetEarnings - 200000) * 0.009;
  const selfEmploymentTax = income.selfEmploymentIncome > 0
    ? ssTax + medicareTax + additionalMedicareTax
    : 0;

  // Total federal tax
  const totalFederalTax =
    ordinaryIncomeTax +
    capitalGainsAnalysis.capitalGainsTax +
    capitalGainsAnalysis.niitAmount +
    selfEmploymentTax;

  // Effective rate
  const effectiveRate = grossIncome > 0 ? totalFederalTax / grossIncome : 0;

  // Threshold analysis
  const thresholds = analyzeThresholds(adjustedGrossIncome, filingStatus);

  // Calculate baseline (without scenario modifications)
  const baselineInputs = {
    ...inputs,
    scenario: { rothConversionAmount: 0, additionalIncome: 0, additionalDeduction: 0 },
  };
  const baselineTaxableIncome = taxableIncome - scenario.rothConversionAmount - scenario.additionalIncome + scenario.additionalDeduction;
  const baselineTax = totalFederalTax; // Simplified - in real app would recalculate

  const results: CalculatorResults = {
    grossIncome,
    adjustedGrossIncome,
    taxableIncome,
    ordinaryIncomeTax,
    capitalGainsTax: capitalGainsAnalysis.capitalGainsTax,
    niitTax: capitalGainsAnalysis.niitAmount,
    selfEmploymentTax,
    totalFederalTax,
    marginalOrdinaryRate: ordinaryBrackets.marginalRate,
    marginalCapGainsRate: capitalGainsAnalysis.capitalGainsRate + (capitalGainsAnalysis.niitApplies ? 0.038 : 0),
    effectiveRate,
    ordinaryBrackets,
    capitalGainsBrackets,
    capitalGainsAnalysis,
    thresholds,
    opportunities: [],
    baselineScenario: {
      taxableIncome: baselineTaxableIncome,
      totalTax: baselineTax,
      effectiveRate: baselineTaxableIncome > 0 ? baselineTax / baselineTaxableIncome : 0,
    },
    modifiedScenario: {
      taxableIncome,
      totalTax: totalFederalTax,
      effectiveRate,
      difference: totalFederalTax - baselineTax,
    },
  };

  // Identify optimization opportunities
  results.opportunities = identifyOpportunities(inputs, results);

  return results;
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Tax Bracket Optimizer"
   - Subtitle: "Visualize your tax situation and find optimization opportunities"

2. **Income Input Section** (accordion or tabs)
   - W-2 Wages (main input)
   - Investment Income section
   - Self-Employment section
   - Other Income section

3. **Deduction Input Section**
   - Standard vs Itemized toggle
   - Pre-tax contribution inputs (401k, IRA, HSA)
   - Itemized breakdown (if selected)

4. **The Big Picture** (hero results)
   - Large display: "Your Tax: $XX,XXX"
   - Effective Rate: XX.X%
   - Marginal Rate: XX%

5. **Bracket Visualization** (key feature)
   - Visual bar chart showing all brackets
   - Your position highlighted
   - "Room in current bracket" indicator
   - "Next bracket starts at..." callout

6. **Threshold Tracker**
   - List of key thresholds with your distance from each
   - Color-coded: green (safely under), yellow (close), red (over)
   - NIIT, IRMAA, bracket boundaries

7. **Capital Gains Analysis**
   - Separate visualization for cap gains brackets
   - NIIT impact shown
   - 0% bracket opportunity highlighted

8. **Optimization Opportunities** (cards)
   - Personalized recommendations
   - Potential savings shown
   - Action items

9. **Scenario Modeler**
   - "What if I convert $X to Roth?"
   - "What if I earn $X more?"
   - Side-by-side comparison

10. **Methodology Section** (collapsible)
    - How brackets work
    - Marginal vs effective explained
    - Capital gains stacking explained

## Files to Create

```
src/
├── app/tools/tax-bracket-optimizer/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/tax-bracket-optimizer/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "tax-bracket-optimizer",
  name: "Tax Bracket Optimizer",
  description: "Visualize your tax brackets and find opportunities to optimize",
  href: "/tools/tax-bracket-optimizer",
  categoryId: "tax-planning",
  status: "live",
  primaryColor: "#14b8a6",
  designStyle: "analytical",
  inspiredBy: ["Mad Fientist", "Money Guy Show"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] All filing statuses use correct brackets
- [ ] Marginal rate correctly identified
- [ ] Effective rate calculated correctly
- [ ] Capital gains stack on top of ordinary income
- [ ] NIIT calculated when over threshold
- [ ] IRMAA thresholds tracked
- [ ] Optimization opportunities make sense
- [ ] Scenario modeler shows correct differences

## Git Workflow

```bash
git checkout -b feature/app-tax-bracket-optimizer
# ... build the app ...
git add .
git commit -m "Add Tax Bracket Optimizer"
git push -u origin feature/app-tax-bracket-optimizer
```

## Do NOT

- Modify shared components
- Provide tax advice (educational only)
- Confuse marginal and effective rates
- Forget that capital gains "stack" on ordinary income
- Ignore NIIT (it catches many high earners)
- Oversimplify—tax brackets are nuanced
