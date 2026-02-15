import { describe, expect, test } from "vitest";
import { encodeFounderCoverageSharePayload, decodeFounderCoverageSharePayload, stripCurrencyLikeText } from "./snapshotShare";
import type { CalculatorInputs } from "./types";
import type { FounderCoverageSharePayloadV2 } from "./snapshotShare";

describe("snapshotShare", () => {
  test("encode/decode roundtrip (v2 full)", () => {
    const payload = {
      version: 2 as const,
      mode: "full" as const,
      savedAt: "2026-02-01T00:00:00.000Z",
      inputs: {
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
        currentQuarter: 1 as const,
        entityStartDate: "2025-01-01",
        taxYearStartDate: "2026-01-01",
        taxElection: "s_corp",
        payrollCadence: "biweekly",
        businessAccounts: 1,
        personalAccounts: 2,
        mixedTransactionsPerMonth: 2,
        reimbursementPolicy: "manual",
        hasEquityGrants: false,
        equityGrantType: "options",
        daysSinceGrant: 0,
        vestingYears: 4,
        cliffMonths: 12,
        strikePrice: 1.25,
        fairMarketValue: 5,
        sharesGranted: 100000,
        exerciseWindowMonths: 90,
        isQualifiedBusiness: true,
        assetsAtIssuance: 12000000,
        expectedHoldingYears: 5,
      } satisfies CalculatorInputs,
      checklist: { "k1": true },
    };

    const encoded = encodeFounderCoverageSharePayload(payload);
    const decoded = decodeFounderCoverageSharePayload(encoded);
    expect(decoded).toBeTruthy();
    const parsed = decoded as FounderCoverageSharePayloadV2;
    expect(parsed.version).toBe(2);
    expect(parsed.mode).toBe("full");
  });

  test("stripCurrencyLikeText removes dollar amounts", () => {
    expect(stripCurrencyLikeText("Pay $12,345.67 and then $500")).not.toMatch(/\$\d/);
  });
});
