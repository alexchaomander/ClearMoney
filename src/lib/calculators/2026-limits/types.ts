export type FilingStatus = "single" | "married" | "head_of_household";
export type HSACoverageType = "self" | "family";

export interface LimitsInputs {
  age: number;
  filingStatus: FilingStatus;
  annualIncome: number;
  accounts: {
    has401k: boolean;
    hasTraditionalIRA: boolean;
    hasRothIRA: boolean;
    hasHSA: boolean;
    hsaCoverageType: HSACoverageType;
    hasFSA: boolean;
    hasSimpleIRA: boolean;
    has403b: boolean;
    has457b: boolean;
    hasSolo401k: boolean;
    hasSepIRA: boolean;
  };
}

export interface IncomePhaseOut {
  startPhaseOut: number;
  completePhaseOut: number;
  yourStatus: "full" | "reduced" | "none";
}

export interface ContributionLimit {
  accountType: string;
  baseLimit: number;
  catchUpLimit: number;
  totalLimit: number;
  yourLimit: number;
  monthlyToMax: number;
  notes: string[];
  incomePhaseOut?: IncomePhaseOut;
}

export interface YearOverYearChange {
  accountType: string;
  limit2025: number;
  limit2026: number;
  change: number;
  percentChange: number;
}

export interface LimitsResults {
  limits: {
    retirement: ContributionLimit[];
    health: ContributionLimit[];
    education: ContributionLimit[];
  };
  totalMaxContributions: number;
  monthlyToMaxAll: number;
  keyDates: { date: string; description: string }[];
  yearOverYear: YearOverYearChange[];
  personalizedStrategy: string[];
}

export interface ReferenceLimit {
  accountType: string;
  baseLimit: number;
  catchUp50?: number | null;
  catchUp60?: number | null;
  notes?: string;
}

export interface ReferenceLimitsByCategory {
  retirement: ReferenceLimit[];
  health: ReferenceLimit[];
  education: ReferenceLimit[];
}
