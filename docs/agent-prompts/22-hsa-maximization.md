# Agent Prompt: HSA Maximization Tool

## Your Mission

Build the HSA Maximization Tool for ClearMoney. This tool helps users understand and utilize the HSA (Health Savings Account)—the only triple-tax-advantaged account in the tax code—as a powerful retirement savings vehicle, not just a healthcare spending account.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/hsa-maximization/`
**Your calculator logic:** `/src/lib/calculators/hsa-maximization/`
**Branch name:** `feature/app-hsa-maximization`

## Background Research

**The Problem:**
- Most people use HSAs as spending accounts, not investment accounts
- HSA is the ONLY account with triple tax advantage
- No "use it or lose it" (unlike FSA)
- Can be used for non-medical expenses after 65 (like a Traditional IRA)
- Vastly underutilized wealth-building tool

**The Triple Tax Advantage:**
1. **Tax-deductible contributions** (reduces taxable income)
2. **Tax-free growth** (investments grow tax-free)
3. **Tax-free withdrawals** (for qualified medical expenses, ever)

**No other account has all three:**
- Traditional IRA/401k: Deductible, tax-free growth, but taxable withdrawals
- Roth IRA/401k: Not deductible, tax-free growth, tax-free withdrawals
- Taxable account: Not deductible, taxable growth, taxable withdrawals
- **HSA: All three advantages**

**The HSA Hack Strategy:**
1. Contribute the maximum each year
2. Invest the HSA (don't let it sit in cash)
3. Pay medical expenses out of pocket
4. Keep receipts (no time limit!)
5. Let HSA grow for decades
6. Reimburse yourself tax-free in retirement

**2025 Contribution Limits:**
- Individual coverage: $4,300
- Family coverage: $8,550
- Catch-up (55+): +$1,000

**Requirements:**
- Must have High Deductible Health Plan (HDHP)
- HDHP for 2025: min deductible $1,650 individual / $3,300 family
- Cannot be enrolled in Medicare
- Cannot be claimed as dependent

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Cyan (#06b6d4) - health, clarity, growth
- **Design Style:** Educational, comparison-focused, growth visualization
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### HSA Eligibility
| Input | Label | Default | Options |
|-------|-------|---------|---------|
| hasHDHP | Has High Deductible Health Plan | true | true, false |
| coverageType | Coverage Type | individual | individual, family |
| age | Your Age | 35 | 18 - 100 |
| enrolledInMedicare | Enrolled in Medicare | false | true, false |

### Contribution Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| currentContribution | Current Annual Contribution | 3000 | 0 | 10000 | 100 |
| employerContribution | Employer HSA Contribution | 500 | 0 | 5000 | 100 |
| currentHSABalance | Current HSA Balance | 5000 | 0 | 500000 | 1000 |

### Investment Assumptions
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| expectedReturn | Expected Annual Return % | 7 | 0 | 15 | 0.5 |
| yearsToRetirement | Years Until Retirement | 30 | 1 | 50 | 1 |
| yearsInRetirement | Years in Retirement | 25 | 10 | 40 | 1 |

### Tax Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| marginalTaxRate | Current Marginal Tax Rate % | 32 | 10 | 40 | 1 |
| retirementTaxRate | Expected Retirement Tax Rate % | 24 | 10 | 40 | 1 |
| stateCode | State | CA | (all states) |

### Medical Spending
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| annualMedicalExpenses | Current Annual Medical Expenses | 2000 | 0 | 50000 | 500 |
| retirementMedicalExpenses | Expected Annual Retirement Medical | 10000 | 0 | 100000 | 1000 |

## Calculation Logic

```typescript
// src/lib/calculators/hsa-maximization/types.ts
export type CoverageType = 'individual' | 'family';

export interface EligibilityInputs {
  hasHDHP: boolean;
  coverageType: CoverageType;
  age: number;
  enrolledInMedicare: boolean;
}

export interface ContributionInputs {
  currentContribution: number;
  employerContribution: number;
  currentHSABalance: number;
}

export interface InvestmentInputs {
  expectedReturn: number;
  yearsToRetirement: number;
  yearsInRetirement: number;
}

export interface TaxInputs {
  marginalTaxRate: number;
  retirementTaxRate: number;
  stateCode: string;
}

export interface MedicalInputs {
  annualMedicalExpenses: number;
  retirementMedicalExpenses: number;
}

export interface CalculatorInputs {
  eligibility: EligibilityInputs;
  contribution: ContributionInputs;
  investment: InvestmentInputs;
  tax: TaxInputs;
  medical: MedicalInputs;
}

export interface EligibilityResult {
  isEligible: boolean;
  contributionLimit: number;
  catchUpAmount: number;
  maxContribution: number;
  remainingContributionRoom: number;
  reasons: string[];
}

export interface GrowthProjection {
  year: number;
  age: number;
  contribution: number;
  employerContribution: number;
  medicalExpenses: number;
  outOfPocketMedical: number;
  receiptsPending: number;
  yearEndBalance: number;
  cumulativeContributions: number;
  cumulativeGrowth: number;
}

export interface TaxSavingsAnalysis {
  // Annual tax savings from contribution
  annualContributionDeduction: number;
  federalTaxSaved: number;
  stateTaxSaved: number;
  ficaTaxSaved: number;
  totalAnnualTaxSaved: number;

  // Lifetime tax advantages
  lifetimeContributions: number;
  lifetimeTaxSavingsOnContributions: number;
  taxFreeGrowth: number;
  taxFreeWithdrawals: number;
  totalLifetimeTaxAdvantage: number;
}

export interface ComparisonAnalysis {
  hsaStrategy: {
    finalBalance: number;
    totalContributions: number;
    totalGrowth: number;
    taxesSaved: number;
    medicalCovered: number;
  };
  taxableAccountStrategy: {
    finalBalance: number;
    totalContributions: number;
    totalGrowth: number;
    taxesPaid: number;
    medicalCovered: number;
  };
  hsaAdvantage: number;
}

export interface CalculatorResults {
  // Eligibility
  eligibility: EligibilityResult;

  // Growth Projections
  projections: GrowthProjection[];
  retirementBalance: number;
  endOfLifeBalance: number;

  // Tax Analysis
  taxSavings: TaxSavingsAnalysis;

  // Comparison
  comparison: ComparisonAnalysis;

  // The "HSA Hack" Analysis
  receiptsBanked: number;
  medicalExpensesCoverable: number;
  yearsOfMedicalCovered: number;

  // Optimization Metrics
  maxContributionBenefit: number;
  additionalIfMaxed: number;

  // Recommendations
  recommendations: string[];
  warnings: string[];

  // Steps
  steps: {
    step: number;
    title: string;
    description: string;
    impact?: string;
  }[];
}
```

```typescript
// src/lib/calculators/hsa-maximization/calculations.ts
import type { CalculatorInputs, CalculatorResults, EligibilityResult, GrowthProjection, TaxSavingsAnalysis, ComparisonAnalysis } from "./types";

// 2025 HSA Limits
const HSA_LIMITS_2025 = {
  individual: 4300,
  family: 8550,
  catchUp: 1000,
  catchUpAge: 55,
};

// State income tax rates (simplified)
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.093, NY: 0.0685, NJ: 0.0637, WA: 0, TX: 0, FL: 0, NV: 0,
  // Add more states as needed
};

// Some states don't give HSA deduction (CA, NJ)
const STATES_NO_HSA_DEDUCTION = ['CA', 'NJ'];

function checkEligibility(inputs: CalculatorInputs): EligibilityResult {
  const { eligibility, contribution } = inputs;
  const reasons: string[] = [];
  let isEligible = true;

  if (!eligibility.hasHDHP) {
    isEligible = false;
    reasons.push("HSA requires a High Deductible Health Plan (HDHP)");
  }

  if (eligibility.enrolledInMedicare) {
    isEligible = false;
    reasons.push("Cannot contribute to HSA while enrolled in Medicare");
  }

  const baseLimit = HSA_LIMITS_2025[eligibility.coverageType];
  const catchUpAmount = eligibility.age >= HSA_LIMITS_2025.catchUpAge ? HSA_LIMITS_2025.catchUp : 0;
  const maxContribution = baseLimit + catchUpAmount;

  const totalPlannedContribution = contribution.currentContribution + contribution.employerContribution;
  const remainingContributionRoom = Math.max(0, maxContribution - totalPlannedContribution);

  if (isEligible && remainingContributionRoom > 0) {
    reasons.push(`You have $${remainingContributionRoom.toLocaleString()} more contribution room available`);
  }

  return {
    isEligible,
    contributionLimit: baseLimit,
    catchUpAmount,
    maxContribution,
    remainingContributionRoom,
    reasons,
  };
}

function calculateGrowthProjections(inputs: CalculatorInputs, eligibility: EligibilityResult): GrowthProjection[] {
  const { contribution, investment, eligibility: eligInputs, medical } = inputs;

  const projections: GrowthProjection[] = [];
  let balance = contribution.currentHSABalance;
  let cumulativeContributions = 0;
  let receiptsPending = 0; // Medical expenses paid out of pocket, receipts saved
  const rate = investment.expectedReturn / 100;

  for (let year = 1; year <= investment.yearsToRetirement; year++) {
    const currentAge = eligInputs.age + year;

    // Contribution (stop at 65 due to Medicare)
    let yearContribution = 0;
    let yearEmployerContribution = 0;

    if (currentAge < 65) {
      yearContribution = contribution.currentContribution;
      yearEmployerContribution = contribution.employerContribution;
    }

    cumulativeContributions += yearContribution + yearEmployerContribution;

    // Medical expenses (the "hack": pay out of pocket, save receipts)
    const medicalExpenses = medical.annualMedicalExpenses;
    const outOfPocketMedical = medicalExpenses; // Pay out of pocket
    receiptsPending += outOfPocketMedical; // Bank the receipts

    // Growth
    balance = (balance + yearContribution + yearEmployerContribution) * (1 + rate);

    projections.push({
      year,
      age: currentAge,
      contribution: yearContribution,
      employerContribution: yearEmployerContribution,
      medicalExpenses,
      outOfPocketMedical,
      receiptsPending,
      yearEndBalance: Math.round(balance),
      cumulativeContributions,
      cumulativeGrowth: Math.round(balance - cumulativeContributions - contribution.currentHSABalance),
    });
  }

  return projections;
}

function calculateTaxSavings(inputs: CalculatorInputs, eligibility: EligibilityResult): TaxSavingsAnalysis {
  const { contribution, investment, tax } = inputs;

  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const getsStateDeduction = !STATES_NO_HSA_DEDUCTION.includes(tax.stateCode);

  const annualContribution = contribution.currentContribution + contribution.employerContribution;

  // Annual tax savings
  const federalTaxSaved = annualContribution * (tax.marginalTaxRate / 100);
  const stateTaxSaved = getsStateDeduction ? annualContribution * stateRate : 0;
  const ficaTaxSaved = annualContribution * 0.0765; // Employee only
  const totalAnnualTaxSaved = federalTaxSaved + stateTaxSaved + ficaTaxSaved;

  // Lifetime projections
  const yearsContributing = Math.min(investment.yearsToRetirement, 65 - inputs.eligibility.age);
  const lifetimeContributions = annualContribution * yearsContributing;
  const lifetimeTaxSavingsOnContributions = totalAnnualTaxSaved * yearsContributing;

  // Tax-free growth estimate
  const rate = investment.expectedReturn / 100;
  let futureValue = contribution.currentHSABalance;
  for (let year = 1; year <= yearsContributing; year++) {
    futureValue = (futureValue + annualContribution) * (1 + rate);
  }
  const taxFreeGrowth = futureValue - contribution.currentHSABalance - lifetimeContributions;

  // Tax-free withdrawals (medical expenses in retirement)
  const retirementMedical = inputs.medical.retirementMedicalExpenses * investment.yearsInRetirement;
  const taxFreeWithdrawals = Math.min(futureValue, retirementMedical);
  const withdrawalTaxSavings = taxFreeWithdrawals * (tax.retirementTaxRate / 100);

  const totalLifetimeTaxAdvantage = lifetimeTaxSavingsOnContributions + (taxFreeGrowth * 0.15) + withdrawalTaxSavings;

  return {
    annualContributionDeduction: annualContribution,
    federalTaxSaved,
    stateTaxSaved,
    ficaTaxSaved,
    totalAnnualTaxSaved,
    lifetimeContributions,
    lifetimeTaxSavingsOnContributions,
    taxFreeGrowth,
    taxFreeWithdrawals,
    totalLifetimeTaxAdvantage,
  };
}

function calculateComparison(inputs: CalculatorInputs, projections: GrowthProjection[]): ComparisonAnalysis {
  const { contribution, investment, tax, medical } = inputs;

  const annualContribution = contribution.currentContribution + contribution.employerContribution;
  const rate = investment.expectedReturn / 100;
  const years = investment.yearsToRetirement;

  // HSA Strategy (contribute, invest, don't touch)
  const hsaFinalBalance = projections[projections.length - 1]?.yearEndBalance || 0;
  const hsaContributions = projections.reduce((sum, p) => sum + p.contribution + p.employerContribution, 0);
  const hsaGrowth = hsaFinalBalance - hsaContributions - contribution.currentHSABalance;
  const hsaTaxesSaved = annualContribution * ((tax.marginalTaxRate / 100) + 0.0765) * years;

  // Taxable Account Strategy (same contributions, but taxed)
  // After-tax contribution
  const afterTaxContribution = annualContribution * (1 - tax.marginalTaxRate / 100 - 0.0765);

  let taxableBalance = contribution.currentHSABalance * (1 - tax.marginalTaxRate / 100); // Assume already taxed
  let taxesPaid = 0;

  for (let year = 1; year <= years; year++) {
    // Contribute after-tax
    taxableBalance += afterTaxContribution;
    // Grow
    const growth = taxableBalance * rate;
    // Pay tax on dividends/gains annually (simplified)
    const annualTax = growth * 0.20; // Assume 20% blend of LTCG/dividends
    taxesPaid += annualTax;
    taxableBalance = taxableBalance + growth - annualTax;
  }

  // Medical expenses in both scenarios
  const medicalCovered = medical.annualMedicalExpenses * years;

  return {
    hsaStrategy: {
      finalBalance: hsaFinalBalance,
      totalContributions: hsaContributions,
      totalGrowth: hsaGrowth,
      taxesSaved: hsaTaxesSaved,
      medicalCovered,
    },
    taxableAccountStrategy: {
      finalBalance: Math.round(taxableBalance),
      totalContributions: hsaContributions, // Same pre-tax amount
      totalGrowth: Math.round(taxableBalance - afterTaxContribution * years),
      taxesPaid: Math.round(taxesPaid + hsaContributions * (tax.marginalTaxRate / 100)),
      medicalCovered,
    },
    hsaAdvantage: Math.round(hsaFinalBalance - taxableBalance + hsaTaxesSaved),
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const eligibility = checkEligibility(inputs);
  const projections = calculateGrowthProjections(inputs, eligibility);
  const taxSavings = calculateTaxSavings(inputs, eligibility);
  const comparison = calculateComparison(inputs, projections);

  const retirementBalance = projections[projections.length - 1]?.yearEndBalance || 0;

  // Continue growth through retirement
  let endOfLifeBalance = retirementBalance;
  const retirementRate = inputs.investment.expectedReturn / 100 * 0.7; // More conservative
  for (let year = 1; year <= inputs.investment.yearsInRetirement; year++) {
    endOfLifeBalance = (endOfLifeBalance - inputs.medical.retirementMedicalExpenses) * (1 + retirementRate);
    if (endOfLifeBalance < 0) {
      endOfLifeBalance = 0;
      break;
    }
  }

  // The "HSA Hack" metrics
  const receiptsBanked = projections[projections.length - 1]?.receiptsPending || 0;
  const yearsOfMedicalCovered = retirementBalance / inputs.medical.retirementMedicalExpenses;

  // What if maxed?
  const maxAnnualContribution = eligibility.maxContribution;
  const currentContribution = inputs.contribution.currentContribution + inputs.contribution.employerContribution;
  const additionalIfMaxed = maxAnnualContribution - currentContribution;

  let maxContributionBenefit = 0;
  if (additionalIfMaxed > 0) {
    const additionalTaxSaved = additionalIfMaxed * (inputs.tax.marginalTaxRate / 100 + 0.0765);
    const additionalGrowth = additionalIfMaxed * Math.pow(1 + inputs.investment.expectedReturn / 100, inputs.investment.yearsToRetirement);
    maxContributionBenefit = additionalTaxSaved * inputs.investment.yearsToRetirement + additionalGrowth;
  }

  // Recommendations and warnings
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (!eligibility.isEligible) {
    warnings.push("You're not currently eligible for HSA contributions.");
    eligibility.reasons.forEach(r => warnings.push(r));
  } else {
    if (eligibility.remainingContributionRoom > 0) {
      recommendations.push(`You can contribute $${eligibility.remainingContributionRoom.toLocaleString()} more to maximize your HSA.`);
    } else {
      recommendations.push("Great! You're maxing out your HSA contributions.");
    }
  }

  if (STATES_NO_HSA_DEDUCTION.includes(inputs.tax.stateCode)) {
    warnings.push(`Note: ${inputs.tax.stateCode} doesn't recognize HSA deductions for state taxes. You still get federal and FICA benefits.`);
  }

  recommendations.push("Invest your HSA funds—don't let them sit in cash earning nothing.");
  recommendations.push("Pay medical expenses out of pocket when possible, and save receipts. You can reimburse yourself tax-free anytime in the future.");

  if (inputs.eligibility.age >= 55) {
    recommendations.push("You're eligible for the $1,000 catch-up contribution. Take advantage of it!");
  }

  if (inputs.eligibility.age >= 63) {
    warnings.push("You'll become Medicare-eligible at 65 and can no longer contribute to an HSA. Plan your final contributions.");
  }

  // Steps
  const steps: CalculatorResults['steps'] = [
    {
      step: 1,
      title: "Contribute the Maximum",
      description: `For 2025, that's $${eligibility.maxContribution.toLocaleString()} for ${inputs.eligibility.coverageType} coverage.`,
      impact: `Save $${Math.round(taxSavings.totalAnnualTaxSaved).toLocaleString()}/year in taxes`,
    },
    {
      step: 2,
      title: "Invest Your HSA",
      description: "Move funds beyond your emergency medical threshold into investments (index funds, target date funds).",
      impact: "Tax-free growth can add 6-8% annually",
    },
    {
      step: 3,
      title: "Pay Medical Expenses Out of Pocket",
      description: "Use your regular bank account for current medical expenses. Keep receipts!",
      impact: "Let HSA compound longer",
    },
    {
      step: 4,
      title: "Save All Medical Receipts",
      description: "There's no time limit. You can reimburse yourself for medical expenses from any year.",
      impact: `Bank $${inputs.medical.annualMedicalExpenses.toLocaleString()}/year in future tax-free withdrawals`,
    },
    {
      step: 5,
      title: "Reimburse Yourself in Retirement",
      description: "When you need the money, reimburse yourself for decades of saved receipts—completely tax-free.",
      impact: "Tax-free income in retirement",
    },
  ];

  return {
    eligibility,
    projections,
    retirementBalance,
    endOfLifeBalance: Math.round(endOfLifeBalance),
    taxSavings,
    comparison,
    receiptsBanked,
    medicalExpensesCoverable: retirementBalance,
    yearsOfMedicalCovered: Math.round(yearsOfMedicalCovered * 10) / 10,
    maxContributionBenefit: Math.round(maxContributionBenefit),
    additionalIfMaxed,
    recommendations,
    warnings,
    steps,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "HSA Maximization Tool"
   - Subtitle: "The only triple-tax-advantaged account—use it as a stealth retirement vehicle"

2. **Eligibility Checker**
   - HDHP requirement check
   - Medicare status check
   - Contribution limit display
   - Catch-up eligibility (55+)

3. **Contribution Input Section**
   - Current contribution slider
   - Employer contribution
   - Current balance
   - "Room remaining" indicator

4. **The Triple Tax Advantage** (educational)
   - Visual showing the 3 benefits
   - Comparison to other account types
   - Why HSA is unique

5. **Tax Savings Summary** (hero result)
   - Annual tax savings: $X,XXX
   - Broken down: Federal + State + FICA
   - Lifetime tax advantage projection

6. **Growth Projection Chart**
   - Line chart showing HSA balance over time
   - Contributions vs growth visualization
   - Retirement date marked

7. **The HSA Hack Explained**
   - Visual showing the strategy
   - Receipts banked over time
   - "Future tax-free withdrawals available"

8. **Comparison: HSA vs Taxable Account**
   - Side-by-side projection
   - Same contributions, different outcomes
   - "HSA Advantage: $X,XXX,XXX"

9. **Step-by-Step Strategy Cards**
   - Numbered steps with impact shown
   - Clear actions to take
   - Timeline guidance

10. **Maximization Calculator**
    - What if you contributed the max?
    - Additional lifetime benefit shown

11. **Recommendations & Warnings Panel**
    - State tax warning (CA, NJ)
    - Medicare age warning
    - Optimization tips

12. **Methodology Section** (collapsible)
    - HSA rules explained
    - Qualified medical expenses
    - What happens after 65

## Files to Create

```
src/
├── app/tools/hsa-maximization/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/hsa-maximization/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "hsa-maximization",
  name: "HSA Maximization Tool",
  description: "Unlock the triple tax advantage—use your HSA as a stealth retirement account",
  href: "/tools/hsa-maximization",
  categoryId: "tax-planning",
  status: "live",
  primaryColor: "#06b6d4",
  designStyle: "educational",
  inspiredBy: ["Mad Fientist", "Money Guy Show"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Eligibility correctly checks HDHP and Medicare
- [ ] Individual vs family limits applied correctly
- [ ] Catch-up contribution for 55+
- [ ] FICA savings included in tax calculation
- [ ] CA/NJ state deduction exclusion noted
- [ ] Growth projections stop contributions at 65
- [ ] Comparison shows clear HSA advantage

## Git Workflow

```bash
git checkout -b feature/app-hsa-maximization
# ... build the app ...
git add .
git commit -m "Add HSA Maximization Tool"
git push -u origin feature/app-hsa-maximization
```

## Do NOT

- Modify shared components
- Provide tax advice (educational only)
- Forget FICA tax savings (unique to HSA!)
- Ignore state tax differences (CA, NJ don't give deduction)
- Skip the "HSA Hack" strategy explanation
- Forget contributions must stop at 65 (Medicare)
