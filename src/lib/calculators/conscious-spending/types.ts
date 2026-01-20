export interface CalculatorInputs {
  monthlyIncome: number;
  fixedCosts: number;
  investments: number;
  savings: number;
  guiltFree: number;
  moneyDials?: string[];
}

export interface CategoryAnalysis {
  name: string;
  amount: number;
  percentage: number;
  targetMin: number;
  targetMax: number;
  status: "under" | "good" | "over";
  recommendation: string;
}

export interface CalculatorResults {
  totalAllocated: number;
  unallocated: number;
  categories: CategoryAnalysis[];
  isBalanced: boolean;
  overallStatus: "needs-work" | "almost-there" | "great";
  primaryIssue: string | null;
  suggestions: string[];
  guiltFreeDaily: number;
  guiltFreeWeekly: number;
}
