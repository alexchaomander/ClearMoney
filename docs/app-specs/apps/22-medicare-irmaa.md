# App Spec: Medicare IRMAA Planning Calculator

## Overview
- **One-line description:** Plan your retirement income to avoid or minimize Medicare IRMAA surcharges that can cost thousands per year
- **Target user persona:** Pre-retirees (ages 60-65), retirees on Medicare, financial planners, those with significant retirement assets
- **Key problem it solves:** IRMAA uses income from 2 years ago, catching many retirees off guard with unexpected premium increases; proactive planning can save thousands

## Inspired By
- The complexity of IRMAA income brackets
- The 2-year lookback that surprises retirees
- Roth conversion planning to manage future IRMAA
- Life-changing events that allow appeals

## Why This Matters Now
2026 IRMAA environment:
1. **New 2026 Brackets** - Adjusted annually for inflation
2. **MAGI-Based** - Modified Adjusted Gross Income from 2024 tax return
3. **Affects Part B AND Part D** - Double hit for higher earners
4. **Roth Conversions Impact** - Large conversions can trigger IRMAA 2 years later
5. **Social Security COLA** - May push more retirees into higher brackets
6. **Life-Changing Events** - Can appeal if income dropped due to specific events

## Core Features
- [ ] Calculate current and projected IRMAA surcharges
- [ ] 2-year lookback income planning
- [ ] Roth conversion IRMAA impact calculator
- [ ] Bracket cliff analysis (where small income changes = big premium jumps)
- [ ] Life-changing event appeal eligibility
- [ ] Multi-year IRMAA projection
- [ ] Strategies to reduce or avoid IRMAA
- [ ] Part B + Part D combined cost calculator

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Filing Status | select | married | - | - | - |
| Current Age | number | 63 | 55 | 85 | 1 |
| 2024 MAGI (for 2026 IRMAA) | slider | 200000 | 0 | 1000000 | 5000 |
| 2025 Projected MAGI (for 2027) | slider | 200000 | 0 | 1000000 | 5000 |
| Social Security Income | slider | 40000 | 0 | 100000 | 1000 |
| Pension Income | slider | 0 | 0 | 200000 | 1000 |
| Traditional IRA/401k Balance | slider | 1000000 | 0 | 10000000 | 50000 |
| Planned Roth Conversion | slider | 0 | 0 | 500000 | 5000 |
| Tax-Exempt Interest | slider | 0 | 0 | 100000 | 1000 |
| Life-Changing Event? | select | none | - | - | - |

## Calculation Logic

```typescript
interface IRMAAInputs {
  filingStatus: "single" | "married" | "married_separate";
  currentAge: number;
  magi2024: number;  // Determines 2026 IRMAA
  magi2025: number;  // Determines 2027 IRMAA
  socialSecurityIncome: number;
  pensionIncome: number;
  traditionalBalance: number;
  plannedRothConversion: number;
  taxExemptInterest: number;
  lifeChangingEvent: "none" | "marriage" | "divorce" | "death_of_spouse" |
                     "work_stoppage" | "work_reduction" | "loss_of_pension";
}

interface IRMAABracket {
  minIncome: number;
  maxIncome: number;
  partBPremium: number;
  partBSurcharge: number;
  partDSurcharge: number;
  totalMonthlySurcharge: number;
  annualSurcharge: number;
}

interface IRMAAResults {
  current2026: {
    bracket: IRMAABracket;
    magi: number;
    monthlyPartB: number;
    monthlyPartD: number;
    totalMonthlyCost: number;
    annualCost: number;
    surchargeAmount: number;
  };
  projected2027: {
    bracket: IRMAABracket;
    magi: number;
    monthlyPartB: number;
    monthlyPartD: number;
    totalMonthlyCost: number;
    annualCost: number;
    surchargeAmount: number;
  };
  rothConversionImpact: {
    withoutConversion: { magi: number; annualIRMAA: number };
    withConversion: { magi: number; annualIRMAA: number };
    additionalCost: number;
    recommendation: string;
  };
  bracketCliffAnalysis: {
    currentBracket: IRMAABracket;
    nextBracket: IRMAABracket;
    incomeUntilNextBracket: number;
    costOfCrossingBracket: number;
  };
  lifeChangingEventEligibility: {
    eligible: boolean;
    eventType: string;
    potentialSavings: number;
    howToAppeal: string;
  };
  strategies: string[];
  fiveYearProjection: {
    year: number;
    projectedMAGI: number;
    projectedIRMAA: number;
  }[];
}

// 2026 IRMAA Brackets (based on 2024 MAGI)
// Note: These are estimates - actual brackets released in fall 2025
const IRMAA_BRACKETS_2026 = {
  single: [
    { min: 0, max: 106000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 106001, max: 133000, partBSurcharge: 74.00, partDSurcharge: 13.70 },
    { min: 133001, max: 167000, partBSurcharge: 185.00, partDSurcharge: 35.30 },
    { min: 167001, max: 200000, partBSurcharge: 295.90, partDSurcharge: 57.00 },
    { min: 200001, max: 500000, partBSurcharge: 406.90, partDSurcharge: 78.60 },
    { min: 500001, max: Infinity, partBSurcharge: 443.90, partDSurcharge: 85.80 },
  ],
  married: [
    { min: 0, max: 212000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 212001, max: 266000, partBSurcharge: 74.00, partDSurcharge: 13.70 },
    { min: 266001, max: 334000, partBSurcharge: 185.00, partDSurcharge: 35.30 },
    { min: 334001, max: 400000, partBSurcharge: 295.90, partDSurcharge: 57.00 },
    { min: 400001, max: 750000, partBSurcharge: 406.90, partDSurcharge: 78.60 },
    { min: 750001, max: Infinity, partBSurcharge: 443.90, partDSurcharge: 85.80 },
  ],
  married_separate: [
    { min: 0, max: 106000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 106001, max: 394000, partBSurcharge: 406.90, partDSurcharge: 78.60 },
    { min: 394001, max: Infinity, partBSurcharge: 443.90, partDSurcharge: 85.80 },
  ],
};

// 2026 Base Part B Premium (estimated)
const BASE_PART_B_PREMIUM_2026 = 185.00;  // Estimate, actual announced in fall 2025

// Life-Changing Events that allow IRMAA appeal
const LIFE_CHANGING_EVENTS = [
  { code: "marriage", description: "Marriage" },
  { code: "divorce", description: "Divorce or annulment" },
  { code: "death_of_spouse", description: "Death of spouse" },
  { code: "work_stoppage", description: "Work stoppage (retirement, layoff)" },
  { code: "work_reduction", description: "Work reduction" },
  { code: "loss_of_pension", description: "Loss of income-producing property or pension" },
];

function calculateMAGI(inputs: IRMAAInputs, includeRothConversion: boolean): number {
  let magi = inputs.socialSecurityIncome * 0.85; // Up to 85% taxable
  magi += inputs.pensionIncome;
  magi += inputs.taxExemptInterest; // Tax-exempt interest IS included in MAGI for IRMAA!

  if (includeRothConversion) {
    magi += inputs.plannedRothConversion;
  }

  return magi;
}

function getIRMAABracket(
  magi: number,
  filingStatus: string
): IRMAABracket {
  const brackets = IRMAA_BRACKETS_2026[filingStatus as keyof typeof IRMAA_BRACKETS_2026];

  for (const bracket of brackets) {
    if (magi >= bracket.min && magi <= bracket.max) {
      const totalMonthlySurcharge = bracket.partBSurcharge + bracket.partDSurcharge;
      return {
        minIncome: bracket.min,
        maxIncome: bracket.max,
        partBPremium: BASE_PART_B_PREMIUM_2026 + bracket.partBSurcharge,
        partBSurcharge: bracket.partBSurcharge,
        partDSurcharge: bracket.partDSurcharge,
        totalMonthlySurcharge,
        annualSurcharge: totalMonthlySurcharge * 12,
      };
    }
  }

  // Should never reach here
  return brackets[brackets.length - 1] as unknown as IRMAABracket;
}

function calculateRothConversionImpact(inputs: IRMAAInputs): IRMAAResults["rothConversionImpact"] {
  const magiWithout = calculateMAGI(inputs, false);
  const magiWith = calculateMAGI(inputs, true);

  const bracketWithout = getIRMAABracket(magiWithout, inputs.filingStatus);
  const bracketWith = getIRMAABracket(magiWith, inputs.filingStatus);

  const annualWithout = bracketWithout.annualSurcharge;
  const annualWith = bracketWith.annualSurcharge;
  const additionalCost = annualWith - annualWithout;

  let recommendation = "";
  if (additionalCost === 0) {
    recommendation = "This Roth conversion won't trigger additional IRMAA.";
  } else if (additionalCost < 1000) {
    recommendation = "Minor IRMAA impact. May still be worth converting for long-term tax benefits.";
  } else if (additionalCost < 5000) {
    recommendation = "Moderate IRMAA impact. Consider splitting conversion across multiple years.";
  } else {
    recommendation = "Significant IRMAA impact. Strongly consider smaller conversions over multiple years.";
  }

  return {
    withoutConversion: { magi: magiWithout, annualIRMAA: annualWithout },
    withConversion: { magi: magiWith, annualIRMAA: annualWith },
    additionalCost,
    recommendation,
  };
}

function analyzeBracketCliff(
  magi: number,
  filingStatus: string
): IRMAAResults["bracketCliffAnalysis"] {
  const brackets = IRMAA_BRACKETS_2026[filingStatus as keyof typeof IRMAA_BRACKETS_2026];
  const currentBracket = getIRMAABracket(magi, filingStatus);

  // Find next bracket
  let nextBracketIndex = brackets.findIndex(b => b.min > magi);
  if (nextBracketIndex === -1) nextBracketIndex = brackets.length - 1;

  const nextBracketRaw = brackets[nextBracketIndex];
  const nextBracket = getIRMAABracket(nextBracketRaw.min, filingStatus);

  const incomeUntilNextBracket = nextBracketRaw.min - magi;
  const costOfCrossingBracket = (nextBracket.annualSurcharge - currentBracket.annualSurcharge);

  return {
    currentBracket,
    nextBracket,
    incomeUntilNextBracket: Math.max(0, incomeUntilNextBracket),
    costOfCrossingBracket,
  };
}

function checkLifeChangingEventEligibility(
  event: string,
  currentMAGI: number,
  filingStatus: string
): IRMAAResults["lifeChangingEventEligibility"] {
  if (event === "none") {
    return {
      eligible: false,
      eventType: "None",
      potentialSavings: 0,
      howToAppeal: "",
    };
  }

  // If income dropped significantly due to event, they may qualify
  const currentBracket = getIRMAABracket(currentMAGI, filingStatus);
  const baseBracket = getIRMAABracket(0, filingStatus); // No surcharge bracket

  return {
    eligible: true,
    eventType: LIFE_CHANGING_EVENTS.find(e => e.code === event)?.description || event,
    potentialSavings: currentBracket.annualSurcharge,
    howToAppeal: "File SSA-44 form with Social Security. Include documentation of the life-changing event and proof of reduced income.",
  };
}

function generateStrategies(inputs: IRMAAInputs, results: Partial<IRMAAResults>): string[] {
  const strategies: string[] = [];

  // Check if in or near IRMAA bracket
  const bracket = getIRMAABracket(inputs.magi2024, inputs.filingStatus);

  if (bracket.partBSurcharge > 0) {
    strategies.push("You're currently paying IRMAA surcharges. Consider income reduction strategies.");
  }

  // Roth conversion timing
  if (inputs.traditionalBalance > 500000) {
    strategies.push("With significant traditional IRA/401k balance, consider spreading Roth conversions over multiple years to manage IRMAA impact.");
  }

  // Bracket cliff warning
  const cliffAnalysis = analyzeBracketCliff(inputs.magi2024, inputs.filingStatus);
  if (cliffAnalysis.incomeUntilNextBracket < 10000 && cliffAnalysis.incomeUntilNextBracket > 0) {
    strategies.push(`You're only $${cliffAnalysis.incomeUntilNextBracket.toLocaleString()} from the next IRMAA bracket, which would cost an additional $${cliffAnalysis.costOfCrossingBracket.toLocaleString()}/year.`);
  }

  // Tax-exempt interest warning
  if (inputs.taxExemptInterest > 0) {
    strategies.push("Remember: Tax-exempt interest IS counted in MAGI for IRMAA purposes. Consider this when buying municipal bonds.");
  }

  // Life-changing event
  if (inputs.lifeChangingEvent !== "none") {
    strategies.push("You may be eligible to appeal your IRMAA determination based on your life-changing event. File Form SSA-44.");
  }

  // General strategies
  strategies.push("Consider qualified charitable distributions (QCDs) from IRAs after age 70½ to reduce MAGI.");
  strategies.push("Time large income events (property sales, Roth conversions) to avoid IRMAA bracket cliffs.");

  return strategies;
}
```

## UI Components
- IRMAA bracket visualization (current position highlighted)
- 2-year lookback timeline showing which year's income affects which year's IRMAA
- Roth conversion impact simulator
- Bracket cliff warning indicator
- Life-changing event appeal eligibility checker
- Multi-year projection chart
- Strategy recommendations cards
- Part B + Part D combined cost breakdown

## Design Direction
- **Primary Color:** `#0891b2` (cyan - healthcare/Medicare feel)
- **Personality:** Educational, empowering, proactive
- **Style:** Bracket visualizations, timeline views, cost comparisons
- **Visual emphasis:** Bracket cliffs, 2-year lookback, potential savings

## Agent Prompt

```markdown
# Agent Prompt: Medicare IRMAA Planning Calculator

## Context
You are building a Medicare IRMAA (Income-Related Monthly Adjustment Amount) planning calculator for ClearMoney. IRMAA causes higher-income Medicare beneficiaries to pay more for Part B and Part D.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/medicare-irmaa/
- Your calculator logic: /src/lib/calculators/medicare-irmaa/

## Design Requirements
- Primary Color: #0891b2 (cyan)
- Mobile-first, dark mode base
- Clear bracket visualization
- Timeline showing lookback period

## Key IRMAA Concepts

### What is IRMAA?
- Income-Related Monthly Adjustment Amount
- Additional premium for Medicare Part B and Part D
- Based on Modified Adjusted Gross Income (MAGI)
- Uses income from 2 YEARS AGO (2024 income → 2026 IRMAA)

### 2026 IRMAA Brackets (Married Filing Jointly)
| MAGI Range | Part B Surcharge | Part D Surcharge |
|------------|------------------|------------------|
| ≤ $212,000 | $0 | $0 |
| $212,001-$266,000 | $74.00 | $13.70 |
| $266,001-$334,000 | $185.00 | $35.30 |
| $334,001-$400,000 | $295.90 | $57.00 |
| $400,001-$750,000 | $406.90 | $78.60 |
| > $750,000 | $443.90 | $85.80 |

### 2026 IRMAA Brackets (Single)
| MAGI Range | Part B Surcharge | Part D Surcharge |
|------------|------------------|------------------|
| ≤ $106,000 | $0 | $0 |
| $106,001-$133,000 | $74.00 | $13.70 |
| $133,001-$167,000 | $185.00 | $35.30 |
| $167,001-$200,000 | $295.90 | $57.00 |
| $200,001-$500,000 | $406.90 | $78.60 |
| > $500,000 | $443.90 | $85.80 |

### MAGI for IRMAA Includes:
- Adjusted Gross Income (AGI)
- Tax-exempt interest (municipal bonds!)
- NOT the same as regular MAGI

### Life-Changing Events (Can Appeal)
1. Marriage
2. Divorce/annulment
3. Death of spouse
4. Work stoppage (retirement)
5. Work reduction
6. Loss of income-producing property/pension

Form SSA-44 to request reconsideration.

### Key Planning Considerations
- Roth conversions add to MAGI → trigger IRMAA 2 years later
- Large one-time income events can cause multi-year IRMAA
- Bracket cliffs mean $1 over can cost thousands
- Tax-exempt interest counts (surprises many!)

## Files to Create
1. `/src/app/tools/medicare-irmaa/page.tsx`
2. `/src/app/tools/medicare-irmaa/calculator.tsx`
3. `/src/lib/calculators/medicare-irmaa/calculations.ts`
4. `/src/lib/calculators/medicare-irmaa/constants.ts`
5. `/src/lib/calculators/medicare-irmaa/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "medicare-irmaa",
  name: "Medicare IRMAA Planner",
  description: "Plan your retirement income to minimize Medicare premium surcharges",
  href: "/tools/medicare-irmaa",
  categoryId: "taxes",
  status: "live",
  primaryColor: "#0891b2",
  designStyle: "analytical",
  inspiredBy: ["Medicare.gov", "Kitces"],
  featured: true,
}
```

## Testing Checklist
- [ ] All IRMAA brackets calculate correctly
- [ ] 2-year lookback logic is clear
- [ ] Roth conversion impact calculates properly
- [ ] Life-changing event eligibility logic works
- [ ] Married filing separately brackets are correct (different!)
- [ ] Tax-exempt interest is included in MAGI calculation
```

## Sources

### Primary Sources
1. **Medicare.gov: Part B Costs**
   https://www.medicare.gov/basics/costs/medicare-costs/part-b-costs

2. **Medicare.gov: IRMAA**
   https://www.medicare.gov/basics/costs/medicare-costs/irmaa

3. **SSA: Medicare Premiums**
   https://www.ssa.gov/benefits/medicare/medicare-premiums.html

### Secondary Sources
4. **CMS: 2026 Medicare Parts A & B Premiums and Deductibles**
   https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-and-deductibles

5. **Kitces: IRMAA Planning Strategies**
   https://www.kitces.com/blog/medicare-irmaa-income-brackets-surcharge-planning-strategies/

6. **Fidelity: Understanding IRMAA**
   https://www.fidelity.com/viewpoints/retirement/medicare-irmaa

7. **Kiplinger: How to Appeal IRMAA**
   https://www.kiplinger.com/retirement/medicare/how-to-appeal-medicare-irmaa-surcharge

8. **AARP: Medicare IRMAA Brackets 2026**
   https://www.aarp.org/health/medicare-insurance/info-2024/medicare-irmaa-brackets.html

9. **Medicare Rights Center: Income-Related Premiums**
   https://www.medicareinteractive.org/get-answers/medicare-basics/medicare-costs-at-a-glance/income-related-monthly-adjustment-amount-irmaa
