import type { CalculatorInputs, CalculatorResults } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    annualFee,
    annualSpending,
    rewardsRate,
    totalCredits,
    creditUtilization,
    pointsValueCpp,
  } = inputs;

  const baseRewards = annualSpending * (rewardsRate / 100);
  const rewardsEarned = baseRewards * pointsValueCpp;
  const effectiveCredits = totalCredits * (creditUtilization / 100);
  const totalBenefits = rewardsEarned + effectiveCredits;
  const netAnnualValue = totalBenefits - annualFee;
  const cashBackComparison = annualSpending * 0.02;
  const advantageVsCashBack = netAnnualValue - cashBackComparison;

  const effectiveRateAdvantage = (rewardsRate * pointsValueCpp) / 100 - 0.02;
  let breakEvenSpending: number | null = null;

  if (effectiveRateAdvantage > 0) {
    const netFee = annualFee - effectiveCredits;
    if (netFee > 0) {
      breakEvenSpending = netFee / effectiveRateAdvantage;
    } else {
      breakEvenSpending = 0;
    }
  }

  const isWorthIt = advantageVsCashBack > 0;
  let verdict: string;

  if (advantageVsCashBack > 200) {
    verdict = "Strong value for your spending";
  } else if (advantageVsCashBack > 0) {
    verdict = "Marginally worth it";
  } else if (advantageVsCashBack > -100) {
    verdict = "Not quite worth it—consider 2% cash back";
  } else {
    verdict = "Significantly overpaying—switch to cash back";
  }

  return {
    netAnnualValue,
    rewardsEarned,
    effectiveCredits,
    totalBenefits,
    cashBackComparison,
    advantageVsCashBack,
    breakEvenSpending,
    isWorthIt,
    verdict,
  };
}
