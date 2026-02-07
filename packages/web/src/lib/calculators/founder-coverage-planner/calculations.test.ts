import { describe, expect, test } from "vitest";
import { calculate } from "./calculations";
import type { CalculatorInputs } from "./types";

function baseInputs(overrides: Partial<CalculatorInputs> = {}): CalculatorInputs {
  return {
    annualNetIncome: 180000,
    ownersCount: 1,
    employeesCount: 0,
    legalEntityType: "llc",
    fundingPlan: "bootstrapped",
    ownerRole: "operator",
    marketSalary: 120000,
    plannedSalary: 90000,
    payrollAdminCosts: 2500,
    statePayrollTaxRate: 2.5,
    ssWageBase: 170000,
    filingStatus: "single",
    priorYearTax: 35000,
    projectedCurrentTax: 42000,
    federalWithholding: 6000,
    estimatedPayments: 9000,
    currentQuarter: 3,
    entityStartDate: "2025-01-01",
    taxYearStartDate: "2026-01-01",
    taxElection: "s_corp",
    payrollCadence: "biweekly",
    businessAccounts: 1,
    personalAccounts: 2,
    mixedTransactionsPerMonth: 2,
    reimbursementPolicy: "accountable",
    hasEquityGrants: true,
    equityGrantType: "options",
    daysSinceGrant: 18,
    vestingYears: 4,
    cliffMonths: 12,
    strikePrice: 1.25,
    fairMarketValue: 5,
    sharesGranted: 100000,
    exerciseWindowMonths: 90,
    isQualifiedBusiness: true,
    assetsAtIssuance: 12000000,
    expectedHoldingYears: 5,
    ...overrides,
  };
}

describe("founder-coverage-planner.calculate", () => {
  test("quarterly safe-harbor target uses the lower of prior-year vs 90% current-year", () => {
    const results = calculate(
      baseInputs({
        priorYearTax: 35000,
        projectedCurrentTax: 42000, // 90% => 37,800, higher than 35k
        annualNetIncome: 180000, // not high-income threshold
        filingStatus: "single",
      }),
      new Date("2026-02-01T12:00:00Z")
    );

    expect(results.quarterlyTaxes.safeHarborTarget).toBeCloseTo(35000, 6);
    expect(results.quarterlyTaxes.safeHarborType).toBe("prior-year");
  });

  test("quarterly safe-harbor target switches to 90% current-year when it is lower", () => {
    const results = calculate(
      baseInputs({
        priorYearTax: 60000,
        projectedCurrentTax: 42000, // 90% => 37,800, lower than 60k
        annualNetIncome: 180000,
        filingStatus: "single",
      }),
      new Date("2026-02-01T12:00:00Z")
    );

    expect(results.quarterlyTaxes.safeHarborTarget).toBeCloseTo(37800, 6);
    expect(results.quarterlyTaxes.safeHarborType).toBe("current-year");
  });

  test("election checklist deadline is stable for date-only inputs", () => {
    const results = calculate(
      baseInputs({
        taxYearStartDate: "2026-01-01",
        entityStartDate: "2025-01-01",
        taxElection: "s_corp",
      }),
      new Date("2026-02-01T23:59:59Z")
    );

    expect(results.electionChecklist.deadlineDate).toBe("2026-03-16");
    expect(results.electionChecklist.daysRemaining).toBe(43);
  });

  test("83(b) checklist is not applicable for non-restricted stock grants", () => {
    const results = calculate(
      baseInputs({
        hasEquityGrants: true,
        equityGrantType: "options",
        daysSinceGrant: 29,
      }),
      new Date("2026-02-01T12:00:00Z")
    );

    expect(results.equityChecklist.deadlineStatus).toBe("not-applicable");
  });

  test("83(b) checklist becomes urgent close to 30 days for restricted stock", () => {
    const results = calculate(
      baseInputs({
        hasEquityGrants: true,
        equityGrantType: "restricted_stock",
        daysSinceGrant: 26,
      }),
      new Date("2026-02-01T12:00:00Z")
    );

    expect(results.equityChecklist.deadlineStatus).toBe("urgent");
  });
});
