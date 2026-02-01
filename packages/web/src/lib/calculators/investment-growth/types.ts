export interface CalculatorInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturnRate: number; // percentage, e.g. 7
  investmentHorizon: number; // years
  inflationRate: number; // percentage, e.g. 3
}

export interface YearlySnapshot {
  year: number;
  contributions: number;
  growth: number;
  balance: number;
  realBalance: number; // inflation-adjusted
}

export interface CalculatorResults {
  finalBalance: number;
  totalContributions: number;
  totalGrowth: number;
  realFinalBalance: number;
  effectiveGrowthRate: number;
  timeline: YearlySnapshot[];
  recommendation: string;
}
