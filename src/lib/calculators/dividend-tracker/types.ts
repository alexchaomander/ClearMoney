export interface CalculatorInputs {
  portfolioValue: number;
  dividendYield: number;
  monthlyContribution: number;
  dividendGrowthRate: number;
  reinvestDividends: boolean;
  monthlyExpenses: number;
  yearsToProject: number;
}

export interface YearlyProjection {
  year: number;
  portfolioValue: number;
  annualDividends: number;
  monthlyDividends: number;
  yieldOnCost: number;
  expensesCovered: number;
}

export interface CalculatorResults {
  currentAnnualDividends: number;
  currentMonthlyDividends: number;
  currentYieldOnCost: number;
  expensesCoveredNow: number;
  projections: YearlyProjection[];
  yearsToFullCoverage: number | null;
  portfolioAtFullCoverage: number | null;
  dailyCoffees: number;
  monthlyDinners: number;
  yearlyVacationBudget: number;
  milestones: {
    year: number;
    description: string;
  }[];
  recommendation: string;
}
