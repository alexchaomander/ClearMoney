import { describe, it, expect } from "vitest";
import { calculateDebtPayoff } from "../calculations";
import type { CalculatorInputs } from "../types";

describe("Debt Destroyer Calculator", () => {
  const baseInputs: CalculatorInputs = {
    debts: [
      {
        id: "credit-card",
        name: "Credit Card",
        balance: 5000,
        interestRate: 24,
        minimumPayment: 150,
      },
      {
        id: "student-loan",
        name: "Student Loan",
        balance: 15000,
        interestRate: 6,
        minimumPayment: 200,
      },
      {
        id: "auto-loan",
        name: "Auto Loan",
        balance: 10000,
        interestRate: 8,
        minimumPayment: 300,
      },
    ],
    monthlyExtraPayment: 500,
  };

  it("calculates payoff comparison correctly", () => {
    const result = calculateDebtPayoff(baseInputs);

    expect(result.snowball).toBeDefined();
    expect(result.avalanche).toBeDefined();
    
    // Avalanche should generally save more interest than snowball
    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(result.snowball.totalInterest);
    expect(result.interestSaved).toBe(result.snowball.totalInterest - result.avalanche.totalInterest);
  });

  it("follows the avalanche strategy (highest interest first)", () => {
    const result = calculateDebtPayoff(baseInputs);
    
    // In avalanche, Credit Card (24%) should be paid first, then Auto Loan (8%), then Student Loan (6%)
    // Wait, the order in `debtsPaidOrder` is when they are PAID OFF, not when they started being paid.
    // 5000 @ 24% is smaller than 10000 @ 8% in terms of "time to kill" if all extra goes there.
    
    // Let's check the first debt in the paid order for avalanche.
    // cc: 5000, autoloan: 10000, studentloan: 15000
    // total minimums = 150 + 300 + 200 = 650. Total budget = 650 + 500 = 1150.
    // month 1: interest 100 on cc, 66.6 on autoloan, 75 on studentloan.
    // cc balance: 5000 + 100 - 150 (min) - 500 (extra) = 4450.
    // CC will definitely be paid first in both strategies here because it has the lowest balance AND highest rate.
    
    expect(result.avalanche.debtsPaidOrder[0]).toBe("credit-card");
  });

  it("follows the snowball strategy (lowest balance first)", () => {
    const result = calculateDebtPayoff(baseInputs);
    expect(result.snowball.debtsPaidOrder[0]).toBe("credit-card");
  });

  it("handles empty debt list", () => {
    const inputs: CalculatorInputs = {
      debts: [],
      monthlyExtraPayment: 500,
    };
    const result = calculateDebtPayoff(inputs);
    expect(result.snowball.monthsToPayoff).toBe(0);
    expect(result.snowball.timeline).toHaveLength(0);
  });

  it("avalanche vs snowball interest savings", () => {
    // Increase the balance of the low-interest debt to make the difference more pronounced
    const inputs: CalculatorInputs = {
      ...baseInputs,
      debts: [
        { id: "cc", name: "CC", balance: 5000, interestRate: 29.99, minimumPayment: 150 },
        { id: "loan", name: "Loan", balance: 50000, interestRate: 5, minimumPayment: 500 },
      ],
      monthlyExtraPayment: 1000,
    };
    const result = calculateDebtPayoff(inputs);
    // In this case, both will pick CC first because it has lower balance AND higher rate.
    // Let's flip it: CC has higher balance but higher rate.
    const flipInputs: CalculatorInputs = {
        ...baseInputs,
        debts: [
          { id: "cc", name: "CC", balance: 20000, interestRate: 25, minimumPayment: 400 },
          { id: "small", name: "Small", balance: 5000, interestRate: 5, minimumPayment: 100 },
        ],
        monthlyExtraPayment: 500,
      };
      const flipResult = calculateDebtPayoff(flipInputs);
      
      // Snowball should pay 'small' first.
      expect(flipResult.snowball.debtsPaidOrder[0]).toBe("small");
      // Avalanche should pay 'cc' first.
      expect(flipResult.avalanche.debtsPaidOrder[1]).toBe("small"); // CC might be paid off after small if small is tiny, but here 20k @ 25% vs 5k @ 5%.
      // Actually, if we put all extra into CC, it'll still take longer than the small one just with minimums?
      // 5000 / 100 = 50 months.
      // 20000 / 900 = 22 months.
      // So CC (avalanche) will actually be finished first!
      expect(flipResult.avalanche.debtsPaidOrder[0]).toBe("cc");
  });
});
