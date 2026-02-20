import { describe, expect, test } from "vitest";
import { calculate } from "./calculations";
import type { WorkspaceInputs } from "./types";

const BASE_INPUTS: WorkspaceInputs = {
  mode: "advisor",
  clientName: "Rivera Family",
  filingStatus: "married",
  stateCode: "CA",
  wagesIncome: 280000,
  otherOrdinaryIncome: 10000,
  shortTermGains: 12000,
  longTermGains: 20000,
  currentWithholding: 55000,
  hsaRemainingRoom: 4000,
  pretax401kRemainingRoom: 10000,
  harvestableLosses: 7000,
  donationAmount: 6000,
  quarterlyPaymentsMade: 5000,
  strategies: {
    hsa: true,
    pretax401k: true,
    lossHarvesting: true,
    donationBunching: false,
  },
};

describe("tax-plan-workspace.calculate", () => {
  test("reduces projected tax when enabled strategies have room", () => {
    const results = calculate(BASE_INPUTS);

    expect(results.estimatedSavings).toBeGreaterThan(0);
    expect(results.projectedTax).toBeLessThan(results.baselineTax);
    expect(results.strategyImpacts[0]?.savings ?? 0).toBeGreaterThan(0);
  });

  test("shows safe-harbor gap when payments are too low", () => {
    const results = calculate({
      ...BASE_INPUTS,
      currentWithholding: 5000,
      quarterlyPaymentsMade: 0,
    });

    expect(results.safeHarborGap).toBeGreaterThan(0);
    expect(results.topActions.some((a) => a.key === "safe-harbor")).toBe(true);
  });

  test("returns monitor action when no strategies are active and coverage is sufficient", () => {
    const results = calculate({
      ...BASE_INPUTS,
      currentWithholding: 120000,
      quarterlyPaymentsMade: 10000,
      strategies: {
        hsa: false,
        pretax401k: false,
        lossHarvesting: false,
        donationBunching: false,
      },
    });

    expect(results.estimatedSavings).toBe(0);
    expect(results.topActions[0]?.key).toBe("monitor");
  });

  test("applies zero state tax for no-income-tax states", () => {
    const txResults = calculate({ ...BASE_INPUTS, stateCode: "TX" });
    const caResults = calculate({ ...BASE_INPUTS, stateCode: "CA" });

    expect(txResults.baselineTax).toBeLessThan(caResults.baselineTax);

    const flResults = calculate({ ...BASE_INPUTS, stateCode: "FL" });
    expect(flResults.baselineTax).toBe(txResults.baselineTax);
  });

  test("computes head of household standard deduction correctly", () => {
    const hohResults = calculate({
      ...BASE_INPUTS,
      filingStatus: "head_of_household",
    });
    const singleResults = calculate({
      ...BASE_INPUTS,
      filingStatus: "single",
    });

    // HoH has a higher standard deduction ($21,900) than single ($14,600)
    // so baseline tax should be lower
    expect(hohResults.baselineTax).toBeLessThan(singleResults.baselineTax);
  });

  test("handles zero income gracefully", () => {
    const results = calculate({
      ...BASE_INPUTS,
      wagesIncome: 0,
      otherOrdinaryIncome: 0,
      shortTermGains: 0,
      longTermGains: 0,
      currentWithholding: 0,
      quarterlyPaymentsMade: 0,
      hsaRemainingRoom: 0,
      pretax401kRemainingRoom: 0,
      harvestableLosses: 0,
      donationAmount: 0,
    });

    expect(results.baselineTax).toBe(0);
    expect(results.projectedTax).toBe(0);
    expect(results.estimatedSavings).toBe(0);
    expect(results.withholdingGap).toBe(0);
    expect(Number.isFinite(results.confidenceScore)).toBe(true);
  });

  test("includes donation bunching strategy when enabled", () => {
    const results = calculate({
      ...BASE_INPUTS,
      strategies: {
        ...BASE_INPUTS.strategies,
        donationBunching: true,
      },
    });

    const donationImpact = results.strategyImpacts.find(
      (s) => s.id === "donationBunching"
    );
    expect(donationImpact).toBeDefined();
    expect(donationImpact!.savings).toBeGreaterThan(0);
    expect(donationImpact!.confidence).toBe("medium");
  });

  test("generates advisor brief with content", () => {
    const results = calculate(BASE_INPUTS);

    expect(results.advisorBrief).toContain("Rivera Family");
    expect(results.advisorBrief).toContain("Advisor");
    expect(results.advisorBrief).toContain("Baseline tax:");
  });

  test("confidence score scales with strategy confidence", () => {
    // No strategies = lower confidence
    const noStrategies = calculate({
      ...BASE_INPUTS,
      strategies: {
        hsa: false,
        pretax401k: false,
        lossHarvesting: false,
        donationBunching: false,
      },
    });

    // All strategies with room = higher confidence
    const allStrategies = calculate({
      ...BASE_INPUTS,
      strategies: {
        hsa: true,
        pretax401k: true,
        lossHarvesting: true,
        donationBunching: true,
      },
    });

    expect(allStrategies.confidenceScore).toBeGreaterThan(noStrategies.confidenceScore);
    expect(noStrategies.confidenceScore).toBeGreaterThanOrEqual(35);
    expect(allStrategies.confidenceScore).toBeLessThanOrEqual(96);
  });

  test("uses different federal rate brackets", () => {
    // Low income = 12% bracket
    const lowIncome = calculate({
      ...BASE_INPUTS,
      wagesIncome: 30000,
      otherOrdinaryIncome: 0,
      shortTermGains: 0,
      longTermGains: 0,
    });

    // High income = 35% bracket
    const highIncome = calculate({
      ...BASE_INPUTS,
      wagesIncome: 500000,
      otherOrdinaryIncome: 0,
      shortTermGains: 0,
      longTermGains: 0,
    });

    // The ratio of tax to income should be higher for high income
    const lowRate = lowIncome.baselineTax / 30000;
    const highRate = highIncome.baselineTax / 500000;
    expect(highRate).toBeGreaterThan(lowRate);
  });
});
