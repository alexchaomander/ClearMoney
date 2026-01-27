export type LoanType = "direct" | "ffel" | "perkins" | "parent_plus";

export type FilingStatus = "single" | "married" | "head_of_household";

export interface CalculatorInputs {
  loanBalance: number;
  interestRate: number;
  loanType: LoanType;
  annualIncome: number;
  incomeGrowthRate: number;
  filingStatus: FilingStatus;
  familySize: number;
  state: string;
  yearsInRepayment: number;
  pslfEligible: boolean;
  pslfPaymentsMade: number;
  hasParentPlus: boolean;
}

export interface BreakdownItem {
  label: string;
  value: number;
}

export interface RepaymentPlan {
  name: string;
  available: boolean;
  availableUntil?: string;
  availableFrom?: string;
  monthlyPaymentYear1: number;
  monthlyPaymentFinal: number;
  totalPaid: number;
  totalInterestPaid: number;
  forgivenessAmount: number;
  forgivenessYear: number | null;
  taxOnForgiveness: number;
  netCost: number;
  notes?: string[];
}

export interface PSLFAnalysis {
  eligible: boolean;
  paymentsRemaining: number;
  estimatedForgivenessDate: Date | null;
  estimatedForgivenessAmount: number;
  taxFree: boolean;
}

export interface Recommendation {
  bestPlan: string;
  reasoning: string;
  keyDeadlines: { date: string; action: string }[];
  warnings: string[];
}

export interface CalculatorResults {
  plans: Record<string, RepaymentPlan>;
  pslfAnalysis?: PSLFAnalysis;
  recommendation: Recommendation;
}
