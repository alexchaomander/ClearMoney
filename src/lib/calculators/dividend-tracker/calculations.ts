import type {
  CalculatorInputs,
  CalculatorResults,
  YearlyProjection,
} from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    portfolioValue,
    dividendYield,
    monthlyContribution,
    dividendGrowthRate,
    reinvestDividends,
    monthlyExpenses,
    yearsToProject,
  } = inputs;

  const yieldRate = dividendYield / 100;
  const growthRate = dividendGrowthRate / 100;
  const annualContribution = monthlyContribution * 12;
  const annualExpenses = monthlyExpenses * 12;

  const totalContributed = portfolioValue;
  const currentAnnualDividends = portfolioValue * yieldRate;
  const currentMonthlyDividends = currentAnnualDividends / 12;
  const currentYieldOnCost =
    totalContributed > 0 ? (currentAnnualDividends / totalContributed) * 100 : 0;
  const expensesCoveredNow =
    annualExpenses > 0 ? (currentAnnualDividends / annualExpenses) * 100 : 100;

  const projections: YearlyProjection[] = [];
  let portfolio = portfolioValue;
  let contributed = portfolioValue;
  let currentYield = yieldRate;
  let yearsToFullCoverage: number | null = null;
  let portfolioAtFullCoverage: number | null = null;

  const milestones: { year: number; description: string }[] = [];
  let lastCoverageLevel = 0;

  for (let year = 0; year <= yearsToProject; year += 1) {
    const annualDividends = portfolio * currentYield;
    const monthlyDividends = annualDividends / 12;
    const yieldOnCost =
      contributed > 0 ? (annualDividends / contributed) * 100 : 0;
    const expensesCovered =
      annualExpenses > 0 ? (annualDividends / annualExpenses) * 100 : 100;

    projections.push({
      year,
      portfolioValue: Math.round(portfolio),
      annualDividends: Math.round(annualDividends),
      monthlyDividends: Math.round(monthlyDividends),
      yieldOnCost: Math.round(yieldOnCost * 10) / 10,
      expensesCovered: Math.round(expensesCovered * 10) / 10,
    });

    if (expensesCovered >= 25 && lastCoverageLevel < 25) {
      milestones.push({
        year,
        description: "25% of expenses covered by dividends!",
      });
    }
    if (expensesCovered >= 50 && lastCoverageLevel < 50) {
      milestones.push({
        year,
        description: "50% of expenses covered - halfway there!",
      });
    }
    if (expensesCovered >= 75 && lastCoverageLevel < 75) {
      milestones.push({
        year,
        description: "75% of expenses covered!",
      });
    }
    if (expensesCovered >= 100 && yearsToFullCoverage === null) {
      yearsToFullCoverage = year;
      portfolioAtFullCoverage = portfolio;
      milestones.push({
        year,
        description:
          "100% - Financial Independence from dividends!",
      });
    }
    lastCoverageLevel = expensesCovered;

    if (year < yearsToProject) {
      portfolio += annualContribution;
      contributed += annualContribution;

      if (reinvestDividends) {
        portfolio += annualDividends;
      }

      portfolio *= 1.05;
      currentYield *= 1 + growthRate;
    }
  }

  const dailyCoffees = Math.floor(currentMonthlyDividends / 5);
  const monthlyDinners = Math.floor(currentMonthlyDividends / 50);
  const yearlyVacationBudget = Math.round(currentAnnualDividends);

  let recommendation: string;
  if (expensesCoveredNow >= 100) {
    recommendation =
      "Congratulations! Your dividends cover your expenses. You've achieved dividend independence!";
  } else if (yearsToFullCoverage !== null && yearsToFullCoverage <= 10) {
    recommendation = `You're on track! At this rate, dividends will cover expenses in ${yearsToFullCoverage} years.`;
  } else if (yearsToFullCoverage !== null) {
    recommendation = `${yearsToFullCoverage} years to full coverage. Consider increasing contributions to speed this up.`;
  } else {
    recommendation =
      "Building dividend income takes time. Focus on consistent contributions and let compounding work.";
  }

  return {
    currentAnnualDividends: Math.round(currentAnnualDividends),
    currentMonthlyDividends: Math.round(currentMonthlyDividends),
    currentYieldOnCost: Math.round(currentYieldOnCost * 10) / 10,
    expensesCoveredNow: Math.round(expensesCoveredNow * 10) / 10,
    projections,
    yearsToFullCoverage,
    portfolioAtFullCoverage: portfolioAtFullCoverage
      ? Math.round(portfolioAtFullCoverage)
      : null,
    dailyCoffees,
    monthlyDinners,
    yearlyVacationBudget,
    milestones,
    recommendation,
  };
}
