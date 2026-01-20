export interface CreditProfile {
  estimatedScore: number;
  totalCreditLimit: number;
  currentBalance: number;
  oldestAccountYears: number;
  totalAccounts: number;
  recentInquiries: number;
  missedPayments: number;
}

export interface SimulationAction {
  type:
    | "payDownDebt"
    | "openNewCard"
    | "closeAccount"
    | "missPayment"
    | "authorizedUser";
  params: {
    amount?: number;
    creditLimit?: number;
    accountAge?: number;
  };
}

export interface FactorStatus {
  name: string;
  weight: number;
  status: "excellent" | "good" | "fair" | "poor";
  currentValue: string;
  description: string;
}

export interface SimulationResult {
  currentScore: number;
  estimatedNewScore: {
    min: number;
    max: number;
    likely: number;
  };
  change: {
    min: number;
    max: number;
    likely: number;
  };
  factors: FactorStatus[];
  actionImpacts: {
    action: string;
    impact: { min: number; max: number };
    explanation: string;
  }[];
  warnings: string[];
  recommendation: string;
}
