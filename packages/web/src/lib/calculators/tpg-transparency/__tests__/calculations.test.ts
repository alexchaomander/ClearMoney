import { describe, it, expect } from "vitest";
import { calculate, DEFAULT_CARDS } from "../calculations";
import type { CalculatorInputs } from "../types";

describe("TPG Transparency Calculator", () => {
  const baseInputs: CalculatorInputs = {
    selectedCard: "sapphire-preferred",
    spending: {
      dining: 500,
      travel: 500,
      groceries: 500,
      other: 1000,
    },
    redemptionStyle: "portal",
  };

  it("calculates TPG valuation correctly for Sapphire Preferred", () => {
    const result = calculate(baseInputs);
    
    // Chase Sapphire Preferred (id: sapphire-preferred):
    // Annual Fee: 95
    // Earn Rates: dining: 3, travel: 2, groceries: 1, other: 1
    // Monthly Spend: dining: 500, travel: 500, groceries: 500, other: 1000
    // Annual Spend: dining: 6000, travel: 6000, groceries: 6000, other: 12000
    // Annual Points: 6000*3 + 6000*2 + 6000*1 + 12000*1 = 18000 + 12000 + 6000 + 12000 = 48000
    // TPG Valuation: 2.0cpp
    // TPG Rewards Value: 48000 * 0.02 = 960
    // TPG Credits: $50 Hotel Credit = 50
    // TPG Net Value: 960 + 50 - 95 = 915
    
    expect(result.annualPointsEarned).toBe(48000);
    expect(result.tpgAnnualRewardsValue).toBe(960);
    expect(result.tpgNetValue).toBe(915);
  });

  it("calculates realistic ('Our') valuation correctly for Sapphire Preferred", () => {
    const result = calculate(baseInputs);
    
    // Redemption Style: 'portal' -> valuations.conservative = 1.25cpp
    // Points Value: 48000 * 0.0125 = 600
    // Credits: $50 * 70% usability = 35
    // Net Value: 600 + 35 - 95 = 540
    
    expect(result.ourPointValue).toBe(1.25);
    expect(result.ourAnnualRewardsValue).toBe(600);
    expect(result.ourNetValue).toBe(540);
    expect(result.valueDifference).toBe(915 - 540); // 375
  });

  it("adjusts point valuation based on redemption style", () => {
    const cashBackResult = calculate({ ...baseInputs, redemptionStyle: "cashBack" });
    expect(cashBackResult.ourPointValue).toBe(1.0);

    const transfersResult = calculate({ ...baseInputs, redemptionStyle: "transfers" });
    expect(transfersResult.ourPointValue).toBe(DEFAULT_CARDS[0].valuations.optimistic); // 1.5 for CSP
  });

  it("identifies red flags for high affiliate payouts", () => {
    // Sapphire Reserve has $350 payout (> 300)
    const result = calculate({ ...baseInputs, selectedCard: "sapphire-reserve" });
    expect(result.redFlags).toEqual(expect.arrayContaining([expect.stringContaining("High affiliate payout")]));
  });

  it("identifies red flags for excessive point valuations", () => {
    const result = calculate(baseInputs); // CSP has TPG valuation of 2.0 (>= 2.0)
    expect(result.redFlags).toEqual(expect.arrayContaining([expect.stringContaining("TPG values Chase points at 2cpp")]));
  });
});
