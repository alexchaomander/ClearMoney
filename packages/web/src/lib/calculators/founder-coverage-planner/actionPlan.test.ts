import { describe, expect, test } from "vitest";
import { calculate } from "./calculations";
import { buildActionPlan } from "./actionPlan";
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
    stateCode: "CA",
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

describe("buildActionPlan state estimated tax events", () => {
  test("TX (no state income tax) does not add state estimated tax reminders", () => {
    const inputs = baseInputs({ stateCode: "TX" });
    const results = calculate(inputs);
    const plan = buildActionPlan({ inputs, results });
    expect(plan.actionEvents.some((e) => /TX estimated tax due/i.test(e.title))).toBe(false);
  });

  test("CA adds explicit state estimated tax reminders", () => {
    const inputs = baseInputs({ stateCode: "CA" });
    const results = calculate(inputs);
    const plan = buildActionPlan({ inputs, results });
    expect(plan.actionEvents.some((e) => /CA Q1 estimated tax due/i.test(e.title))).toBe(true);
    expect(plan.actionEvents.some((e) => /CA Q4 estimated tax due/i.test(e.title))).toBe(true);
  });

  test("VA uses May 1 for Q1 estimated tax due", () => {
    const inputs = baseInputs({ stateCode: "VA", taxYearStartDate: "2026-01-01" });
    const results = calculate(inputs);
    const plan = buildActionPlan({ inputs, results });
    const q1 = plan.actionEvents.find((e) => /VA Q1 estimated tax due/i.test(e.title));
    expect(q1?.date).toBe("2026-05-01");
  });
});
