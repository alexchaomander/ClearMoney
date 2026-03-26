import { describe, it, expect } from "vitest";
import { calculate } from "../calculations";
import type { CalculatorInputs } from "../types";

describe("RSU Tax Calculator", () => {
  const baseInputs: CalculatorInputs = {
    sharesVesting: 1000,
    stockPrice: 150,
    filingStatus: "single",
    annualSalary: 180000,
    otherIncome: 0,
    state: "CA",
    withholdingMethod: "sell_to_cover",
  };

  it("calculates gross value correctly", () => {
    const result = calculate(baseInputs);
    expect(result.grossValue).toBe(150000);
  });

  it("calculates taxes for a high-income earner in CA", () => {
    const result = calculate(baseInputs);
    
    // Federal Tax on 150k RSU with 180k base (Total 330k)
    // 180k is in 24% bracket. 330k reaches the 35% bracket?
    // Brackets: 191k-243k @ 32%, 243k-609k @ 35%
    // So marginal should be 35%.
    
    expect(result.actualTax.federalRate).toBe(0.35);
    expect(result.actualTax.stateRate).toBe(0.133); // CA rate
    expect(result.actualTax.medicare).toBe(150000 * 0.0145);
  });

  it("handles sell_to_cover correctly", () => {
    const result = calculate(baseInputs);
    expect(result.withholding.sharesWithheld).toBeGreaterThan(0);
    expect(result.withholding.sharesReceived).toBe(1000 - result.withholding.sharesWithheld);
  });

  it("provides correct recommendations for high taxes", () => {
    const result = calculate(baseInputs);
    expect(result.recommendations).toContain("Consider increasing 401(k) contributions to reduce taxable income.");
    expect(result.recommendations).toContain("You're in a high-tax state (13.3%). This significantly impacts your RSU value.");
  });

  it("handles low income state correctly", () => {
    const txInputs: CalculatorInputs = {
      ...baseInputs,
      state: "TX", // 0% state tax
    };
    const result = calculate(txInputs);
    expect(result.actualTax.stateIncome).toBe(0);
    expect(result.actualTax.stateRate).toBe(0);
  });

  it("calculates Social Security cap correctly", () => {
    const resultAtCap = calculate({
      ...baseInputs,
      annualSalary: 200000, // Above SS wage base (168,600)
    });
    // Already above cap, so social security on RSU should be 0
    expect(resultAtCap.actualTax.socialSecurity).toBe(0);

    const resultBelowCap = calculate({
      ...baseInputs,
      annualSalary: 100000, // Below cap
    });
    // 100k + 150k = 250k. SS base is 168.6k.
    // Range covered: 168.6k - 100k = 68.6k
    // SS Tax = 68600 * 0.062 = 4253.2
    expect(resultBelowCap.actualTax.socialSecurity).toBeCloseTo(4253.2, 1);
  });
});
