export type UsageFrequency = "daily" | "weekly" | "monthly" | "rarely" | "never";
export type Recommendation = "keep" | "review" | "cancel";

export interface SubscriptionInput {
  name: string;
  monthlyCost: number;
  category: string;
  usageFrequency: UsageFrequency;
  satisfaction: number; // 1-5
}

export interface CalculatorInputs {
  subscriptions: SubscriptionInput[];
  monthlyIncome: number;
}

export interface ScoredSubscription {
  name: string;
  monthlyCost: number;
  annualCost: number;
  category: string;
  usageFrequency: UsageFrequency;
  satisfaction: number;
  roiScore: number;
  recommendation: Recommendation;
  reason: string;
}

export interface CategoryBreakdown {
  category: string;
  monthlyCost: number;
  annualCost: number;
  count: number;
}

export interface CalculatorResults {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  percentOfIncome: number;
  scoredSubscriptions: ScoredSubscription[];
  categoryBreakdown: CategoryBreakdown[];
  annualSavingsIfCancelled: number;
  overallHealthScore: number;
  recommendation: string;
}
