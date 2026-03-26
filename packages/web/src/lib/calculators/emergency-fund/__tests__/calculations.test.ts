import { describe, it, expect } from "vitest";
import { calculate } from "../calculations";
import type { CalculatorInputs } from "../types";

describe("Emergency Fund Calculator", () => {
  const baseInputs: CalculatorInputs = {
    monthlyExpenses: 5000,
    jobStability: "stable",
    incomeSource: "single_stable",
    dependents: "none",
    healthSituation: "good",
    housingSituation: "rent_normal",
  };

  it("calculates baseline correctly", () => {
    const result = calculate(baseInputs);
    
    // Baseline is 3 months. All multipliers for 'stable', 'single_stable', 'none', 'good', 'rent_normal' are ~1.0 or close.
    // Let's check the exact multipliers:
    // jobStability.stable: 1.0
    // incomeSource.single_stable: 1.0
    // dependents.none: 0.9
    // healthSituation.good: 1.0
    // housingSituation.rent_normal: 1.0
    // Combined = 0.9.
    // Adjusted Months = max(3, round(3 * 0.9)) = 3.
    
    expect(result.adjustedMonths).toBe(3);
    expect(result.targetAmount).toBe(15000);
  });

  it("increases target for high risk factors", () => {
    const highRiskInputs: CalculatorInputs = {
      ...baseInputs,
      jobStability: "freelance", // 1.5
      dependents: "children", // 1.2
      housingSituation: "own_old", // 1.3
    };
    
    const result = calculate(highRiskInputs);
    // Combined = 1.5 * 1.0 * 1.2 * 1.0 * 1.3 = 2.34
    // Adjusted Months = 3 * 2.34 = 7.02 -> rounded to 7.0
    
    expect(result.adjustedMonths).toBe(7);
    expect(result.overallRisk).toBe("very-high");
    expect(result.targetAmount).toBe(35000);
  });

  it("decreases target for low risk factors", () => {
    const lowRiskInputs: CalculatorInputs = {
      ...baseInputs,
      jobStability: "government", // 0.8
      incomeSource: "dual", // 0.8
    };
    
    const result = calculate(lowRiskInputs);
    // Combined = 0.8 * 0.8 * 0.9 * 1.0 * 1.0 = 0.576
    // Adjusted Months = 3 * 0.576 = 1.728 -> limited to minimum of 3
    
    expect(result.adjustedMonths).toBe(3);
  });

  it("caps at 12 months", () => {
    const extremeRiskInputs: CalculatorInputs = {
      ...baseInputs,
      jobStability: "unstable", // 1.7
      incomeSource: "single_variable", // 1.3
      dependents: "extended", // 1.3
      healthSituation: "significant", // 1.4
      housingSituation: "own_old", // 1.3
    };
    
    const result = calculate(extremeRiskInputs);
    // Combined = 1.7 * 1.3 * 1.3 * 1.4 * 1.3 = 5.22
    // Adjusted Months = 3 * 5.22 = 15.6 -> capped at 12
    
    expect(result.adjustedMonths).toBe(12);
  });
});
