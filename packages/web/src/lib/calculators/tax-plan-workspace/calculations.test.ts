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
});
