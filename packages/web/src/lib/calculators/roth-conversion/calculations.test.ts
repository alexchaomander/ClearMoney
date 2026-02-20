import { describe, expect, test } from "vitest";
import { calculate } from "./calculations";
import type { CalculatorInputs } from "./types";

const BASE_INPUTS: CalculatorInputs = {
  currentAge: 45,
  retirementAge: 65,
  traditionalIraBalance: 500000,
  conversionAmount: 50000,
  currentTaxableIncome: 100000,
  filingStatus: "single",
  state: "CA",
  expectedReturnRate: 7,
  currentTaxRate: 24,
  retirementTaxRate: 22,
};

describe("roth-conversion.calculate", () => {
  test("basic conversion tax cost", () => {
    const results = calculate(BASE_INPUTS);
    // 50000 * 0.24 = 12000
    expect(results.conversionTaxCost).toBe(12000);
  });

  test("zero conversion returns zero cost and no break-even", () => {
    const results = calculate({ ...BASE_INPUTS, conversionAmount: 0 });
    expect(results.conversionTaxCost).toBe(0);
    expect(results.breakEvenAge).toBeNull();
    expect(results.breakEvenYear).toBeNull();
    expect(results.lifetimeSavings).toBe(0);
  });

  test("break-even found when retirement rate is higher than current rate", () => {
    // When retirement rate > current rate, conversion pays off since
    // you pay lower tax now and avoid higher tax later
    const results = calculate({
      ...BASE_INPUTS,
      currentTaxRate: 22,
      retirementTaxRate: 32,
    });
    expect(results.breakEvenAge).not.toBeNull();
    if (results.breakEvenAge !== null) {
      expect(results.breakEvenAge).toBeGreaterThan(BASE_INPUTS.currentAge);
      expect(results.breakEvenAge).toBeLessThanOrEqual(90);
    }
  });

  test("IRMAA crossing at $109k single", () => {
    const results = calculate({
      ...BASE_INPUTS,
      filingStatus: "single",
      currentTaxableIncome: 105000,
      conversionAmount: 10000,
    });
    // 105k + 10k = 115k, crosses the $109k single threshold
    expect(results.irmaaImpact.crossesBracket).toBe(true);
    expect(results.irmaaImpact.annualSurchargeDelta).toBeGreaterThan(0);
  });

  test("high-income top IRMAA bracket", () => {
    const results = calculate({
      ...BASE_INPUTS,
      filingStatus: "single",
      currentTaxableIncome: 500000,
      conversionAmount: 50000,
    });
    // Both before and after are in the top bracket ($500k+)
    expect(results.irmaaImpact.crossesBracket).toBe(false);
    expect(results.irmaaImpact.annualSurchargeDelta).toBe(0);
  });

  test("projection length = 90 - currentAge + 1", () => {
    const results = calculate(BASE_INPUTS);
    expect(results.yearByYear.length).toBe(90 - BASE_INPUTS.currentAge + 1);
  });

  test("married brackets use higher thresholds", () => {
    // At $200k single, crosses IRMAA. At $200k married, should not.
    const singleResults = calculate({
      ...BASE_INPUTS,
      filingStatus: "single",
      currentTaxableIncome: 200000,
      conversionAmount: 10000,
    });
    const marriedResults = calculate({
      ...BASE_INPUTS,
      filingStatus: "married",
      currentTaxableIncome: 200000,
      conversionAmount: 10000,
    });
    // Single at $200k is in a higher IRMAA bracket; married at $200k is in base
    expect(singleResults.irmaaImpact.annualSurchargeBefore).toBeGreaterThan(0);
    expect(marriedResults.irmaaImpact.annualSurchargeBefore).toBe(0);
  });
});
