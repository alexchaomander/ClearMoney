export type FilingStatus = "single" | "married";

export interface CalculatorInputs {
  income: number;
  filingStatus: FilingStatus;
  hasWorkplacePlan: boolean;
  traditionalIRABalance: number;
  sepIRABalance: number;
  simpleIRABalance: number;
  contributionAmount: number;
  age: number;
}

export interface EligibilityResult {
  canContributeDirectlyToRoth: boolean;
  rothPhaseOutStart: number;
  rothPhaseOutEnd: number;
  needsBackdoor: boolean;
  canDeductTraditionalIRA: boolean;
}

export interface ProRataResult {
  totalIRABalance: number;
  nonDeductibleContribution: number;
  totalAfterContribution: number;
  taxFreePercentage: number;
  taxablePercentage: number;
  taxableAmount: number;
  taxFreeAmount: number;
  hasProRataIssue: boolean;
}

export interface CalculatorResults {
  eligibility: EligibilityResult;
  proRata: ProRataResult;
  contributionLimit: number;
  catchUpEligible: boolean;
  recommendedAction:
    | "direct_roth"
    | "backdoor_clean"
    | "backdoor_with_prorata"
    | "fix_prorata_first"
    | "not_eligible";
  steps: {
    step: number;
    title: string;
    description: string;
    warning?: string;
  }[];
  taxImpact: number;
  warnings: string[];
  tips: string[];
}
