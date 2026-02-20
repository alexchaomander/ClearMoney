export type WorkspaceMode = "individual" | "advisor";

export type FilingStatus = "single" | "married" | "head_of_household";

export interface WorkspaceInputs {
  mode: WorkspaceMode;
  clientName: string;
  filingStatus: FilingStatus;
  stateCode: string;
  wagesIncome: number;
  otherOrdinaryIncome: number;
  shortTermGains: number;
  longTermGains: number;
  currentWithholding: number;
  hsaRemainingRoom: number;
  pretax401kRemainingRoom: number;
  harvestableLosses: number;
  donationAmount: number;
  quarterlyPaymentsMade: number;
  strategies: {
    hsa: boolean;
    pretax401k: boolean;
    lossHarvesting: boolean;
    donationBunching: boolean;
  };
}

export interface StrategyImpact {
  id: "hsa" | "pretax401k" | "lossHarvesting" | "donationBunching";
  title: string;
  savings: number;
  confidence: "high" | "medium" | "low";
  detail: string;
  assumptions: string[];
}

export interface TaxPlanResults {
  baselineTax: number;
  projectedTax: number;
  estimatedSavings: number;
  withholdingGap: number;
  safeHarborTarget: number;
  safeHarborGap: number;
  confidenceScore: number;
  confidenceLabel: "High" | "Medium" | "Low";
  strategyImpacts: StrategyImpact[];
  topActions: Array<{
    key: string;
    title: string;
    priority: "High" | "Medium";
    owner: "Client" | "Advisor";
    detail: string;
  }>;
  advisorBrief: string;
}

export interface SavedTaxPlanSnapshot {
  id: string;
  savedAt: string;
  label: string;
  inputs: WorkspaceInputs;
}
