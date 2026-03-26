import { describe, it, expect } from "vitest";
import { calculate } from "../calculations";
import type { CalculatorInputs } from "../types";

describe("Total Compensation Calculator", () => {
  const baseInputs: CalculatorInputs = {
    baseSalary: 150000,
    targetBonus: 15,
    expectedBonusMultiplier: 100,
    rsuGrant: {
      totalValue: 200000,
      vestingYears: 4,
      vestingSchedule: "standard",
      grantPrice: 100,
      currentPrice: 100,
    },
    signOnBonus: 50000,
    signOnVestingYears: 2,
    match401k: 50,
    match401kLimit: 10000,
    esppDiscount: 15,
    esppContribution: 25000,
    hsaContribution: 3000,
    annualRefresher: 40000,
    refresherVestingYears: 4,
  };

  it("calculates standard vesting correctly", () => {
    const result = calculate(baseInputs);
    
    // Year 1 breakdown:
    // Base: 150,000
    // Bonus: 150,000 * 0.15 = 22,500
    // RSU: 200,000 / 4 = 50,000
    // Sign-on: 50,000 / 2 = 25,000
    // 401k match: min(150,000 * 0.5, 10,000) = 10,000 (Wait, match is usually % of salary, e.g. 50% match of up to 6% salary)
    // Actually, the code says: Math.min(baseSalary * (match401k / 100), match401kLimit)
    // So 150,000 * 0.5 = 75,000 -> limited to 10,000
    // ESPP Benefit: 25,000 * 0.15 / 0.85 = 4411.76
    // HSA: 3,000
    // Refresher: 0 (Year 1)
    
    expect(result.year1Total).toBeCloseTo(150000 + 22500 + 50000 + 25000 + 10000 + 4411.76 + 3000, 2);
  });

  it("handles Amazon-style vesting correctly", () => {
    const inputs = {
      ...baseInputs,
      rsuGrant: {
        ...baseInputs.rsuGrant,
        vestingSchedule: "amazon" as const,
      },
    };
    const result = calculate(inputs);
    
    // Year 1 RSU: 200,000 * 0.05 = 10,000
    // Year 4 RSU: 200,000 * 0.40 = 80,000
    expect(result.yearlyBreakdowns[0].rsuValue).toBe(10000);
    expect(result.yearlyBreakdowns[3].rsuValue).toBe(80000);
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining("Amazon-style vesting")]));
  });

  it("handles cliff_monthly vesting correctly", () => {
    const inputs = {
      ...baseInputs,
      rsuGrant: {
        ...baseInputs.rsuGrant,
        vestingSchedule: "cliff_monthly" as const,
      },
    };
    const result = calculate(inputs);
    
    // Year 1 RSU: 0%
    // Year 2-4 RSU: 33.33% each
    expect(result.yearlyBreakdowns[0].rsuValue).toBe(0);
    expect(result.yearlyBreakdowns[1].rsuValue).toBeCloseTo(200000 * 0.3333, 0);
  });

  it("scales RSU value with stock price changes", () => {
    const inputs = {
      ...baseInputs,
      rsuGrant: {
        ...baseInputs.rsuGrant,
        currentPrice: 150, // 50% increase
      },
    };
    const result = calculate(inputs);
    
    // Adjusted RSU: 200,000 * 1.5 = 300,000
    // Year 1: 300,000 / 4 = 75,000
    expect(result.yearlyBreakdowns[0].rsuValue).toBe(75000);
  });
});
