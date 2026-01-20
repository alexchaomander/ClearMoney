# Agent Prompt: Equity Concentration Risk Assessment

## Your Mission

Build the Equity Concentration Risk Assessment tool for ClearMoney. This tool helps tech workers and startup employees understand the risk of having too much wealth tied to a single stock—their employer's—and provides strategies to diversify safely.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/equity-concentration/`
**Your calculator logic:** `/src/lib/calculators/equity-concentration/`
**Branch name:** `feature/app-equity-concentration`

## Background Research

**The Problem:**
- Tech employees often have 50-90% of net worth in employer stock
- This is "uncompensated risk"—you're not rewarded for taking it
- You already have "human capital" exposure (your job depends on the company)
- Historical examples show devastating outcomes (Enron, Intel 2024 layoffs)
- Emotional attachment ("but I believe in the company!") clouds judgment

**Key Statistics:**
- 86% of startup employees' net worth is in stock options (Secfi)
- Intel stock dropped 60%+ in 2024—during layoffs
- Enron employees lost jobs AND retirement simultaneously
- Even successful companies like Meta dropped 77% in 2022

**Why This Is "Uncompensated Risk":**
In finance, risk should be rewarded. Diversified portfolios eliminate "idiosyncratic" (company-specific) risk while keeping "systematic" (market) risk that IS rewarded.

Concentration in one stock:
- Has same systematic risk as the market
- ADDS idiosyncratic risk
- Provides NO additional expected return
- You're taking risk you're not paid for

**The Double Exposure Problem:**
If your company fails:
- Your stock goes to zero
- Your job is gone
- Your unvested equity evaporates
- Your future income (if company-specific skills) is impaired

**Prudent Guidelines:**
- No single position should exceed 5-10% of net worth
- Employer stock especially risky due to human capital correlation
- Gradual diversification minimizes tax impact
- Consider 10b5-1 plans for systematic selling

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Rose (#f43f5e) - warning, attention
- **Design Style:** Risk-focused, educational, scenario-driven
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Employer Equity Holdings
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| currentSharesValue | Current Employer Stock Value | 500000 | 0 | 10000000 | 10000 |
| vestedOptionsValue | Vested Options (intrinsic value) | 100000 | 0 | 5000000 | 10000 |
| unvestedEquityValue | Unvested RSUs/Options Value | 200000 | 0 | 5000000 | 10000 |
| costBasis | Total Cost Basis | 50000 | 0 | 5000000 | 5000 |

### Other Assets
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| cashSavings | Cash & Savings | 50000 | 0 | 2000000 | 5000 |
| retirementAccounts | Retirement Accounts (401k, IRA) | 200000 | 0 | 5000000 | 10000 |
| otherInvestments | Other Investments (non-employer) | 100000 | 0 | 5000000 | 10000 |
| realEstate | Real Estate Equity | 300000 | 0 | 5000000 | 25000 |
| otherAssets | Other Assets | 0 | 0 | 1000000 | 10000 |

### Income Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| annualSalary | Annual Salary | 200000 | 0 | 2000000 | 10000 |
| annualEquityGrant | Annual Equity Grant Value | 100000 | 0 | 1000000 | 10000 |
| yearsAtCompany | Years at Company | 3 | 0 | 30 | 1 |

### Tax Information
| Input | Label | Default | Options |
|-------|-------|---------|---------|
| filingStatus | Filing Status | single | single, married |
| marginalTaxRate | Marginal Tax Rate % | 37 | 0 - 50 |
| stateCode | State | CA | (all states) |

## Calculation Logic

```typescript
// src/lib/calculators/equity-concentration/types.ts
export interface EquityHoldings {
  currentSharesValue: number;
  vestedOptionsValue: number;
  unvestedEquityValue: number;
  costBasis: number;
}

export interface OtherAssets {
  cashSavings: number;
  retirementAccounts: number;
  otherInvestments: number;
  realEstate: number;
  otherAssets: number;
}

export interface IncomeInfo {
  annualSalary: number;
  annualEquityGrant: number;
  yearsAtCompany: number;
}

export interface TaxInfo {
  filingStatus: 'single' | 'married';
  marginalTaxRate: number;
  stateCode: string;
}

export interface CalculatorInputs {
  equity: EquityHoldings;
  assets: OtherAssets;
  income: IncomeInfo;
  tax: TaxInfo;
}

export interface ConcentrationMetrics {
  totalNetWorth: number;
  employerEquityTotal: number;
  vestedEquityOnly: number;

  // Concentration percentages
  concentrationPercent: number;        // Including unvested
  vestedConcentrationPercent: number;  // Vested only

  // Risk levels
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  riskScore: number;  // 0-100

  // Human capital exposure
  humanCapitalValue: number;  // Estimated future earnings
  totalExposure: number;      // Stock + human capital
}

export interface ScenarioAnalysis {
  scenario: string;
  stockDropPercent: number;
  newEmployerEquityValue: number;
  newNetWorth: number;
  percentNetWorthLost: number;
  yearsOfSalaryLost: number;
  description: string;
}

export interface DiversificationStrategy {
  strategy: string;
  description: string;
  timeframe: string;
  taxImpact: number;
  sharesOrValueToSell: number;
  targetConcentration: number;
}

export interface HistoricalExample {
  company: string;
  event: string;
  dropPercent: number;
  yourImpact: number;
  description: string;
}

export interface CalculatorResults {
  // Core metrics
  metrics: ConcentrationMetrics;

  // Unrealized gain analysis
  unrealizedGain: number;
  taxOnFullSale: number;
  afterTaxValue: number;

  // Scenario analysis
  scenarios: ScenarioAnalysis[];

  // Historical context
  historicalExamples: HistoricalExample[];

  // Diversification strategies
  strategies: DiversificationStrategy[];

  // Key thresholds
  amountToReach10Percent: number;
  amountToReach5Percent: number;

  // Recommendations
  recommendations: string[];
  warnings: string[];

  // Risk comparison
  diversifiedPortfolioRisk: number;
  concentratedPortfolioRisk: number;
  excessRiskMultiplier: number;
}
```

```typescript
// src/lib/calculators/equity-concentration/calculations.ts
import type { CalculatorInputs, CalculatorResults, ConcentrationMetrics, ScenarioAnalysis, DiversificationStrategy, HistoricalExample } from "./types";

// State tax rates (simplified)
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.133, NY: 0.109, NJ: 0.1075, OR: 0.099, MN: 0.0985,
  WA: 0, TX: 0, FL: 0, NV: 0, TN: 0,
  // ... other states
};

// Historical drops for context
const HISTORICAL_DROPS = [
  { company: "Meta (2022)", dropPercent: 77, event: "Metaverse pivot concerns + ad revenue decline" },
  { company: "Intel (2024)", dropPercent: 60, event: "Foundry losses + layoffs" },
  { company: "Enron (2001)", dropPercent: 99, event: "Accounting fraud collapse" },
  { company: "Netflix (2022)", dropPercent: 75, event: "Subscriber loss + competition" },
  { company: "Snap (2022)", dropPercent: 85, event: "iOS privacy changes + ad slowdown" },
  { company: "Peloton (2022)", dropPercent: 90, event: "Post-pandemic demand crash" },
];

function calculateConcentrationMetrics(inputs: CalculatorInputs): ConcentrationMetrics {
  const { equity, assets, income } = inputs;

  // Total employer equity (vested + unvested + shares)
  const employerEquityTotal = equity.currentSharesValue + equity.vestedOptionsValue + equity.unvestedEquityValue;
  const vestedEquityOnly = equity.currentSharesValue + equity.vestedOptionsValue;

  // Other assets
  const otherAssets = assets.cashSavings + assets.retirementAccounts + assets.otherInvestments + assets.realEstate + assets.otherAssets;

  // Total net worth
  const totalNetWorth = employerEquityTotal + otherAssets;

  // Concentration percentages
  const concentrationPercent = totalNetWorth > 0 ? (employerEquityTotal / totalNetWorth) * 100 : 0;
  const vestedConcentrationPercent = totalNetWorth > 0 ? (vestedEquityOnly / totalNetWorth) * 100 : 0;

  // Risk level
  let riskLevel: ConcentrationMetrics['riskLevel'];
  let riskScore: number;

  if (concentrationPercent < 10) {
    riskLevel = 'low';
    riskScore = concentrationPercent * 2;
  } else if (concentrationPercent < 25) {
    riskLevel = 'moderate';
    riskScore = 20 + (concentrationPercent - 10) * 2;
  } else if (concentrationPercent < 50) {
    riskLevel = 'high';
    riskScore = 50 + (concentrationPercent - 25) * 1.5;
  } else {
    riskLevel = 'extreme';
    riskScore = Math.min(100, 75 + (concentrationPercent - 50) * 0.5);
  }

  // Human capital value (simplified: years of work remaining × salary)
  const yearsRemaining = Math.max(0, 65 - (25 + income.yearsAtCompany)); // Assume started at 25
  const humanCapitalValue = income.annualSalary * yearsRemaining * 0.5; // Discounted

  const totalExposure = employerEquityTotal + humanCapitalValue;

  return {
    totalNetWorth,
    employerEquityTotal,
    vestedEquityOnly,
    concentrationPercent,
    vestedConcentrationPercent,
    riskLevel,
    riskScore,
    humanCapitalValue,
    totalExposure,
  };
}

function generateScenarios(inputs: CalculatorInputs, metrics: ConcentrationMetrics): ScenarioAnalysis[] {
  const scenarios: ScenarioAnalysis[] = [];
  const { equity, income } = inputs;
  const employerEquity = metrics.employerEquityTotal;
  const otherAssets = metrics.totalNetWorth - employerEquity;

  const dropScenarios = [
    { percent: 20, description: "Moderate correction (earnings miss, sector rotation)" },
    { percent: 50, description: "Major decline (company issues, market crash)" },
    { percent: 75, description: "Severe crisis (fundamental business problems)" },
    { percent: 90, description: "Near-collapse (fraud, bankruptcy risk)" },
  ];

  for (const drop of dropScenarios) {
    const newEquityValue = employerEquity * (1 - drop.percent / 100);
    const newNetWorth = newEquityValue + otherAssets;
    const lostValue = metrics.totalNetWorth - newNetWorth;
    const percentLost = (lostValue / metrics.totalNetWorth) * 100;
    const yearsOfSalaryLost = lostValue / income.annualSalary;

    scenarios.push({
      scenario: `${drop.percent}% Stock Drop`,
      stockDropPercent: drop.percent,
      newEmployerEquityValue: newEquityValue,
      newNetWorth,
      percentNetWorthLost: percentLost,
      yearsOfSalaryLost,
      description: drop.description,
    });
  }

  return scenarios;
}

function generateHistoricalExamples(inputs: CalculatorInputs, metrics: ConcentrationMetrics): HistoricalExample[] {
  return HISTORICAL_DROPS.map(example => {
    const yourImpact = metrics.employerEquityTotal * (example.dropPercent / 100);

    return {
      company: example.company,
      event: example.event,
      dropPercent: example.dropPercent,
      yourImpact,
      description: `If your stock dropped like ${example.company}, you would lose $${yourImpact.toLocaleString()} (${example.dropPercent}% of your employer equity).`,
    };
  });
}

function generateStrategies(inputs: CalculatorInputs, metrics: ConcentrationMetrics): DiversificationStrategy[] {
  const { equity, tax } = inputs;
  const strategies: DiversificationStrategy[] = [];

  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const totalTaxRate = (tax.marginalTaxRate / 100) + stateRate;
  const ltcgRate = 0.238; // 20% + 3.8% NIIT

  // Calculate how much to sell to reach different concentration levels
  const otherAssets = metrics.totalNetWorth - metrics.employerEquityTotal;

  // To reach 25% concentration
  const target25 = otherAssets / 0.75 - otherAssets;
  const toSell25 = Math.max(0, metrics.employerEquityTotal - target25);

  // To reach 10% concentration
  const target10 = otherAssets / 0.90 - otherAssets;
  const toSell10 = Math.max(0, metrics.employerEquityTotal - target10);

  // To reach 5% concentration
  const target5 = otherAssets / 0.95 - otherAssets;
  const toSell5 = Math.max(0, metrics.employerEquityTotal - target5);

  // Calculate unrealized gain ratio
  const gainRatio = equity.costBasis > 0
    ? (metrics.vestedEquityOnly - equity.costBasis) / metrics.vestedEquityOnly
    : 0.8;

  if (metrics.concentrationPercent > 25) {
    strategies.push({
      strategy: "Aggressive Diversification",
      description: `Sell $${toSell25.toLocaleString()} to reach 25% concentration. Still high, but significantly reduces risk.`,
      timeframe: "6-12 months",
      taxImpact: toSell25 * gainRatio * ltcgRate,
      sharesOrValueToSell: toSell25,
      targetConcentration: 25,
    });
  }

  if (metrics.concentrationPercent > 10) {
    strategies.push({
      strategy: "Prudent Diversification",
      description: `Sell $${toSell10.toLocaleString()} to reach 10% concentration. This is the upper limit recommended by most advisors.`,
      timeframe: "1-2 years",
      taxImpact: toSell10 * gainRatio * ltcgRate,
      sharesOrValueToSell: toSell10,
      targetConcentration: 10,
    });
  }

  strategies.push({
    strategy: "Full Diversification",
    description: `Sell $${toSell5.toLocaleString()} to reach 5% concentration. Maximum diversification, typical for a well-balanced portfolio.`,
    timeframe: "2-3 years",
    taxImpact: toSell5 * gainRatio * ltcgRate,
    sharesOrValueToSell: toSell5,
    targetConcentration: 5,
  });

  // Add tax-efficient strategies
  strategies.push({
    strategy: "10b5-1 Plan",
    description: "Set up automatic, scheduled sales to diversify systematically. Helps avoid market timing and insider trading concerns.",
    timeframe: "Ongoing",
    taxImpact: 0, // Varies
    sharesOrValueToSell: 0,
    targetConcentration: 0,
  });

  strategies.push({
    strategy: "Donate Appreciated Shares",
    description: "Gift appreciated stock to charity or donor-advised fund. Avoid capital gains AND get full fair market value deduction.",
    timeframe: "Year-end",
    taxImpact: -(toSell10 * gainRatio * ltcgRate * 0.5), // Rough estimate of benefit
    sharesOrValueToSell: toSell10 * 0.2, // Assume 20% to charity
    targetConcentration: 0,
  });

  return strategies;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { equity, tax } = inputs;

  const metrics = calculateConcentrationMetrics(inputs);
  const scenarios = generateScenarios(inputs, metrics);
  const historicalExamples = generateHistoricalExamples(inputs, metrics);
  const strategies = generateStrategies(inputs, metrics);

  // Tax analysis
  const unrealizedGain = metrics.vestedEquityOnly - equity.costBasis;
  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const ltcgRate = 0.20 + 0.038 + stateRate; // Federal LTCG + NIIT + state
  const taxOnFullSale = Math.max(0, unrealizedGain * ltcgRate);
  const afterTaxValue = metrics.vestedEquityOnly - taxOnFullSale;

  // Calculate amounts to reach key thresholds
  const otherAssets = metrics.totalNetWorth - metrics.employerEquityTotal;
  const amountToReach10Percent = Math.max(0, metrics.employerEquityTotal - (otherAssets / 0.9 - otherAssets));
  const amountToReach5Percent = Math.max(0, metrics.employerEquityTotal - (otherAssets / 0.95 - otherAssets));

  // Recommendations and warnings
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (metrics.riskLevel === 'extreme') {
    warnings.push(`CRITICAL: ${metrics.concentrationPercent.toFixed(0)}% of your net worth is in one stock. This is extremely risky.`);
    recommendations.push("Consider immediate diversification. Even selling 20-30% of holdings significantly reduces risk.");
  } else if (metrics.riskLevel === 'high') {
    warnings.push(`${metrics.concentrationPercent.toFixed(0)}% concentration is high risk. Your net worth is heavily tied to one company's success.`);
    recommendations.push("Set up a systematic diversification plan. Consider a 10b5-1 plan for automatic selling.");
  } else if (metrics.riskLevel === 'moderate') {
    recommendations.push(`Your ${metrics.concentrationPercent.toFixed(0)}% concentration is elevated but manageable. Consider gradual diversification.`);
  } else {
    recommendations.push("Your concentration is within reasonable limits. Continue to monitor as you receive more equity grants.");
  }

  // Human capital warning
  if (metrics.humanCapitalValue > metrics.employerEquityTotal * 0.5) {
    warnings.push("Remember: your salary also depends on this company. Your total exposure (stock + job) is even higher than your stock position suggests.");
  }

  // Unvested equity warning
  if (equity.unvestedEquityValue > metrics.vestedEquityOnly * 0.5) {
    recommendations.push(`You have $${equity.unvestedEquityValue.toLocaleString()} in unvested equity. Don't count this as "safe"—it's at risk if you leave or are laid off.`);
  }

  // Tax-efficient selling
  if (unrealizedGain > 100000) {
    recommendations.push(`You have $${unrealizedGain.toLocaleString()} in unrealized gains. Consider tax-loss harvesting elsewhere to offset gains, or donating appreciated shares.`);
  }

  // Risk comparison (simplified)
  // Single stock volatility ~40-50% annual, diversified portfolio ~15-20%
  const diversifiedPortfolioRisk = 18;
  const concentratedPortfolioRisk = 18 + (metrics.concentrationPercent * 0.5);
  const excessRiskMultiplier = concentratedPortfolioRisk / diversifiedPortfolioRisk;

  return {
    metrics,
    unrealizedGain,
    taxOnFullSale,
    afterTaxValue,
    scenarios,
    historicalExamples,
    strategies,
    amountToReach10Percent,
    amountToReach5Percent,
    recommendations,
    warnings,
    diversifiedPortfolioRisk,
    concentratedPortfolioRisk,
    excessRiskMultiplier,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Equity Concentration Risk Assessment"
   - Subtitle: "How much of your wealth is tied to one company?"

2. **Risk Gauge** (prominent visual)
   - Large circular gauge showing concentration %
   - Color-coded zones (green/yellow/orange/red)
   - Risk level label (Low/Moderate/High/Extreme)
   - Current percentage prominently displayed

3. **Net Worth Breakdown** (pie/donut chart)
   - Employer stock (vested)
   - Employer stock (unvested)
   - Cash & savings
   - Retirement accounts
   - Other investments
   - Real estate

4. **The Double Exposure Problem** (educational)
   - Visual showing stock + job risk overlap
   - "If your company fails, you lose both"
   - Human capital value estimate

5. **Scenario Analysis Cards**
   - 4 cards showing 20%/50%/75%/90% drops
   - Dollar impact prominently displayed
   - "Years of salary lost" metric
   - Description of what causes each level of drop

6. **Historical Examples** (reality check)
   - Company cards with their historical drops
   - "Your impact if this happened" calculation
   - Link between events and drops

7. **Diversification Strategies** (action section)
   - Strategy cards with:
     - Amount to sell
     - Target concentration
     - Tax impact
     - Timeframe
   - Clear action items

8. **Tax Impact Analysis**
   - Unrealized gain calculation
   - Estimated tax on sale
   - After-tax value
   - Tax-efficient strategies

9. **Recommendations & Warnings Panel**
   - Personalized based on risk level
   - Action items with urgency indicators

10. **Why This Matters Section** (collapsible)
    - Uncompensated risk explained
    - Diversification benefits
    - "But I believe in my company" addressed

## Files to Create

```
src/
├── app/tools/equity-concentration/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/equity-concentration/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "equity-concentration",
  name: "Equity Concentration Risk Assessment",
  description: "Understand the risk of having too much wealth in employer stock",
  href: "/tools/equity-concentration",
  categoryId: "equity-compensation",
  status: "live",
  primaryColor: "#f43f5e",
  designStyle: "analytical",
  inspiredBy: ["FAANG FIRE", "White Coat Investor"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Concentration percentage calculated correctly
- [ ] Risk levels correspond to appropriate thresholds
- [ ] Scenario analysis shows realistic impacts
- [ ] Historical examples calculate correct "your impact"
- [ ] Diversification strategies show correct amounts
- [ ] Tax impact uses appropriate rates
- [ ] Recommendations change based on risk level

## Git Workflow

```bash
git checkout -b feature/app-equity-concentration
# ... build the app ...
git add .
git commit -m "Add Equity Concentration Risk Assessment"
git push -u origin feature/app-equity-concentration
```

## Do NOT

- Modify shared components
- Provide investment advice (educational only)
- Dismiss emotional attachment to employer stock
- Ignore unvested equity in calculations
- Forget the human capital double-exposure
- Make it feel judgmental—be educational
