# Agent Prompt: Estate Tax Exposure Calculator

## Your Mission

Build the Estate Tax Exposure Calculator for ClearMoney. This tool helps users understand if they will owe federal or state estate taxes, especially critical given the 2026 sunset of the current high exemption ($13.99M dropping to ~$6-7M).

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/estate-tax-exposure/`
**Your calculator logic:** `/src/lib/calculators/estate-tax-exposure/`
**Branch name:** `feature/app-estate-tax-exposure`

## Background Research

**The Problem:**
- Most people don't know if estate taxes will affect them
- Life insurance death benefits count (surprising many)
- State estate taxes have much lower exemptions
- 2026 sunset will double the number of affected estates
- Planning takes time—can't rush at year-end

**Key Numbers (2025):**
- Federal exemption: $13.99M per person ($27.98M married with portability)
- Federal tax rate: 40% above exemption
- 2026 projected: ~$6-7M exemption (roughly half)
- Annual gift exclusion: $19,000 per recipient (2025)
- Lifetime gift exemption: Same as estate exemption

**What Counts in Your Estate:**
- Bank accounts and investments
- Real estate (including primary residence)
- Retirement accounts (401k, IRA)
- Life insurance death benefits (key surprise!)
- Business interests
- Personal property
- Trusts you control (revocable trusts)
- Previously gifted assets above annual exclusion (using lifetime exemption)

**State Estate Taxes:**
12 states + DC have separate estate taxes with lower exemptions:
- Oregon: $1M exemption
- Massachusetts: $1M exemption
- New York: $6.94M exemption (with "cliff")
- Washington: $2.193M exemption, up to 20% rate
- And others...

**2026 Sunset Urgency:**
- TCJA doubled the exemption in 2018
- Without Congressional action, reverts in 2026
- Gifts made before sunset "lock in" current exemption
- Planning should start in 2025 at the latest

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Slate (#64748b) - serious, estate planning
- **Design Style:** Clear verdict, urgency-focused
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Assets
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| bankAccounts | Bank & Cash Accounts | 100000 | 0 | 10000000 | 10000 |
| brokerageAccounts | Taxable Investment Accounts | 500000 | 0 | 50000000 | 25000 |
| retirementAccounts | Retirement Accounts (401k, IRA) | 500000 | 0 | 20000000 | 25000 |
| primaryResidence | Primary Residence Value | 1000000 | 0 | 20000000 | 50000 |
| otherRealEstate | Other Real Estate | 0 | 0 | 20000000 | 50000 |
| lifeInsurance | Life Insurance Death Benefit | 1000000 | 0 | 20000000 | 100000 |
| businessInterests | Business Interests | 0 | 0 | 50000000 | 50000 |
| otherAssets | Other Assets | 100000 | 0 | 10000000 | 10000 |

### Liabilities
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| mortgages | Mortgages | 400000 | 0 | 5000000 | 25000 |
| otherDebts | Other Debts | 0 | 0 | 2000000 | 10000 |

### Personal Information
| Input | Label | Default | Options |
|-------|-------|---------|---------|
| maritalStatus | Marital Status | single | single, married |
| stateOfResidence | State of Residence | CA | (all states) |
| age | Your Age | 45 | 18 - 100 |
| spouseAge | Spouse Age (if married) | 43 | 18 - 100 |

### Previous Gifts
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| lifetimeGiftsMade | Lifetime Taxable Gifts Made | 0 | 0 | 15000000 |

## Calculation Logic

```typescript
// src/lib/calculators/estate-tax-exposure/types.ts
export type MaritalStatus = 'single' | 'married';

export interface Assets {
  bankAccounts: number;
  brokerageAccounts: number;
  retirementAccounts: number;
  primaryResidence: number;
  otherRealEstate: number;
  lifeInsurance: number;
  businessInterests: number;
  otherAssets: number;
}

export interface Liabilities {
  mortgages: number;
  otherDebts: number;
}

export interface PersonalInfo {
  maritalStatus: MaritalStatus;
  stateOfResidence: string;
  age: number;
  spouseAge?: number;
}

export interface CalculatorInputs {
  assets: Assets;
  liabilities: Liabilities;
  personal: PersonalInfo;
  lifetimeGiftsMade: number;
}

export interface EstateCalculation {
  grossEstate: number;
  deductions: number;
  taxableEstate: number;
  exemptionUsed: number;
  exemptionRemaining: number;
  federalTaxDue: number;
  effectiveRate: number;
}

export interface StateEstateInfo {
  hasEstateTax: boolean;
  exemption: number;
  maxRate: number;
  stateTaxDue: number;
  notes: string;
}

export interface SunsetComparison {
  currentLaw: EstateCalculation;
  postSunset: EstateCalculation;
  additionalTaxIfNoAction: number;
  urgencyLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical';
}

export interface PlanningOpportunity {
  strategy: string;
  description: string;
  potentialSavings: number;
  timeframe: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface CalculatorResults {
  // Estate Summary
  grossEstate: number;
  totalLiabilities: number;
  netEstate: number;

  // Federal Analysis
  federal: EstateCalculation;

  // State Analysis
  state: StateEstateInfo;

  // Total Tax
  totalEstateTax: number;
  totalTaxRate: number;

  // 2026 Sunset Comparison
  sunsetComparison: SunsetComparison;

  // Asset Breakdown (for visualization)
  assetBreakdown: {
    category: string;
    value: number;
    percentage: number;
  }[];

  // Key Insights
  lifeInsuranceWarning: boolean;
  stateExemptionWarning: boolean;
  sunsetWarning: boolean;

  // Planning Opportunities
  opportunities: PlanningOpportunity[];

  // Recommendations
  recommendations: string[];
  warnings: string[];
}
```

```typescript
// src/lib/calculators/estate-tax-exposure/calculations.ts
import type { CalculatorInputs, CalculatorResults, EstateCalculation, StateEstateInfo, SunsetComparison, PlanningOpportunity } from "./types";

// Federal estate tax rates (2025)
const FEDERAL_EXEMPTION_2025 = 13990000;
const FEDERAL_EXEMPTION_POST_SUNSET = 7000000; // Estimated
const FEDERAL_TAX_RATE = 0.40;

// Annual gift exclusion
const ANNUAL_GIFT_EXCLUSION = 19000;

// State estate tax info
const STATE_ESTATE_TAX: Record<string, { exemption: number; maxRate: number; notes: string }> = {
  CT: { exemption: 13610000, maxRate: 0.12, notes: "Exemption tied to federal" },
  DC: { exemption: 4710800, maxRate: 0.16, notes: "Graduated rates" },
  HI: { exemption: 5490000, maxRate: 0.20, notes: "Graduated rates 10-20%" },
  IL: { exemption: 4000000, maxRate: 0.16, notes: "Graduated rates 0.8-16%" },
  ME: { exemption: 6800000, maxRate: 0.12, notes: "Graduated rates 8-12%" },
  MD: { exemption: 5000000, maxRate: 0.16, notes: "Also has inheritance tax" },
  MA: { exemption: 1000000, maxRate: 0.16, notes: "Low exemption, graduated rates" },
  MN: { exemption: 3000000, maxRate: 0.16, notes: "Graduated rates" },
  NY: { exemption: 6940000, maxRate: 0.16, notes: "Cliff: lose entire exemption if 5% over" },
  OR: { exemption: 1000000, maxRate: 0.16, notes: "Very low exemption" },
  RI: { exemption: 1774583, maxRate: 0.16, notes: "Indexed for inflation" },
  VT: { exemption: 5000000, maxRate: 0.16, notes: "Graduated rates" },
  WA: { exemption: 2193000, maxRate: 0.20, notes: "Highest state rate at 20%" },
};

// States without estate tax
const NO_ESTATE_TAX_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'DE', 'FL', 'GA', 'ID', 'IN', 'IA',
  'KS', 'KY', 'LA', 'MI', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NC', 'ND', 'OH', 'OK', 'PA', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'WV',
  'WI', 'WY'
];

function calculateFederalEstate(
  netEstate: number,
  lifetimeGifts: number,
  exemption: number,
  maritalStatus: string
): EstateCalculation {
  // Gross estate for tax calculation includes lifetime gifts
  const taxableEstate = netEstate + lifetimeGifts;

  // Married couples can use deceased spouse's unused exemption (portability)
  // For simplicity, we assume full use of own exemption
  const exemptionUsed = Math.min(taxableEstate, exemption);
  const exemptionRemaining = Math.max(0, exemption - taxableEstate);

  // Estate over exemption is taxed
  const taxableAmount = Math.max(0, taxableEstate - exemption);
  const federalTaxDue = taxableAmount * FEDERAL_TAX_RATE;

  const effectiveRate = taxableEstate > 0 ? federalTaxDue / taxableEstate : 0;

  return {
    grossEstate: netEstate,
    deductions: 0, // Simplified
    taxableEstate,
    exemptionUsed,
    exemptionRemaining,
    federalTaxDue,
    effectiveRate,
  };
}

function calculateStateEstate(
  netEstate: number,
  stateCode: string
): StateEstateInfo {
  const stateInfo = STATE_ESTATE_TAX[stateCode];

  if (!stateInfo) {
    return {
      hasEstateTax: false,
      exemption: 0,
      maxRate: 0,
      stateTaxDue: 0,
      notes: "No state estate tax",
    };
  }

  const taxableAmount = Math.max(0, netEstate - stateInfo.exemption);

  // NY cliff: if estate exceeds exemption by more than 5%, lose entire exemption
  let stateTaxDue = 0;
  if (stateCode === 'NY' && netEstate > stateInfo.exemption * 1.05) {
    stateTaxDue = netEstate * 0.16; // Tax on full estate
  } else {
    // Simplified: use average rate (actual is graduated)
    const avgRate = stateInfo.maxRate * 0.7; // Rough approximation
    stateTaxDue = taxableAmount * avgRate;
  }

  return {
    hasEstateTax: true,
    exemption: stateInfo.exemption,
    maxRate: stateInfo.maxRate,
    stateTaxDue,
    notes: stateInfo.notes,
  };
}

function calculateSunsetComparison(
  netEstate: number,
  lifetimeGifts: number,
  maritalStatus: string
): SunsetComparison {
  const currentLaw = calculateFederalEstate(netEstate, lifetimeGifts, FEDERAL_EXEMPTION_2025, maritalStatus);
  const postSunset = calculateFederalEstate(netEstate, lifetimeGifts, FEDERAL_EXEMPTION_POST_SUNSET, maritalStatus);

  const additionalTaxIfNoAction = postSunset.federalTaxDue - currentLaw.federalTaxDue;

  // Determine urgency level
  let urgencyLevel: SunsetComparison['urgencyLevel'];
  if (additionalTaxIfNoAction <= 0) {
    urgencyLevel = 'none';
  } else if (additionalTaxIfNoAction < 500000) {
    urgencyLevel = 'low';
  } else if (additionalTaxIfNoAction < 2000000) {
    urgencyLevel = 'moderate';
  } else if (additionalTaxIfNoAction < 5000000) {
    urgencyLevel = 'high';
  } else {
    urgencyLevel = 'critical';
  }

  return {
    currentLaw,
    postSunset,
    additionalTaxIfNoAction,
    urgencyLevel,
  };
}

function generateOpportunities(
  inputs: CalculatorInputs,
  results: Partial<CalculatorResults>
): PlanningOpportunity[] {
  const opportunities: PlanningOpportunity[] = [];
  const { assets, personal, lifetimeGiftsMade } = inputs;

  // Annual exclusion gifts
  const annualGiftPotential = personal.maritalStatus === 'married' ? ANNUAL_GIFT_EXCLUSION * 2 : ANNUAL_GIFT_EXCLUSION;
  opportunities.push({
    strategy: "Annual Exclusion Gifts",
    description: `Gift up to $${annualGiftPotential.toLocaleString()} per recipient annually without using lifetime exemption.`,
    potentialSavings: annualGiftPotential * FEDERAL_TAX_RATE,
    timeframe: "Ongoing, annually",
    complexity: 'simple',
  });

  // Life insurance trust
  if (assets.lifeInsurance > 0) {
    const iilitSavings = assets.lifeInsurance * FEDERAL_TAX_RATE;
    opportunities.push({
      strategy: "Irrevocable Life Insurance Trust (ILIT)",
      description: `Remove $${assets.lifeInsurance.toLocaleString()} in life insurance from your estate by transferring to an ILIT.`,
      potentialSavings: iilitSavings,
      timeframe: "3+ months to implement",
      complexity: 'moderate',
    });
  }

  // Use lifetime exemption before sunset
  if (results.sunsetComparison && results.sunsetComparison.additionalTaxIfNoAction > 0) {
    const exemptionToUse = FEDERAL_EXEMPTION_2025 - FEDERAL_EXEMPTION_POST_SUNSET - lifetimeGiftsMade;
    if (exemptionToUse > 0) {
      opportunities.push({
        strategy: "Use Lifetime Exemption Before 2026",
        description: `Transfer up to $${exemptionToUse.toLocaleString()} to irrevocable trusts before the exemption drops.`,
        potentialSavings: results.sunsetComparison.additionalTaxIfNoAction,
        timeframe: "Before December 31, 2025",
        complexity: 'complex',
      });
    }
  }

  // GRAT for appreciating assets
  if (assets.businessInterests > 1000000 || assets.brokerageAccounts > 2000000) {
    opportunities.push({
      strategy: "Grantor Retained Annuity Trust (GRAT)",
      description: "Transfer appreciating assets while retaining an income stream. Growth passes tax-free to beneficiaries.",
      potentialSavings: (assets.businessInterests + assets.brokerageAccounts) * 0.05 * FEDERAL_TAX_RATE, // Assume 5% annual appreciation
      timeframe: "2-10 year trust term",
      complexity: 'complex',
    });
  }

  // Charitable giving
  opportunities.push({
    strategy: "Charitable Giving",
    description: "Charitable bequests reduce your taxable estate dollar-for-dollar.",
    potentialSavings: 0, // Depends on amount
    timeframe: "Update estate plan",
    complexity: 'simple',
  });

  // State planning
  if (results.state && results.state.hasEstateTax && results.state.stateTaxDue > 100000) {
    opportunities.push({
      strategy: "Consider State Domicile",
      description: `Your state has a ${(results.state.maxRate * 100).toFixed(0)}% estate tax. Relocating to a no-tax state could save $${results.state.stateTaxDue.toLocaleString()}.`,
      potentialSavings: results.state.stateTaxDue,
      timeframe: "Major life decision",
      complexity: 'complex',
    });
  }

  return opportunities;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { assets, liabilities, personal, lifetimeGiftsMade } = inputs;

  // Calculate gross estate
  const grossEstate =
    assets.bankAccounts +
    assets.brokerageAccounts +
    assets.retirementAccounts +
    assets.primaryResidence +
    assets.otherRealEstate +
    assets.lifeInsurance +
    assets.businessInterests +
    assets.otherAssets;

  const totalLiabilities = liabilities.mortgages + liabilities.otherDebts;
  const netEstate = grossEstate - totalLiabilities;

  // Federal calculation
  const federal = calculateFederalEstate(netEstate, lifetimeGiftsMade, FEDERAL_EXEMPTION_2025, personal.maritalStatus);

  // State calculation
  const state = calculateStateEstate(netEstate, personal.stateOfResidence);

  // Total tax
  const totalEstateTax = federal.federalTaxDue + state.stateTaxDue;
  const totalTaxRate = netEstate > 0 ? totalEstateTax / netEstate : 0;

  // Sunset comparison
  const sunsetComparison = calculateSunsetComparison(netEstate, lifetimeGiftsMade, personal.maritalStatus);

  // Asset breakdown
  const assetBreakdown = [
    { category: "Bank & Cash", value: assets.bankAccounts, percentage: (assets.bankAccounts / grossEstate) * 100 },
    { category: "Investments", value: assets.brokerageAccounts, percentage: (assets.brokerageAccounts / grossEstate) * 100 },
    { category: "Retirement", value: assets.retirementAccounts, percentage: (assets.retirementAccounts / grossEstate) * 100 },
    { category: "Primary Home", value: assets.primaryResidence, percentage: (assets.primaryResidence / grossEstate) * 100 },
    { category: "Other Real Estate", value: assets.otherRealEstate, percentage: (assets.otherRealEstate / grossEstate) * 100 },
    { category: "Life Insurance", value: assets.lifeInsurance, percentage: (assets.lifeInsurance / grossEstate) * 100 },
    { category: "Business", value: assets.businessInterests, percentage: (assets.businessInterests / grossEstate) * 100 },
    { category: "Other", value: assets.otherAssets, percentage: (assets.otherAssets / grossEstate) * 100 },
  ].filter(item => item.value > 0);

  // Warnings
  const lifeInsuranceWarning = assets.lifeInsurance > 0 && assets.lifeInsurance > FEDERAL_EXEMPTION_2025 * 0.1;
  const stateExemptionWarning = state.hasEstateTax && netEstate > state.exemption;
  const sunsetWarning = sunsetComparison.additionalTaxIfNoAction > 500000;

  // Build results
  const results: Partial<CalculatorResults> = {
    grossEstate,
    totalLiabilities,
    netEstate,
    federal,
    state,
    totalEstateTax,
    totalTaxRate,
    sunsetComparison,
    assetBreakdown,
    lifeInsuranceWarning,
    stateExemptionWarning,
    sunsetWarning,
  };

  // Generate opportunities
  const opportunities = generateOpportunities(inputs, results);

  // Recommendations and warnings
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (federal.federalTaxDue > 0) {
    warnings.push(`Your estate exceeds the federal exemption. Estimated federal estate tax: $${federal.federalTaxDue.toLocaleString()}`);
  } else {
    recommendations.push(`Your estate is currently under the federal exemption ($${FEDERAL_EXEMPTION_2025.toLocaleString()}). No federal estate tax due.`);
  }

  if (sunsetWarning) {
    warnings.push(`URGENT: After the 2026 sunset, your estate tax could increase by $${sunsetComparison.additionalTaxIfNoAction.toLocaleString()}. Act before December 2025.`);
  }

  if (lifeInsuranceWarning) {
    warnings.push(`Your $${assets.lifeInsurance.toLocaleString()} life insurance counts toward your estate. Consider an ILIT to remove it.`);
  }

  if (stateExemptionWarning) {
    warnings.push(`Your state (${personal.stateOfResidence}) has an estate tax. You owe approximately $${state.stateTaxDue.toLocaleString()} in state estate tax.`);
  }

  if (state.notes.includes('cliff') && netEstate > state.exemption * 0.9) {
    warnings.push(`New York has an estate tax "cliff": if your estate exceeds the exemption by more than 5%, you lose the ENTIRE exemption. Be very careful with estate size.`);
  }

  if (personal.maritalStatus === 'married') {
    recommendations.push("As a married couple, you can use 'portability' to preserve any unused exemption when the first spouse dies.");
  }

  recommendations.push("Consider meeting with an estate planning attorney, especially given the 2026 exemption sunset.");

  return {
    ...results,
    opportunities,
    recommendations,
    warnings,
  } as CalculatorResults;
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Estate Tax Exposure Calculator"
   - Subtitle: "Will you owe estate taxes? Understand your exposure—especially before 2026."

2. **Urgency Banner** (if applicable)
   - Countdown to 2026 sunset
   - "Your potential additional tax: $X,XXX,XXX"
   - Call to action

3. **Asset Input Section** (accordion/tabs)
   - Liquid Assets (bank, brokerage)
   - Retirement Accounts
   - Real Estate
   - Life Insurance (with warning icon)
   - Business Interests
   - Other Assets

4. **Liability Input Section**
   - Mortgages
   - Other debts

5. **Personal Information**
   - Marital status (affects exemption)
   - State of residence (affects state tax)
   - Prior gifts made

6. **The Verdict** (hero result)
   - Large display: "Estate Tax Exposure: $X,XXX,XXX" or "No Estate Tax Expected"
   - Federal vs State breakdown
   - Effective tax rate

7. **Asset Breakdown Chart**
   - Pie/donut chart showing estate composition
   - Life insurance highlighted if significant

8. **2026 Sunset Comparison** (key feature)
   - Side-by-side:
     - Current Law (2025): $X tax
     - After Sunset (2026): $X tax
   - "Potential increase: $X,XXX,XXX"
   - Urgency level indicator

9. **State Estate Tax Section**
   - State-specific information
   - Exemption comparison to federal
   - Special rules (NY cliff, etc.)

10. **Planning Opportunities** (cards)
    - Strategy name
    - Potential savings
    - Complexity indicator
    - Timeframe

11. **Warnings & Recommendations Panel**
    - Life insurance warning
    - State tax warning
    - Sunset urgency
    - Action items

12. **Methodology Section** (collapsible)
    - What counts in your estate
    - How exemptions work
    - Portability explained
    - State tax overview

## Files to Create

```
src/
├── app/tools/estate-tax-exposure/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/estate-tax-exposure/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "estate-tax-exposure",
  name: "Estate Tax Exposure Calculator",
  description: "Find out if you'll owe estate taxes—especially critical before 2026",
  href: "/tools/estate-tax-exposure",
  categoryId: "estate-planning",
  status: "live",
  primaryColor: "#64748b",
  designStyle: "analytical",
  inspiredBy: ["Savvy Wealth", "Glenmede"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Federal exemption applied correctly
- [ ] Married couples get higher exemption
- [ ] State taxes calculated for applicable states
- [ ] NY cliff rule working
- [ ] Life insurance included in estate
- [ ] Sunset comparison shows difference
- [ ] Opportunities make sense for the situation

## Git Workflow

```bash
git checkout -b feature/app-estate-tax-exposure
# ... build the app ...
git add .
git commit -m "Add Estate Tax Exposure Calculator"
git push -u origin feature/app-estate-tax-exposure
```

## Do NOT

- Modify shared components
- Provide legal/estate planning advice (educational only)
- Forget life insurance counts in the estate
- Ignore state estate taxes
- Skip the 2026 sunset comparison
- Forget the NY cliff rule
