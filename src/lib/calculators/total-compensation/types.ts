export type VestingSchedule = "standard" | "amazon" | "cliff_monthly";

export interface RSUGrant {
  totalValue: number;
  vestingSchedule: VestingSchedule;
  vestingYears: number;
  grantPrice: number;
  currentPrice: number;
}

export interface CalculatorInputs {
  baseSalary: number;
  targetBonus: number;
  expectedBonusMultiplier: number;
  rsuGrant: RSUGrant;
  signOnBonus: number;
  signOnVestingYears: number;
  match401k: number;
  match401kLimit: number;
  esppDiscount: number;
  esppContribution: number;
  hsaContribution: number;
  annualRefresher: number;
  refresherVestingYears: number;
}

export interface YearlyBreakdown {
  year: number;
  baseSalary: number;
  bonus: number;
  rsuValue: number;
  signOnPortion: number;
  match401k: number;
  esppBenefit: number;
  hsaContribution: number;
  refresherValue: number;
  totalCompensation: number;
}

export interface CalculatorResults {
  year1Total: number;
  year2Total: number;
  year3Total: number;
  year4Total: number;
  averageAnnual: number;
  yearlyBreakdowns: YearlyBreakdown[];
  totalBase: number;
  totalBonus: number;
  totalRSU: number;
  totalSignOn: number;
  totalBenefits: number;
  rsuPercentOfComp: number;
  year1VsYear4Difference: number;
  effectiveHourlyRate: number;
  warnings: string[];
}
