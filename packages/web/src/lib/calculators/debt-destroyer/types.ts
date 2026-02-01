export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // Annual rate as percentage (e.g., 18.5)
  minimumPayment: number;
}

export interface CalculatorInputs {
  debts: DebtItem[];
  monthlyExtraPayment: number;
}

export interface MonthlySnapshot {
  month: number;
  debts: { id: string; balance: number; paid: number }[];
  totalBalance: number;
  totalInterestPaid: number;
}

export interface PayoffResult {
  method: "snowball" | "avalanche";
  totalInterest: number;
  monthsToPayoff: number;
  payoffDate: Date;
  timeline: MonthlySnapshot[];
  debtsPaidOrder: string[]; // IDs of debts in order of payoff
}

export interface ComparisonResult {
  snowball: PayoffResult;
  avalanche: PayoffResult;
  interestSaved: number; // Difference between methods
  timeSaved: number; // Difference in months
  motivationCost: number; // Extra interest paid by choosing snowball
}