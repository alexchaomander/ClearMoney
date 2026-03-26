import { describe, it, expect } from "vitest";
import { calculate } from "../calculations";
import type { CalculatorInputs } from "../types";

describe("Roth vs Traditional Calculator", () => {
  const baseInputs: CalculatorInputs = {
    annualContribution: 6000,
    currentTaxRate: 25,
    retirementTaxRate: 15, // Expect lower taxes in retirement
    yearsUntilRetirement: 30,
    expectedReturn: 7,
  };

  it("calculates Traditional advantage when retirement tax is lower", () => {
    const result = calculate(baseInputs);
    
    expect(result.winner).toBe("traditional");
    expect(result.difference).toBeLessThan(0); // Traditional is better, so diff (Roth - Trad) is negative
    expect(result.recommendation).toContain("Traditional wins");
  });

  it("calculates Roth advantage when retirement tax is higher", () => {
    const highRetirementTaxInputs: CalculatorInputs = {
      ...baseInputs,
      retirementTaxRate: 35,
    };
    const result = calculate(highRetirementTaxInputs);
    
    expect(result.winner).toBe("roth");
    expect(result.difference).toBeGreaterThan(0);
    expect(result.recommendation).toContain("Roth wins");
  });

  it("identifies a tie when tax rates are equal", () => {
    const equalTaxInputs: CalculatorInputs = {
      ...baseInputs,
      retirementTaxRate: 25,
    };
    const result = calculate(equalTaxInputs);
    
    // Mathematically, if tax rates are equal, Roth and Traditional are identical
    // (Contribution * (1-Tax)) * (1+r)^n  == (Contribution * (1+r)^n) * (1-Tax)
    // The code has a $100 threshold for a tie.
    expect(result.winner).toBe("tie");
  });

  it("handles zero contribution", () => {
    const zeroInputs: CalculatorInputs = {
      ...baseInputs,
      annualContribution: 0,
    };
    const result = calculate(zeroInputs);
    expect(result.recommendation).toContain("Enter a contribution amount");
  });
});
