# Agent Prompt: Mega Backdoor Roth Analyzer

## Your Mission

Build the Mega Backdoor Roth Analyzer for ClearMoney. This tool helps high-income earners understand and utilize the "mega backdoor Roth" strategy—a way to contribute up to $46,000+ extra to Roth accounts annually, beyond normal limits.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/mega-backdoor-roth/`
**Your calculator logic:** `/src/lib/calculators/mega-backdoor-roth/`
**Branch name:** `feature/app-mega-backdoor-roth`

## Background Research

**The Problem:**
- High earners want more Roth contributions but hit limits
- Regular Roth IRA limit: $7,000/year (phased out at high incomes)
- Backdoor Roth adds $7,000 via Traditional IRA conversion
- But what if you could add $46,000+ more?

**The Mega Backdoor Roth Strategy:**
The 401(k) total limit ($69,000 in 2024) is much higher than what most people contribute:
- Employee traditional/Roth contributions: $23,000
- Employer match: varies (example: $10,000)
- **Gap to total limit: $36,000+** ← This is the mega backdoor opportunity

**How It Works:**
1. Your 401(k) plan must allow "after-tax" contributions (not Roth 401k, but after-tax non-Roth)
2. Your plan must allow either:
   - In-plan conversion to Roth 401(k), OR
   - In-service distribution/rollover to Roth IRA
3. Contribute after-tax dollars up to the $69,000 total limit
4. Convert to Roth (either within plan or to IRA)
5. Only the gains between contribution and conversion are taxable

**Key Numbers (2024):**
- Total 401(k) limit: $69,000 ($76,500 if 50+)
- Employee contribution limit: $23,000 ($30,500 if 50+)
- Catch-up (50+): $7,500
- The "mega backdoor" space = $69,000 - employee contribution - employer match

**Why It's Powerful:**
- Much more Roth space than regular backdoor ($7,000)
- No income limits
- Tax-free growth forever
- Can do annually

**The Catch:**
- Not all 401(k) plans allow it (only ~20% do)
- Must allow after-tax contributions
- Must allow in-plan conversion OR in-service distributions
- Some plans limit after-tax contributions

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Violet (#8b5cf6) - premium, wealth-building
- **Design Style:** Step-by-step, eligibility-focused
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Basic Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| age | Your Age | 35 | 18 | 100 | 1 |
| annualIncome | Annual Income | 250000 | 0 | 5000000 | 10000 |

### 401(k) Plan Details
| Input | Label | Default | Options/Range |
|-------|-------|---------|---------------|
| allowsAfterTax | Allows After-Tax Contributions | false | true, false |
| allowsInPlanConversion | Allows In-Plan Roth Conversion | false | true, false |
| allowsInServiceDistribution | Allows In-Service Distribution | false | true, false |
| employeeContribution | Your Employee Contribution | 23000 | 0 - 30500 |
| employeeContributionType | Contribution Type | traditional | traditional, roth, mixed |
| employerMatch | Annual Employer Match | 10000 | 0 - 50000 |
| afterTaxContributionLimit | Plan After-Tax Limit | 0 | 0 - 50000 |

### Current Situation
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| currentRothBalance | Current Roth IRA/401k Balance | 50000 | 0 | 10000000 |
| yearsUntilRetirement | Years Until Retirement | 25 | 1 | 50 |
| expectedReturn | Expected Annual Return % | 7 | 0 | 15 |

## Calculation Logic

```typescript
// src/lib/calculators/mega-backdoor-roth/types.ts
export type ContributionType = 'traditional' | 'roth' | 'mixed';

export interface PlanDetails {
  allowsAfterTax: boolean;
  allowsInPlanConversion: boolean;
  allowsInServiceDistribution: boolean;
  employeeContribution: number;
  employeeContributionType: ContributionType;
  employerMatch: number;
  afterTaxContributionLimit: number; // 0 means up to IRS max
}

export interface CalculatorInputs {
  age: number;
  annualIncome: number;
  plan: PlanDetails;
  currentRothBalance: number;
  yearsUntilRetirement: number;
  expectedReturn: number;
}

export interface EligibilityResult {
  canDoMegaBackdoor: boolean;
  missingRequirements: string[];
  conversionMethod: 'in_plan' | 'distribution' | 'both' | 'none';
  planGrade: 'A' | 'B' | 'C' | 'F'; // A = full mega backdoor, F = not possible
}

export interface ContributionSpace {
  // IRS Limits
  totalLimit: number;           // $69,000 (or $76,500 if 50+)
  employeeLimit: number;        // $23,000 (or $30,500 if 50+)
  catchUpLimit: number;         // $7,500 if 50+

  // Your Usage
  employeeContribution: number;
  employerMatch: number;
  usedSpace: number;

  // Available for Mega Backdoor
  irsMaxAvailable: number;      // Total limit - used
  planMaxAvailable: number;     // Plan's after-tax limit (if any)
  megaBackdoorSpace: number;    // Min of IRS and plan limit
}

export interface ProjectedGrowth {
  year: number;
  contribution: number;
  cumulativeContributions: number;
  balance: number;
  taxFreeSavings: number; // Compared to taxable account
}

export interface ComparisonAnalysis {
  // 10-year projection
  withMegaBackdoor: {
    totalContributions: number;
    finalBalance: number;
    taxFreeSavings: number;
  };
  withoutMegaBackdoor: {
    totalContributions: number;
    finalBalance: number;
    taxesPaid: number;
  };
  advantageAmount: number;
}

export interface CalculatorResults {
  eligibility: EligibilityResult;
  contributionSpace: ContributionSpace;
  maxMegaBackdoorAmount: number;

  // Growth projections
  projectedGrowth: ProjectedGrowth[];
  retirementBalance: number;
  totalContributed: number;
  totalGrowth: number;
  taxFreeSavings: number;

  // Comparison
  comparison: ComparisonAnalysis;

  // Steps to execute
  steps: {
    step: number;
    title: string;
    description: string;
    timing?: string;
  }[];

  // Recommendations
  recommendations: string[];
  warnings: string[];
}
```

```typescript
// src/lib/calculators/mega-backdoor-roth/calculations.ts
import type { CalculatorInputs, CalculatorResults, EligibilityResult, ContributionSpace, ProjectedGrowth, ComparisonAnalysis } from "./types";

// 2024 IRS Limits
const TOTAL_401K_LIMIT = 69000;
const TOTAL_401K_LIMIT_50_PLUS = 76500;
const EMPLOYEE_LIMIT = 23000;
const EMPLOYEE_LIMIT_50_PLUS = 30500;
const CATCH_UP_LIMIT = 7500;
const CATCH_UP_AGE = 50;

// Tax assumptions for comparison
const CAPITAL_GAINS_RATE = 0.15;
const DIVIDEND_RATE = 0.15;
const DIVIDEND_YIELD = 0.02; // 2% average dividend yield

function checkEligibility(plan: CalculatorInputs['plan']): EligibilityResult {
  const missingRequirements: string[] = [];

  if (!plan.allowsAfterTax) {
    missingRequirements.push("Plan must allow after-tax (non-Roth) contributions");
  }

  if (!plan.allowsInPlanConversion && !plan.allowsInServiceDistribution) {
    missingRequirements.push("Plan must allow either in-plan Roth conversion OR in-service distribution to IRA");
  }

  const canDoMegaBackdoor = missingRequirements.length === 0;

  let conversionMethod: EligibilityResult['conversionMethod'] = 'none';
  if (canDoMegaBackdoor) {
    if (plan.allowsInPlanConversion && plan.allowsInServiceDistribution) {
      conversionMethod = 'both';
    } else if (plan.allowsInPlanConversion) {
      conversionMethod = 'in_plan';
    } else if (plan.allowsInServiceDistribution) {
      conversionMethod = 'distribution';
    }
  }

  // Grade the plan
  let planGrade: EligibilityResult['planGrade'];
  if (canDoMegaBackdoor && conversionMethod === 'both') {
    planGrade = 'A';
  } else if (canDoMegaBackdoor) {
    planGrade = 'B';
  } else if (plan.allowsAfterTax) {
    planGrade = 'C'; // Has after-tax but no conversion option
  } else {
    planGrade = 'F';
  }

  return {
    canDoMegaBackdoor,
    missingRequirements,
    conversionMethod,
    planGrade,
  };
}

function calculateContributionSpace(inputs: CalculatorInputs): ContributionSpace {
  const { age, plan } = inputs;

  const isCatchUpEligible = age >= CATCH_UP_AGE;

  const totalLimit = isCatchUpEligible ? TOTAL_401K_LIMIT_50_PLUS : TOTAL_401K_LIMIT;
  const employeeLimit = isCatchUpEligible ? EMPLOYEE_LIMIT_50_PLUS : EMPLOYEE_LIMIT;
  const catchUpLimit = isCatchUpEligible ? CATCH_UP_LIMIT : 0;

  const usedSpace = plan.employeeContribution + plan.employerMatch;
  const irsMaxAvailable = Math.max(0, totalLimit - usedSpace);

  // Plan may have its own after-tax limit
  const planMaxAvailable = plan.afterTaxContributionLimit > 0
    ? plan.afterTaxContributionLimit
    : irsMaxAvailable;

  const megaBackdoorSpace = Math.min(irsMaxAvailable, planMaxAvailable);

  return {
    totalLimit,
    employeeLimit,
    catchUpLimit,
    employeeContribution: plan.employeeContribution,
    employerMatch: plan.employerMatch,
    usedSpace,
    irsMaxAvailable,
    planMaxAvailable,
    megaBackdoorSpace,
  };
}

function calculateProjectedGrowth(
  annualContribution: number,
  currentBalance: number,
  years: number,
  expectedReturn: number
): ProjectedGrowth[] {
  const projections: ProjectedGrowth[] = [];
  let balance = currentBalance;
  let cumulativeContributions = 0;

  for (let year = 1; year <= years; year++) {
    cumulativeContributions += annualContribution;
    balance = (balance + annualContribution) * (1 + expectedReturn / 100);

    // Tax-free savings = what you'd pay in a taxable account
    const growthThisYear = balance - cumulativeContributions - currentBalance;
    const taxOnGrowth = growthThisYear * CAPITAL_GAINS_RATE;
    const dividendTax = balance * DIVIDEND_YIELD * DIVIDEND_RATE * year;

    projections.push({
      year,
      contribution: annualContribution,
      cumulativeContributions,
      balance: Math.round(balance),
      taxFreeSavings: Math.round(taxOnGrowth + dividendTax),
    });
  }

  return projections;
}

function calculateComparison(
  megaBackdoorAmount: number,
  years: number,
  expectedReturn: number
): ComparisonAnalysis {
  const rate = expectedReturn / 100;

  // With mega backdoor (tax-free growth)
  let rothBalance = 0;
  for (let i = 0; i < years; i++) {
    rothBalance = (rothBalance + megaBackdoorAmount) * (1 + rate);
  }

  // Without mega backdoor (taxable account)
  let taxableBalance = 0;
  let taxesPaid = 0;
  for (let i = 0; i < years; i++) {
    taxableBalance = (taxableBalance + megaBackdoorAmount) * (1 + rate);
    // Pay dividend taxes annually
    const dividendTax = taxableBalance * DIVIDEND_YIELD * DIVIDEND_RATE;
    taxesPaid += dividendTax;
    taxableBalance -= dividendTax;
  }

  // Pay capital gains at the end
  const totalContributions = megaBackdoorAmount * years;
  const capitalGain = taxableBalance - totalContributions;
  const capitalGainsTax = capitalGain * CAPITAL_GAINS_RATE;
  taxesPaid += capitalGainsTax;
  const afterTaxBalance = taxableBalance - capitalGainsTax;

  return {
    withMegaBackdoor: {
      totalContributions,
      finalBalance: Math.round(rothBalance),
      taxFreeSavings: Math.round(rothBalance - afterTaxBalance),
    },
    withoutMegaBackdoor: {
      totalContributions,
      finalBalance: Math.round(afterTaxBalance),
      taxesPaid: Math.round(taxesPaid),
    },
    advantageAmount: Math.round(rothBalance - afterTaxBalance),
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const eligibility = checkEligibility(inputs.plan);
  const contributionSpace = calculateContributionSpace(inputs);
  const maxMegaBackdoorAmount = eligibility.canDoMegaBackdoor ? contributionSpace.megaBackdoorSpace : 0;

  const projectedGrowth = calculateProjectedGrowth(
    maxMegaBackdoorAmount,
    inputs.currentRothBalance,
    inputs.yearsUntilRetirement,
    inputs.expectedReturn
  );

  const lastProjection = projectedGrowth[projectedGrowth.length - 1];
  const retirementBalance = lastProjection?.balance || inputs.currentRothBalance;
  const totalContributed = lastProjection?.cumulativeContributions || 0;
  const totalGrowth = retirementBalance - totalContributed - inputs.currentRothBalance;
  const taxFreeSavings = lastProjection?.taxFreeSavings || 0;

  const comparison = calculateComparison(
    maxMegaBackdoorAmount,
    Math.min(10, inputs.yearsUntilRetirement),
    inputs.expectedReturn
  );

  // Generate steps
  const steps: CalculatorResults['steps'] = [];

  if (eligibility.canDoMegaBackdoor) {
    steps.push({
      step: 1,
      title: "Verify Your Plan Allows It",
      description: "Contact HR or review your Summary Plan Description (SPD) to confirm after-tax contributions and conversion options.",
      timing: "One-time setup",
    });

    steps.push({
      step: 2,
      title: "Set Up After-Tax Contributions",
      description: `Elect to contribute after-tax dollars. Target $${maxMegaBackdoorAmount.toLocaleString()}/year, which is $${Math.round(maxMegaBackdoorAmount / 12).toLocaleString()}/month.`,
      timing: "Update elections",
    });

    if (eligibility.conversionMethod === 'in_plan' || eligibility.conversionMethod === 'both') {
      steps.push({
        step: 3,
        title: "Convert to Roth 401(k)",
        description: "Request in-plan conversion of after-tax funds to Roth 401(k). Some plans do this automatically; others require manual requests.",
        timing: "After each contribution or periodically",
      });
    }

    if (eligibility.conversionMethod === 'distribution' || eligibility.conversionMethod === 'both') {
      steps.push({
        step: eligibility.conversionMethod === 'both' ? 4 : 3,
        title: "Alternatively: Roll to Roth IRA",
        description: "Request an in-service distribution of after-tax funds to your Roth IRA. This moves money out of your employer's plan.",
        timing: "Periodically (quarterly is common)",
      });
    }

    steps.push({
      step: steps.length + 1,
      title: "Convert Quickly to Minimize Gains",
      description: "Convert soon after contributing. Any gains between contribution and conversion are taxable.",
      timing: "Ongoing",
    });
  } else {
    steps.push({
      step: 1,
      title: "Check Your Plan Features",
      description: "Your current plan doesn't support mega backdoor Roth. Ask HR if they can add these features.",
    });

    steps.push({
      step: 2,
      title: "Use Regular Backdoor Roth Instead",
      description: "You can still contribute $7,000/year via the regular backdoor Roth IRA strategy.",
    });
  }

  // Recommendations and warnings
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (eligibility.canDoMegaBackdoor) {
    recommendations.push(`You can contribute up to $${maxMegaBackdoorAmount.toLocaleString()}/year via mega backdoor Roth.`);

    if (eligibility.conversionMethod === 'in_plan') {
      recommendations.push("In-plan conversion keeps money in your 401(k) with potentially better funds/fees than an IRA.");
    } else if (eligibility.conversionMethod === 'distribution') {
      recommendations.push("Rollover to Roth IRA gives you more investment options and flexibility.");
    } else if (eligibility.conversionMethod === 'both') {
      recommendations.push("You have both options—in-plan conversion is simpler; IRA rollover offers more flexibility.");
    }

    if (comparison.advantageAmount > 100000) {
      recommendations.push(`Over 10 years, mega backdoor Roth could provide $${comparison.advantageAmount.toLocaleString()} in tax-free growth advantage.`);
    }
  } else {
    recommendations.push("Consider asking HR to add after-tax contribution and conversion features to your 401(k) plan.");
    recommendations.push("In the meantime, maximize backdoor Roth IRA ($7,000/year) and standard 401(k) contributions.");
  }

  if (inputs.plan.employeeContribution < (inputs.age >= 50 ? EMPLOYEE_LIMIT_50_PLUS : EMPLOYEE_LIMIT)) {
    warnings.push("You're not maxing out your standard 401(k) contribution. Consider doing that first before mega backdoor.");
  }

  if (maxMegaBackdoorAmount > 0 && maxMegaBackdoorAmount < 10000) {
    warnings.push("Your mega backdoor space is limited due to high employer match. Still valuable, but less impactful.");
  }

  if (inputs.plan.allowsAfterTax && !inputs.plan.allowsInPlanConversion && !inputs.plan.allowsInServiceDistribution) {
    warnings.push("Warning: Your plan allows after-tax contributions but NO conversion option. Gains will be taxed as ordinary income—this is suboptimal.");
  }

  return {
    eligibility,
    contributionSpace,
    maxMegaBackdoorAmount,
    projectedGrowth,
    retirementBalance,
    totalContributed,
    totalGrowth,
    taxFreeSavings,
    comparison,
    steps,
    recommendations,
    warnings,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Mega Backdoor Roth Analyzer"
   - Subtitle: "Supercharge your Roth contributions—up to $46,000+ beyond normal limits"

2. **Plan Eligibility Checker**
   - Three yes/no questions:
     - Does your plan allow after-tax contributions?
     - Does your plan allow in-plan Roth conversion?
     - Does your plan allow in-service distributions?
   - Visual "Plan Grade" (A/B/C/F) based on answers
   - Clear eligibility verdict

3. **Contribution Space Calculator**
   - Visual showing the $69,000 limit "bucket"
   - Employee contribution section (colored)
   - Employer match section (colored)
   - Mega backdoor available space (highlighted)
   - Your numbers filled in dynamically

4. **Your Mega Backdoor Amount**
   - Large display: "$XX,XXX available for mega backdoor"
   - Monthly amount: "$X,XXX/month"
   - Per-paycheck amount (if bi-weekly): "$X,XXX"

5. **Growth Projection Chart**
   - Line chart showing Roth balance over time
   - Key milestones highlighted
   - Comparison line (without mega backdoor)

6. **10-Year Comparison Table**
   | Metric | With Mega Backdoor | Without | Advantage |
   |--------|-------------------|---------|-----------|
   | Total Contributions | $460,000 | $460,000 | — |
   | Final Balance | $756,000 | $642,000 | +$114K |
   | Taxes Paid | $0 | $85,000 | -$85K |

7. **Step-by-Step Guide**
   - Numbered cards with instructions
   - Timing guidance for each step
   - Links to resources

8. **Warnings & Recommendations Panel**
   - Personalized based on inputs
   - Action items highlighted

9. **How It Works Section** (collapsible)
   - Diagram of fund flow
   - Why this is legal
   - IRS limits explained

10. **FAQ Section** (collapsible)
    - "Is this legal?"
    - "How do I know if my plan allows it?"
    - "What's the difference vs regular backdoor Roth?"
    - "What if I change jobs?"

## Files to Create

```
src/
├── app/tools/mega-backdoor-roth/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/mega-backdoor-roth/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "mega-backdoor-roth",
  name: "Mega Backdoor Roth Analyzer",
  description: "Discover if you can contribute $46,000+ extra to Roth accounts annually",
  href: "/tools/mega-backdoor-roth",
  categoryId: "tax-planning",
  status: "live",
  primaryColor: "#8b5cf6",
  designStyle: "educational",
  inspiredBy: ["Mad Fientist", "White Coat Investor"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Eligibility checker correctly identifies plan capabilities
- [ ] Contribution space respects $69K/$76.5K limits
- [ ] Catch-up contributions handled for 50+
- [ ] Employer match correctly reduces available space
- [ ] Plan-specific limits respected
- [ ] Growth projections reasonable
- [ ] Steps change based on conversion method available

## Git Workflow

```bash
git checkout -b feature/app-mega-backdoor-roth
# ... build the app ...
git add .
git commit -m "Add Mega Backdoor Roth Analyzer"
git push -u origin feature/app-mega-backdoor-roth
```

## Do NOT

- Modify shared components
- Provide tax advice (educational only)
- Assume all 401(k) plans allow this (most don't!)
- Forget the distinction between after-tax and Roth 401(k)
- Skip explaining why quick conversion is important
- Ignore the case where plan has after-tax but no conversion option
