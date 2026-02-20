import { describe, expect, test } from "vitest";
import { calculate } from "./calculations";
import type { CalculatorInputs, SubscriptionInput } from "./types";

const gym: SubscriptionInput = {
  name: "Gym Membership",
  monthlyCost: 50,
  category: "Fitness",
  usageFrequency: "rarely",
  satisfaction: 2,
};

const netflix: SubscriptionInput = {
  name: "Netflix",
  monthlyCost: 15,
  category: "Entertainment",
  usageFrequency: "daily",
  satisfaction: 5,
};

const magazine: SubscriptionInput = {
  name: "Magazine",
  monthlyCost: 10,
  category: "News",
  usageFrequency: "never",
  satisfaction: 1,
};

const BASE_INPUTS: CalculatorInputs = {
  subscriptions: [netflix, gym, magazine],
  monthlyIncome: 5000,
};

describe("subscription-audit.calculate", () => {
  test("empty subscriptions returns zero totals", () => {
    const results = calculate({ subscriptions: [], monthlyIncome: 5000 });
    expect(results.totalMonthlySpend).toBe(0);
    expect(results.totalAnnualSpend).toBe(0);
    expect(results.percentOfIncome).toBe(0);
    expect(results.scoredSubscriptions).toHaveLength(0);
    expect(results.overallHealthScore).toBe(100);
  });

  test("single high-usage subscription is kept", () => {
    const results = calculate({
      subscriptions: [netflix],
      monthlyIncome: 5000,
    });
    expect(results.scoredSubscriptions[0].recommendation).toBe("keep");
    expect(results.scoredSubscriptions[0].roiScore).toBeGreaterThanOrEqual(60);
  });

  test("mixed usage — gym is flagged for cancel/review, Netflix kept", () => {
    const results = calculate(BASE_INPUTS);
    const netflixResult = results.scoredSubscriptions.find((s) => s.name === "Netflix");
    const gymResult = results.scoredSubscriptions.find((s) => s.name === "Gym Membership");

    expect(netflixResult?.recommendation).toBe("keep");
    expect(gymResult?.recommendation).not.toBe("keep");
  });

  test("never-used subscription scores 0", () => {
    const results = calculate({
      subscriptions: [magazine],
      monthlyIncome: 5000,
    });
    expect(results.scoredSubscriptions[0].roiScore).toBe(0);
    expect(results.scoredSubscriptions[0].recommendation).toBe("cancel");
  });

  test("percent of income is correct", () => {
    const results = calculate(BASE_INPUTS);
    const expectedPct = ((50 + 15 + 10) / 5000) * 100;
    expect(results.percentOfIncome).toBeCloseTo(expectedPct, 1);
  });

  test("annual savings sums only cancel items", () => {
    const results = calculate(BASE_INPUTS);
    const cancelledSubs = results.scoredSubscriptions.filter(
      (s) => s.recommendation === "cancel"
    );
    const expectedSavings = cancelledSubs.reduce((sum, s) => sum + s.annualCost, 0);
    expect(results.annualSavingsIfCancelled).toBe(expectedSavings);
  });

  test("category grouping works correctly", () => {
    const results = calculate({
      subscriptions: [
        netflix,
        { ...netflix, name: "Hulu", monthlyCost: 12 },
        gym,
      ],
      monthlyIncome: 5000,
    });
    const entertainment = results.categoryBreakdown.find(
      (c) => c.category === "Entertainment"
    );
    expect(entertainment).toBeDefined();
    expect(entertainment!.count).toBe(2);
    expect(entertainment!.monthlyCost).toBe(27);
  });
});
