import type {
  CalculatorInputs,
  CalculatorResults,
  YearlySnapshot,
} from "./types";

/**
 * Compound growth with monthly contributions.
 *
 * Each month:
 *   balance = previousBalance * (1 + monthlyRate) + monthlyContribution
 *
 * At each year boundary we record a snapshot with cumulative contributions,
 * cumulative growth, nominal balance, and inflation-adjusted (real) balance.
 */
export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    initialInvestment,
    monthlyContribution,
    annualReturnRate,
    investmentHorizon,
    inflationRate,
  } = inputs;

  const monthlyRate = annualReturnRate / 100 / 12;
  const monthlyInflation = inflationRate / 100 / 12;
  const totalMonths = investmentHorizon * 12;

  let balance = initialInvestment;
  let totalContributions = initialInvestment;
  let cumulativeInflationFactor = 1;

  const timeline: YearlySnapshot[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    // Growth for this month (on the balance before contribution)
    const monthGrowth = balance * monthlyRate;
    balance += monthGrowth + monthlyContribution;
    totalContributions += monthlyContribution;

    // Track cumulative inflation for real-value calculation
    cumulativeInflationFactor *= 1 + monthlyInflation;

    // Record snapshot at each year boundary
    if (month % 12 === 0) {
      const year = month / 12;
      const growth = balance - totalContributions;
      const realBalance = balance / cumulativeInflationFactor;

      timeline.push({
        year,
        contributions: Math.round(totalContributions),
        growth: Math.round(growth),
        balance: Math.round(balance),
        realBalance: Math.round(realBalance),
      });
    }
  }

  const finalBalance = Math.round(balance);
  const totalGrowth = Math.round(balance - totalContributions);
  const realFinalBalance = Math.round(balance / cumulativeInflationFactor);

  // Effective annualized growth rate (CAGR) on total contributions
  const effectiveGrowthRate =
    totalContributions > 0 && investmentHorizon > 0
      ? (Math.pow(balance / totalContributions, 1 / investmentHorizon) - 1) *
        100
      : 0;

  const recommendation = buildRecommendation(
    finalBalance,
    totalContributions,
    totalGrowth,
    realFinalBalance,
    investmentHorizon,
    annualReturnRate
  );

  return {
    finalBalance,
    totalContributions: Math.round(totalContributions),
    totalGrowth,
    realFinalBalance,
    effectiveGrowthRate: Math.round(effectiveGrowthRate * 10) / 10,
    timeline,
    recommendation,
  };
}

function buildRecommendation(
  finalBalance: number,
  totalContributions: number,
  totalGrowth: number,
  realFinalBalance: number,
  horizon: number,
  returnRate: number
): string {
  const growthRatio =
    totalContributions > 0 ? totalGrowth / totalContributions : 0;
  const inflationImpact = finalBalance - realFinalBalance;
  const inflationPct =
    finalBalance > 0 ? ((inflationImpact / finalBalance) * 100).toFixed(0) : "0";

  if (horizon >= 20 && growthRatio > 1) {
    return `Over ${horizon} years at ${returnRate}% returns, compound growth contributes more than your own deposits. Your investments earn ${formatSimpleCurrency(totalGrowth)} on top of ${formatSimpleCurrency(totalContributions)} in contributions. Inflation reduces purchasing power by roughly ${inflationPct}%, bringing the real value to ${formatSimpleCurrency(realFinalBalance)}.`;
  }

  if (horizon >= 10) {
    return `With a ${horizon}-year horizon, compound interest meaningfully accelerates your savings. You contribute ${formatSimpleCurrency(totalContributions)} and earn ${formatSimpleCurrency(totalGrowth)} in growth. In today's dollars, your portfolio would be worth approximately ${formatSimpleCurrency(realFinalBalance)} after inflation (${inflationPct}% reduction).`;
  }

  return `Over ${horizon} years your portfolio grows to ${formatSimpleCurrency(finalBalance)}, of which ${formatSimpleCurrency(totalGrowth)} comes from investment returns. With a shorter time horizon, consistent contributions are the primary driver. After inflation your real purchasing power is approximately ${formatSimpleCurrency(realFinalBalance)}.`;
}

/** Simple currency formatter for use inside the pure calculation module. */
function formatSimpleCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
