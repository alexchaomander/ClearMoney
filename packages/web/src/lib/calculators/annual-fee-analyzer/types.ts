export interface CalculatorInputs {
  annualFee: number;
  annualSpending: number;
  rewardsRate: number;
  totalCredits: number;
  creditUtilization: number;
  pointsValueCpp: number;
}

export interface CalculatorResults {
  netAnnualValue: number;
  rewardsEarned: number;
  effectiveCredits: number;
  totalBenefits: number;
  cashBackComparison: number;
  advantageVsCashBack: number;
  breakEvenSpending: number | null;
  isWorthIt: boolean;
  verdict: string;
}
