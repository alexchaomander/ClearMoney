export interface CalculatorInputs {
  goalAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number; // percentage, e.g. 5
}

export interface MilestonePoint {
  month: number;
  balance: number;
  percentComplete: number;
}

export interface CalculatorResults {
  monthsToGoal: number;
  totalContributions: number;
  totalInterestEarned: number;
  targetDate: Date;
  milestones: MilestonePoint[]; // 25%, 50%, 75%, 100%
  monthlyNeededIfNoReturn: number;
  recommendation: string;
}
