export type LegalEntityType = "sole_prop" | "llc" | "c_corp";
export type TaxElection = "none" | "s_corp";
export type OwnerRole = "operator" | "investor";
export type FundingPlan = "bootstrapped" | "vc" | "undecided";
export type FilingStatus = "single" | "married";
export type EquityGrantType = "options" | "restricted_stock" | "rsu";

export interface CalculatorInputs {
  annualNetIncome: number;
  ownersCount: number;
  employeesCount: number;
  legalEntityType: LegalEntityType;
  fundingPlan: FundingPlan;
  ownerRole: OwnerRole;
  marketSalary: number;
  plannedSalary: number;
  payrollAdminCosts: number;
  statePayrollTaxRate: number;
  ssWageBase: number;
  filingStatus: FilingStatus;
  priorYearTax: number;
  projectedCurrentTax: number;
  federalWithholding: number;
  estimatedPayments: number;
  currentQuarter: 1 | 2 | 3 | 4;
  entityStartDate: string;
  taxYearStartDate: string;
  taxElection: TaxElection;
  payrollCadence: "monthly" | "biweekly" | "weekly";
  businessAccounts: number;
  personalAccounts: number;
  mixedTransactionsPerMonth: number;
  reimbursementPolicy: "none" | "manual" | "accountable";
  hasEquityGrants: boolean;
  equityGrantType: EquityGrantType;
  daysSinceGrant: number;
  vestingYears: number;
  cliffMonths: number;
  strikePrice: number;
  fairMarketValue: number;
  sharesGranted: number;
  exerciseWindowMonths: number;
  isQualifiedBusiness: boolean;
  assetsAtIssuance: number;
  expectedHoldingYears: number;
}

export interface EntityRecommendation {
  recommendedLegalEntity: LegalEntityType;
  recommendedTaxElection: TaxElection;
  summary: string;
  reasons: string[];
}

export interface SCorpSavingsEstimate {
  recommendedSalary: number;
  salaryRange: { min: number; max: number };
  distributionEstimate: number;
  selfEmploymentTax: number;
  payrollTax: number;
  estimatedSavings: number;
  warnings: string[];
}

export interface PayrollPlan {
  recommendedSalary: number;
  payrollTax: number;
  distributionEstimate: number;
  guidance: string[];
}

export interface ElectionChecklist {
  deadlineDate: string;
  daysRemaining: number;
  status: "on-track" | "urgent" | "missed" | "not-applicable";
  items: string[];
}

export interface QuarterlyTaxPlan {
  safeHarborTarget: number;
  safeHarborType: "prior-year" | "current-year";
  remainingNeeded: number;
  perQuarterAmount: number;
  quartersRemaining: number;
  notes: string[];
}

export interface RetirementPlanRecommendation {
  recommendedPlan: "solo_401k" | "sep_ira" | "simple_ira" | "none";
  employeeDeferralLimit: number;
  employerContributionLimit: number;
  totalLimit: number;
  notes: string[];
}

export interface EquityChecklist {
  deadlineStatus: "on-track" | "urgent" | "missed" | "not-applicable";
  qsbsStatus: "likely" | "unknown" | "unlikely";
  items: string[];
}

export interface CalculatorResults {
  entity: EntityRecommendation;
  sCorp: SCorpSavingsEstimate;
  payrollPlan: PayrollPlan;
  electionChecklist: ElectionChecklist;
  quarterlyTaxes: QuarterlyTaxPlan;
  retirement: RetirementPlanRecommendation;
  complianceChecklist: string[];
  complianceReminders: string[];
  cashflowSeparationTips: string[];
  cashflowAlerts: string[];
  equityChecklist: EquityChecklist;
}
