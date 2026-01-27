export interface CalculatorInputs {
  annualIncome: number;
  annualExpenses: number;
  currentSavings: number;
  expectedReturn: number;
  withdrawalRate: number;
}

export interface YearlySnapshot {
  year: number;
  age?: number;
  savings: number;
  contribution: number;
  growth: number;
  totalSavings: number;
  progress: number;
}

export interface CalculatorResults {
  savingsRate: number;
  annualSavings: number;
  fireNumber: number;
  yearsToFI: number;
  timeline: YearlySnapshot[];
  leanFireNumber: number;
  fatFireNumber: number;
  coastFireNumber: number;
  coastFireYears: number;
  monthsOfRunway: number;
  percentToFI: number;
  recommendation: string;
}
