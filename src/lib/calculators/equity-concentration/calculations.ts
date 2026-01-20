import type {
  CalculatorInputs,
  CalculatorResults,
  ConcentrationMetrics,
  ScenarioAnalysis,
  DiversificationStrategy,
  HistoricalExample,
} from "./types";

// Tax rate constants
const FEDERAL_LTCG_RATE = 0.2;
const NIIT_RATE = 0.038;

// Age and income constants
const RETIREMENT_AGE = 65;
const WORK_START_AGE = 25;
const HUMAN_CAPITAL_DISCOUNT_FACTOR = 0.5;

// Default values for calculations
const DEFAULT_GAIN_RATIO = 0.8;
const DONATION_TAX_BENEFIT_FACTOR = 0.5;
const DONATION_PORTION = 0.2;

// Risk calculation constants
const DIVERSIFIED_PORTFOLIO_RISK = 18;
const CONCENTRATION_RISK_FACTOR = 0.5;

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05,
  AK: 0,
  AZ: 0.025,
  AR: 0.055,
  CA: 0.133,
  CO: 0.044,
  CT: 0.0699,
  DC: 0.1075,
  DE: 0.066,
  FL: 0,
  GA: 0.0575,
  HI: 0.11,
  IA: 0.039,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0315,
  KS: 0.057,
  KY: 0.045,
  LA: 0.0425,
  MA: 0.05,
  MD: 0.0575,
  ME: 0.0715,
  MI: 0.0425,
  MN: 0.0985,
  MO: 0.054,
  MS: 0.05,
  MT: 0.0675,
  NC: 0.045,
  ND: 0.029,
  NE: 0.0664,
  NH: 0,
  NJ: 0.1075,
  NM: 0.059,
  NV: 0,
  NY: 0.109,
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
  VA: 0.0575,
  VT: 0.0875,
  WA: 0,
  WI: 0.0765,
  WV: 0.065,
  WY: 0,
};

const HISTORICAL_DROPS = [
  {
    company: "Meta (2022)",
    dropPercent: 77,
    event: "Metaverse pivot concerns + ad revenue decline",
  },
  {
    company: "Intel (2024)",
    dropPercent: 60,
    event: "Foundry losses + layoffs",
  },
  {
    company: "Enron (2001)",
    dropPercent: 99,
    event: "Accounting fraud collapse",
  },
  {
    company: "Netflix (2022)",
    dropPercent: 75,
    event: "Subscriber loss + competition",
  },
  {
    company: "Snap (2022)",
    dropPercent: 85,
    event: "iOS privacy changes + ad slowdown",
  },
  {
    company: "Peloton (2022)",
    dropPercent: 90,
    event: "Post-pandemic demand crash",
  },
];

function calculateLtcgRate(stateCode: string): number {
  const stateRate = STATE_TAX_RATES[stateCode] || 0;
  return FEDERAL_LTCG_RATE + NIIT_RATE + stateRate;
}

function calculateConcentrationMetrics(inputs: CalculatorInputs): ConcentrationMetrics {
  const { equity, assets, income } = inputs;

  const employerEquityTotal =
    equity.currentSharesValue + equity.vestedOptionsValue + equity.unvestedEquityValue;
  const vestedEquityOnly = equity.currentSharesValue + equity.vestedOptionsValue;

  const otherAssets =
    assets.cashSavings +
    assets.retirementAccounts +
    assets.otherInvestments +
    assets.realEstate +
    assets.otherAssets;

  const totalNetWorth = employerEquityTotal + otherAssets;

  const concentrationPercent =
    totalNetWorth > 0 ? (employerEquityTotal / totalNetWorth) * 100 : 0;
  const vestedConcentrationPercent =
    totalNetWorth > 0 ? (vestedEquityOnly / totalNetWorth) * 100 : 0;

  let riskLevel: ConcentrationMetrics["riskLevel"];
  let riskScore: number;

  if (concentrationPercent < 10) {
    riskLevel = "low";
    riskScore = concentrationPercent * 2;
  } else if (concentrationPercent < 25) {
    riskLevel = "moderate";
    riskScore = 20 + (concentrationPercent - 10) * 2;
  } else if (concentrationPercent < 50) {
    riskLevel = "high";
    riskScore = 50 + (concentrationPercent - 25) * 1.5;
  } else {
    riskLevel = "extreme";
    riskScore = Math.min(100, 75 + (concentrationPercent - 50) * CONCENTRATION_RISK_FACTOR);
  }

  const yearsRemaining = Math.max(0, RETIREMENT_AGE - (WORK_START_AGE + income.yearsAtCompany));
  const humanCapitalValue = income.annualSalary * yearsRemaining * HUMAN_CAPITAL_DISCOUNT_FACTOR;

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

function generateScenarios(
  inputs: CalculatorInputs,
  metrics: ConcentrationMetrics
): ScenarioAnalysis[] {
  const scenarios: ScenarioAnalysis[] = [];
  const { income } = inputs;
  const employerEquity = metrics.employerEquityTotal;
  const otherAssets = metrics.totalNetWorth - employerEquity;

  const dropScenarios = [
    {
      percent: 20,
      description: "Moderate correction (earnings miss, sector rotation)",
    },
    {
      percent: 50,
      description: "Major decline (company issues, market crash)",
    },
    {
      percent: 75,
      description: "Severe crisis (fundamental business problems)",
    },
    {
      percent: 90,
      description: "Near-collapse (fraud, bankruptcy risk)",
    },
  ];

  for (const drop of dropScenarios) {
    const newEquityValue = employerEquity * (1 - drop.percent / 100);
    const newNetWorth = newEquityValue + otherAssets;
    const lostValue = metrics.totalNetWorth - newNetWorth;
    const percentLost = metrics.totalNetWorth > 0 ? (lostValue / metrics.totalNetWorth) * 100 : 0;
    const yearsOfSalaryLost = income.annualSalary > 0 ? lostValue / income.annualSalary : 0;

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

function generateHistoricalExamples(
  metrics: ConcentrationMetrics
): HistoricalExample[] {
  return HISTORICAL_DROPS.map((example) => {
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

function generateStrategies(
  inputs: CalculatorInputs,
  metrics: ConcentrationMetrics,
  ltcgRate: number
): DiversificationStrategy[] {
  const { equity } = inputs;
  const strategies: DiversificationStrategy[] = [];

  const vestedEquity = metrics.vestedEquityOnly;
  const otherAssets = metrics.totalNetWorth - metrics.employerEquityTotal;

  // Calculate raw amounts needed to reach target concentrations
  const target25 = otherAssets / 0.75 - otherAssets;
  const rawToSell25 = Math.max(0, metrics.employerEquityTotal - target25);

  const target10 = otherAssets / 0.9 - otherAssets;
  const rawToSell10 = Math.max(0, metrics.employerEquityTotal - target10);

  const target5 = otherAssets / 0.95 - otherAssets;
  const rawToSell5 = Math.max(0, metrics.employerEquityTotal - target5);

  // Cap sell targets to vested equity only (can't sell unvested shares)
  const toSell25 = Math.min(rawToSell25, vestedEquity);
  const canAchieve25 = rawToSell25 <= vestedEquity;

  const toSell10 = Math.min(rawToSell10, vestedEquity);
  const canAchieve10 = rawToSell10 <= vestedEquity;

  const toSell5 = Math.min(rawToSell5, vestedEquity);
  const canAchieve5 = rawToSell5 <= vestedEquity;

  const gainRatio =
    equity.costBasis > 0 && vestedEquity > 0
      ? (vestedEquity - equity.costBasis) / vestedEquity
      : DEFAULT_GAIN_RATIO;

  if (metrics.concentrationPercent > 25) {
    const description = canAchieve25
      ? `Sell $${toSell25.toLocaleString()} to reach 25% concentration. Still high, but significantly reduces risk.`
      : `Sell all vested equity ($${toSell25.toLocaleString()}) to reduce concentration. Target 25% is unachievable until more shares vest.`;
    strategies.push({
      strategy: "Aggressive Diversification",
      description,
      timeframe: "6-12 months",
      taxImpact: toSell25 * gainRatio * ltcgRate,
      sharesOrValueToSell: toSell25,
      targetConcentration: 25,
    });
  }

  if (metrics.concentrationPercent > 10) {
    const description = canAchieve10
      ? `Sell $${toSell10.toLocaleString()} to reach 10% concentration. This is the upper limit recommended by most advisors.`
      : `Sell all vested equity ($${toSell10.toLocaleString()}) to reduce concentration. Target 10% is unachievable until more shares vest.`;
    strategies.push({
      strategy: "Prudent Diversification",
      description,
      timeframe: "1-2 years",
      taxImpact: toSell10 * gainRatio * ltcgRate,
      sharesOrValueToSell: toSell10,
      targetConcentration: 10,
    });
  }

  const fullDiversificationDescription = canAchieve5
    ? `Sell $${toSell5.toLocaleString()} to reach 5% concentration. Maximum diversification, typical for a well-balanced portfolio.`
    : `Sell all vested equity ($${toSell5.toLocaleString()}) to reduce concentration. Target 5% is unachievable until more shares vest.`;
  strategies.push({
    strategy: "Full Diversification",
    description: fullDiversificationDescription,
    timeframe: "2-3 years",
    taxImpact: toSell5 * gainRatio * ltcgRate,
    sharesOrValueToSell: toSell5,
    targetConcentration: 5,
  });

  strategies.push({
    strategy: "10b5-1 Plan",
    description:
      "Set up automatic, scheduled sales to diversify systematically. Helps avoid market timing and insider trading concerns.",
    timeframe: "Ongoing",
    taxImpact: 0,
    sharesOrValueToSell: 0,
    targetConcentration: 0,
  });

  strategies.push({
    strategy: "Donate Appreciated Shares",
    description:
      "Gift appreciated stock to charity or donor-advised fund. Avoid capital gains AND get full fair market value deduction.",
    timeframe: "Year-end",
    taxImpact: -(toSell10 * gainRatio * ltcgRate * DONATION_TAX_BENEFIT_FACTOR),
    sharesOrValueToSell: toSell10 * DONATION_PORTION,
    targetConcentration: 0,
  });

  return strategies;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { equity, tax } = inputs;

  const metrics = calculateConcentrationMetrics(inputs);
  const scenarios = generateScenarios(inputs, metrics);
  const historicalExamples = generateHistoricalExamples(metrics);

  // Calculate LTCG rate including state tax
  const ltcgRate = calculateLtcgRate(tax.stateCode);
  const strategies = generateStrategies(inputs, metrics, ltcgRate);

  const unrealizedGain = metrics.vestedEquityOnly - equity.costBasis;
  const taxOnFullSale = Math.max(0, unrealizedGain * ltcgRate);
  const afterTaxValue = metrics.vestedEquityOnly - taxOnFullSale;

  const otherAssets = metrics.totalNetWorth - metrics.employerEquityTotal;
  // Cap amounts to vested equity (can't sell unvested shares)
  const rawAmountToReach10Percent = Math.max(
    0,
    metrics.employerEquityTotal - (otherAssets / 0.9 - otherAssets)
  );
  const amountToReach10Percent = Math.min(rawAmountToReach10Percent, metrics.vestedEquityOnly);

  const rawAmountToReach5Percent = Math.max(
    0,
    metrics.employerEquityTotal - (otherAssets / 0.95 - otherAssets)
  );
  const amountToReach5Percent = Math.min(rawAmountToReach5Percent, metrics.vestedEquityOnly);

  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (metrics.riskLevel === "extreme") {
    warnings.push(
      `CRITICAL: ${metrics.concentrationPercent.toFixed(
        0
      )}% of your net worth is in one stock. This is extremely risky.`
    );
    recommendations.push(
      "Consider immediate diversification. Even selling 20-30% of holdings significantly reduces risk."
    );
  } else if (metrics.riskLevel === "high") {
    warnings.push(
      `${metrics.concentrationPercent.toFixed(
        0
      )}% concentration is high risk. Your net worth is heavily tied to one company's success.`
    );
    recommendations.push(
      "Set up a systematic diversification plan. Consider a 10b5-1 plan for automatic selling."
    );
  } else if (metrics.riskLevel === "moderate") {
    recommendations.push(
      `Your ${metrics.concentrationPercent.toFixed(
        0
      )}% concentration is elevated but manageable. Consider gradual diversification.`
    );
  } else {
    recommendations.push(
      "Your concentration is within reasonable limits. Continue to monitor as you receive more equity grants."
    );
  }

  if (metrics.humanCapitalValue > metrics.employerEquityTotal * HUMAN_CAPITAL_DISCOUNT_FACTOR) {
    warnings.push(
      "Remember: your salary also depends on this company. Your total exposure (stock + job) is even higher than your stock position suggests."
    );
  }

  if (equity.unvestedEquityValue > metrics.vestedEquityOnly * HUMAN_CAPITAL_DISCOUNT_FACTOR) {
    recommendations.push(
      `You have $${equity.unvestedEquityValue.toLocaleString()} in unvested equity. Don't count this as "safe"—it's at risk if you leave or are laid off.`
    );
  }

  if (unrealizedGain > 100000) {
    recommendations.push(
      `You have $${unrealizedGain.toLocaleString()} in unrealized gains. Consider tax-loss harvesting elsewhere to offset gains, or donating appreciated shares.`
    );
  }

  const diversifiedPortfolioRisk = DIVERSIFIED_PORTFOLIO_RISK;
  const concentratedPortfolioRisk = DIVERSIFIED_PORTFOLIO_RISK + metrics.concentrationPercent * CONCENTRATION_RISK_FACTOR;
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
