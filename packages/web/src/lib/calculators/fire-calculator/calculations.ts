import type { CalculatorInputs, CalculatorResults, YearlySnapshot } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    annualIncome,
    annualExpenses,
    currentSavings,
    expectedReturn,
    withdrawalRate,
  } = inputs;

  const returnRate = expectedReturn / 100;
  const withdrawRate = withdrawalRate / 100;

  const annualSavings = annualIncome - annualExpenses;
  const savingsRate =
    annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

  const baseFireNumber =
    withdrawRate > 0 ? annualExpenses / withdrawRate : Infinity;
  const fireNumber = annualExpenses <= 0 ? 0 : baseFireNumber;
  const leanFireNumber =
    annualExpenses <= 0 ? 0 : (annualExpenses * 0.8) / withdrawRate;
  const fatFireNumber =
    annualExpenses <= 0 ? 0 : (annualExpenses * 1.2) / withdrawRate;

  const yearsToFI = calculateYearsToTarget(
    currentSavings,
    annualSavings,
    returnRate,
    fireNumber
  );

  const timelineYears = Number.isFinite(yearsToFI)
    ? Math.max(10, Math.min(60, Math.ceil(yearsToFI) + 5))
    : 30;
  const timeline = generateTimeline(
    currentSavings,
    annualSavings,
    returnRate,
    fireNumber,
    timelineYears
  );

  const coastFireYears = 30;
  const coastFireNumber =
    fireNumber === 0 ? 0 : fireNumber / Math.pow(1 + returnRate, coastFireYears);
  const yearsToCoastFI = calculateYearsToTarget(
    currentSavings,
    annualSavings,
    returnRate,
    coastFireNumber
  );

  const percentToFI = fireNumber === 0 ? 100 : (currentSavings / fireNumber) * 100;
  const monthsOfRunway =
    annualExpenses > 0 ? (currentSavings / annualExpenses) * 12 : Infinity;

  let recommendation: string;
  if (savingsRate >= 50) {
    recommendation = `Impressive ${savingsRate.toFixed(0)}% savings rate! You're on the fast track to FI in ${yearsToFI.toFixed(1)} years.`;
  } else if (savingsRate >= 25) {
    recommendation = `Solid ${savingsRate.toFixed(0)}% savings rate. FI in ${yearsToFI.toFixed(1)} years. Can you push it higher?`;
  } else if (savingsRate >= 10) {
    recommendation = `${savingsRate.toFixed(0)}% savings rate puts you on a traditional retirement path. Increasing it could dramatically accelerate your timeline.`;
  } else if (savingsRate > 0) {
    recommendation = `At ${savingsRate.toFixed(0)}% savings rate, focus on increasing income or reducing expenses to make real progress.`;
  } else if (annualSavings < 0) {
    recommendation =
      "You're currently spending more than you earn. Focus on closing that gap before thinking about FI.";
  } else {
    recommendation =
      "Set a savings goal to get clarity on how quickly you can reach financial independence.";
  }

  return {
    savingsRate,
    annualSavings,
    fireNumber,
    yearsToFI,
    timeline,
    leanFireNumber,
    fatFireNumber,
    coastFireNumber,
    coastFireYears: yearsToCoastFI,
    monthsOfRunway,
    percentToFI,
    recommendation,
  };
}

export function calculateYearsToTarget(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  targetAmount: number
): number {
  if (targetAmount <= 0) return 0;
  if (currentSavings >= targetAmount) return 0;
  if (annualSavings <= 0 && currentSavings < targetAmount) return Infinity;

  let savings = currentSavings;
  let years = 0;
  const maxYears = 100;

  while (savings < targetAmount && years < maxYears) {
    savings = savings * (1 + returnRate) + annualSavings;
    years++;
  }

  if (years > 0 && savings >= targetAmount) {
    const prevSavings = (savings - annualSavings) / (1 + returnRate);
    const overshoot = savings - targetAmount;
    const yearGrowth = savings - prevSavings;
    years -= overshoot / yearGrowth;
  }

  return Math.max(0, years);
}

function generateTimeline(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  fireNumber: number,
  years: number
): YearlySnapshot[] {
  const timeline: YearlySnapshot[] = [];
  let savings = currentSavings;

  for (let year = 0; year <= years; year++) {
    const growth = year === 0 ? 0 : savings * returnRate;
    const contribution = year === 0 ? 0 : annualSavings;
    const totalSavings = savings + growth + contribution;
    const progress = fireNumber === 0 ? 100 : (totalSavings / fireNumber) * 100;

    timeline.push({
      year,
      savings: Math.round(savings),
      contribution: Math.round(contribution),
      growth: Math.round(growth),
      totalSavings: Math.round(totalSavings),
      progress: Math.min(100, progress),
    });

    savings = totalSavings;
  }

  return timeline;
}
