import { LIMITS_2026 } from "../2026-limits/constants";
import type {
  CalculatorInputs,
  CalculatorResults,
  EntityRecommendation,
  EquityChecklist,
  ElectionChecklist,
  RetirementPlanRecommendation,
  SCorpSavingsEstimate,
  QuarterlyTaxPlan,
} from "./types";

const SOCIAL_SECURITY_RATE = 0.124;
const MEDICARE_RATE = 0.029;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const SE_EARNINGS_MULTIPLIER = 0.9235;
const ADDITIONAL_MEDICARE_THRESHOLD = {
  single: 200000,
  married: 250000,
};

// Magic Numbers Constants
const SALARY_MIN_MULTIPLIER_OPERATOR = 0.6;
const SALARY_MIN_MULTIPLIER_INVESTOR = 0.4;
const SALARY_MAX_MULTIPLIER = 1.1;

const HIGH_INCOME_THRESHOLD_SINGLE = 200000;
const HIGH_INCOME_THRESHOLD_MARRIED = 250000;
const SAFE_HARBOR_RATE_HIGH_INCOME = 1.1;
const SAFE_HARBOR_RATE_STANDARD = 1.0;
const PROJECTED_TAX_SAFE_HARBOR = 0.9;

const QSBS_ASSET_LIMIT = 50000000;
const QSBS_HOLDING_PERIOD_YEARS = 5;

const DAYS_IN_MS = 1000 * 60 * 60 * 24;

const COMPLIANCE_CHECKLIST = [
  "Form 2553 election (if choosing S-Corp status)",
  "Payroll setup (W-2 + withholdings)",
  "Quarterly payroll reports and state filings",
  "Annual 1120-S filing + Schedule K-1",
  "State annual report + franchise tax",
  "Issue 1099s to contractors by Jan 31",
  "Maintain corporate records + cap table updates",
];

const COMPLIANCE_REMINDERS = [
  "Set calendar reminders for Form 2553 and payroll deadlines.",
  "Store EIN, operating agreement, and state registration docs in a vault.",
  "Archive payroll reports and K-1s with your year-end close checklist.",
  "Log board minutes and equity issuances after every funding round.",
];

const CASHFLOW_TIPS = [
  "Separate business and personal accounts to avoid commingling.",
  "Pay yourself on a consistent payroll cadence (monthly or biweekly).",
  "Use reimbursements or accountable plans for personal expenses.",
  "Set aside tax reserves in a dedicated savings account.",
];

export function calculate(
  inputs: CalculatorInputs,
  referenceDate: Date = new Date()
): CalculatorResults {
  const entity = buildEntityRecommendation(inputs);
  const sCorp = buildSCorpEstimate(inputs);
  const electionChecklist = buildElectionChecklist(inputs, referenceDate);
  const payrollPlan = {
    recommendedSalary: sCorp.recommendedSalary,
    payrollTax: sCorp.payrollTax,
    distributionEstimate: sCorp.distributionEstimate,
    guidance: buildPayrollGuidance(inputs, sCorp),
  };
  const quarterlyTaxes = buildQuarterlyPlan(inputs);
  const retirement = buildRetirementPlan(inputs);
  const cashflowAlerts = buildCashflowAlerts(inputs);
  const equityChecklist = buildEquityChecklist(inputs);

  return {
    entity,
    sCorp,
    payrollPlan,
    electionChecklist,
    quarterlyTaxes,
    retirement,
    complianceChecklist: COMPLIANCE_CHECKLIST,
    complianceReminders: COMPLIANCE_REMINDERS,
    cashflowSeparationTips: CASHFLOW_TIPS,
    cashflowAlerts,
    equityChecklist,
  };
}

function buildEntityRecommendation(inputs: CalculatorInputs): EntityRecommendation {
  const reasons: string[] = [];
  let recommendedLegalEntity: EntityRecommendation["recommendedLegalEntity"] = "llc";
  let recommendedTaxElection: EntityRecommendation["recommendedTaxElection"] = "none";

  if (inputs.fundingPlan === "vc") {
    recommendedLegalEntity = "c_corp";
    recommendedTaxElection = "none";
    reasons.push("VC funding typically requires a C-Corp for equity issuance.");
  } else if (inputs.annualNetIncome >= 80000 && inputs.ownerRole === "operator") {
    recommendedLegalEntity = "llc";
    recommendedTaxElection = "s_corp";
    reasons.push("S-Corp election can reduce payroll taxes for active owner-operators.");
  } else if (inputs.ownersCount > 1) {
    recommendedLegalEntity = "llc";
    recommendedTaxElection = "none";
    reasons.push("Multi-member LLCs keep pass-through flexibility.");
  } else {
    recommendedLegalEntity = "llc";
    recommendedTaxElection = "none";
    reasons.push("LLC provides liability protection with lighter admin burden.");
  }

  if (inputs.legalEntityType === recommendedLegalEntity) {
    reasons.push("Your current legal entity already matches this recommendation.");
  }
  if (inputs.taxElection === recommendedTaxElection) {
    reasons.push("Your current tax election already matches this recommendation.");
  }

  let summary: string;
  if (recommendedLegalEntity === "c_corp") {
    summary = "C-Corp is the standard for VC-backed startups and QSBS eligibility.";
  } else if (recommendedTaxElection === "s_corp") {
    summary =
      "LLC + S-Corp election can lower self-employment tax with reasonable compensation.";
  } else {
    summary = "LLC keeps flexibility while reducing personal liability.";
  }

  return {
    recommendedLegalEntity,
    recommendedTaxElection,
    summary,
    reasons,
  };
}

function buildSCorpEstimate(inputs: CalculatorInputs): SCorpSavingsEstimate {
  const minSalary =
    inputs.marketSalary *
    (inputs.ownerRole === "operator"
      ? SALARY_MIN_MULTIPLIER_OPERATOR
      : SALARY_MIN_MULTIPLIER_INVESTOR);
  const maxSalary = inputs.marketSalary * SALARY_MAX_MULTIPLIER;
  const recommendedSalary = clamp(inputs.plannedSalary, minSalary, maxSalary);

  const distributionEstimate = Math.max(0, inputs.annualNetIncome - recommendedSalary);

  const selfEmploymentTax = calculateSelfEmploymentTax(
    inputs.annualNetIncome,
    inputs.ssWageBase,
    inputs.filingStatus
  );

  const payrollTax = calculatePayrollTax(
    recommendedSalary,
    inputs.ssWageBase,
    inputs.filingStatus,
    inputs.statePayrollTaxRate
  );

  const estimatedSavings =
    selfEmploymentTax - payrollTax - inputs.payrollAdminCosts;

  const warnings: string[] = [];
  if (inputs.plannedSalary < minSalary) {
    warnings.push("Planned salary is below the reasonable compensation range.");
  }
  if (distributionEstimate <= 0) {
    warnings.push("No distributions available after salary allocation.");
  }
  if (estimatedSavings <= 0) {
    warnings.push("Estimated savings may not offset payroll/admin costs.");
  }

  return {
    recommendedSalary,
    salaryRange: { min: minSalary, max: maxSalary },
    distributionEstimate,
    selfEmploymentTax,
    payrollTax,
    estimatedSavings,
    warnings,
  };
}

function calculateSelfEmploymentTax(
  income: number,
  wageBase: number,
  filingStatus: CalculatorInputs["filingStatus"]
): number {
  // SE tax applies to 92.35% of net earnings (approx). This is intentionally
  // simplified and does not model the income-tax deduction for 1/2 SE tax.
  const seEarnings = income * SE_EARNINGS_MULTIPLIER;
  const ssTax = Math.min(seEarnings, wageBase) * SOCIAL_SECURITY_RATE;
  const medicareTax = seEarnings * MEDICARE_RATE;
  const threshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const additionalMedicare =
    Math.max(0, seEarnings - threshold) * ADDITIONAL_MEDICARE_RATE;
  return ssTax + medicareTax + additionalMedicare;
}

function calculatePayrollTax(
  wageBaseIncome: number,
  wageBaseCap: number,
  filingStatus: CalculatorInputs["filingStatus"],
  statePayrollTaxRate: number
): number {
  const ssTax = Math.min(wageBaseIncome, wageBaseCap) * SOCIAL_SECURITY_RATE;
  const medicareTax = wageBaseIncome * MEDICARE_RATE;
  const threshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const additionalMedicare =
    Math.max(0, wageBaseIncome - threshold) * ADDITIONAL_MEDICARE_RATE;
  const statePayrollTax = wageBaseIncome * (statePayrollTaxRate / 100);
  return ssTax + medicareTax + additionalMedicare + statePayrollTax;
}

function buildPayrollGuidance(
  inputs: CalculatorInputs,
  sCorp: SCorpSavingsEstimate
): string[] {
  const guidance = [
    "Run payroll consistently (monthly or biweekly) to document wages.",
    "Document reasonable compensation with market comps and role details.",
  ];

  if (inputs.ownerRole === "operator") {
    guidance.push("Operator-owners should prioritize salary before distributions.");
  }

  if (sCorp.estimatedSavings <= 0) {
    guidance.push("Consider staying pass-through if payroll costs exceed savings.");
  }

  return guidance;
}

function buildElectionChecklist(
  inputs: CalculatorInputs,
  referenceDate: Date
): ElectionChecklist {
  if (inputs.taxElection !== "s_corp") {
    return {
      deadlineDate: "",
      daysRemaining: 0,
      status: "not-applicable",
      items: ["S-Corp election not selected."],
    };
  }

  const baseDate =
    parseDateOnly(inputs.taxYearStartDate || inputs.entityStartDate) ??
    toUtcDateOnly(referenceDate);
  const deadlineDate = addMonthsAndDaysUtc(baseDate, 2, 15);
  const referenceDay = toUtcDateOnly(referenceDate);
  const daysRemaining = Math.ceil(
    (deadlineDate.getTime() - referenceDay.getTime()) / DAYS_IN_MS
  );

  let status: ElectionChecklist["status"] = "on-track";
  if (daysRemaining < 0) {
    status = "missed";
  } else if (daysRemaining <= 7) {
    status = "urgent";
  }

  return {
    deadlineDate: formatDateOnly(deadlineDate),
    daysRemaining,
    status,
    items: [
      "File Form 2553 with signatures from all shareholders.",
      "Confirm eligibility (one class of stock, <= 100 shareholders).",
      "Set payroll start date before first distribution.",
      "Document reasonable compensation methodology.",
      "Store acceptance letter with entity records.",
    ],
  };
}

function buildQuarterlyPlan(inputs: CalculatorInputs): QuarterlyTaxPlan {
  const highIncomeThreshold =
    inputs.filingStatus === "married"
      ? HIGH_INCOME_THRESHOLD_MARRIED
      : HIGH_INCOME_THRESHOLD_SINGLE;
  const safeHarborRate =
    inputs.annualNetIncome >= highIncomeThreshold
      ? SAFE_HARBOR_RATE_HIGH_INCOME
      : SAFE_HARBOR_RATE_STANDARD;

  const priorYearTarget = inputs.priorYearTax * safeHarborRate;
  const currentYearTarget = inputs.projectedCurrentTax * PROJECTED_TAX_SAFE_HARBOR;

  // You are safe if you meet *either* threshold; planner uses the lower target.
  const usePriorYear = priorYearTarget <= currentYearTarget;
  const safeHarborTarget = usePriorYear ? priorYearTarget : currentYearTarget;
  const safeHarborType: "prior-year" | "current-year" = usePriorYear
    ? "prior-year"
    : "current-year";

  const alreadyPaid = inputs.federalWithholding + inputs.estimatedPayments;
  const remainingNeeded = Math.max(0, safeHarborTarget - alreadyPaid);
  const quartersRemaining = 4 - inputs.currentQuarter + 1;
  const perQuarterAmount =
    quartersRemaining > 0 ? remainingNeeded / quartersRemaining : 0;

  const notes = [
    `Safe-harbor options: ${Math.round(priorYearTarget).toLocaleString()} (prior-year) or ${Math.round(currentYearTarget).toLocaleString()} (90% current-year).`,
    `Planner uses lower target: ${safeHarborType.replace("-", " ")}.`,
    "Quarterly due dates: Apr 15, Jun 15, Sep 15, Jan 15 (next year).",
  ];

  return {
    safeHarborTarget,
    safeHarborType: usePriorYear ? "prior-year" : "current-year",
    remainingNeeded,
    perQuarterAmount,
    quartersRemaining,
    notes,
  };
}

function buildRetirementPlan(
  inputs: CalculatorInputs
): RetirementPlanRecommendation {
  if (inputs.employeesCount > 0 && inputs.employeesCount <= 100) {
    return {
      recommendedPlan: "simple_ira",
      employeeDeferralLimit: LIMITS_2026.simpleIRA,
      employerContributionLimit: LIMITS_2026.simpleIRA * 0.03,
      totalLimit: LIMITS_2026.simpleIRA + LIMITS_2026.simpleIRA * 0.03,
      notes: [
        "SIMPLE IRA works for teams under 100 employees.",
        "Employer match typically 3% of compensation.",
      ],
    };
  }

  if (inputs.employeesCount > 100) {
    return {
      recommendedPlan: "sep_ira",
      employeeDeferralLimit: 0,
      employerContributionLimit: LIMITS_2026.sepIRA,
      totalLimit: LIMITS_2026.sepIRA,
      notes: [
        "SEP IRA allows employer-only contributions up to 25% of compensation.",
      ],
    };
  }

  return {
    recommendedPlan: "solo_401k",
    employeeDeferralLimit: LIMITS_2026.solo401kEmployee,
    employerContributionLimit:
      LIMITS_2026.total415Limit - LIMITS_2026.solo401kEmployee,
    totalLimit: LIMITS_2026.total415Limit,
    notes: [
      "Solo 401(k) is available when there are no full-time employees.",
      "Allows both employee deferrals and employer profit-sharing.",
    ],
  };
}

function buildCashflowAlerts(inputs: CalculatorInputs): string[] {
  const alerts: string[] = [];
  if (inputs.businessAccounts === 0) {
    alerts.push("No business accounts detected. Open a dedicated business account.");
  }
  if (inputs.personalAccounts === 0) {
    alerts.push("No personal accounts detected. Confirm household accounts are linked.");
  }
  if (inputs.mixedTransactionsPerMonth > 5) {
    alerts.push("High commingling risk: review mixed personal/business transactions.");
  }
  if (inputs.reimbursementPolicy === "none") {
    alerts.push("No reimbursement policy configured for personal expenses.");
  }
  if (inputs.payrollCadence === "monthly") {
    alerts.push("Monthly payroll cadence selected. Consider biweekly for smoother withholding.");
  }
  return alerts;
}

function buildEquityChecklist(inputs: CalculatorInputs): EquityChecklist {
  if (!inputs.hasEquityGrants) {
    return {
      deadlineStatus: "not-applicable",
      qsbsStatus: "unknown",
      items: ["No equity grants reported yet."],
    };
  }

  let deadlineStatus: EquityChecklist["deadlineStatus"] = "not-applicable";
  if (inputs.equityGrantType === "restricted_stock") {
    deadlineStatus = "on-track";
    if (inputs.daysSinceGrant > 30) {
      deadlineStatus = "missed";
    } else if (inputs.daysSinceGrant >= 25) {
      deadlineStatus = "urgent";
    }
  }

  const qsbsEligible =
    inputs.legalEntityType === "c_corp" &&
    inputs.isQualifiedBusiness &&
    inputs.assetsAtIssuance <= QSBS_ASSET_LIMIT &&
    inputs.expectedHoldingYears >= QSBS_HOLDING_PERIOD_YEARS;

  const qsbsStatus: EquityChecklist["qsbsStatus"] = qsbsEligible
    ? "likely"
    : inputs.legalEntityType !== "c_corp"
      ? "unlikely"
      : "unknown";

  const items = [
    inputs.equityGrantType === "restricted_stock"
      ? "Track 83(b) election deadline (30 days from restricted stock grant / early exercise)."
      : "83(b) elections typically apply to restricted stock / early exercise, not standard option or RSU grants.",
    "Confirm qualified trade/business status for QSBS.",
    `Vesting schedule: ${inputs.vestingYears} years with ${inputs.cliffMonths}-month cliff.`,
    `Exercise window: ${inputs.exerciseWindowMonths} months post-termination.`,
    `Strike price: $${inputs.strikePrice.toLocaleString()} | FMV: $${inputs.fairMarketValue.toLocaleString()}.`,
    `Shares granted: ${inputs.sharesGranted.toLocaleString()}.`,
    "Store 409A valuations and board approvals.",
    "Review vesting schedule and exercise windows annually.",
  ];

  return {
    deadlineStatus,
    qsbsStatus,
    items,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDateOnly(value: string): Date | null {
  // Expect YYYY-MM-DD from <input type="date">.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) {
    return null;
  }
  return new Date(Date.UTC(year, monthIndex, day));
}

function formatDateOnly(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addMonthsAndDaysUtc(date: Date, months: number, days: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  let targetYear = year;
  let targetMonth = month + months;
  if (targetMonth >= 12) {
    targetYear += Math.floor(targetMonth / 12);
    targetMonth = targetMonth % 12;
  } else if (targetMonth < 0) {
    const yearsBack = Math.ceil(Math.abs(targetMonth) / 12);
    targetYear -= yearsBack;
    targetMonth = (targetMonth % 12 + 12) % 12;
  }

  // Clamp day-of-month to avoid rollover (e.g., Jan 31 + 1 month).
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);

  const result = new Date(Date.UTC(targetYear, targetMonth, clampedDay));
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
