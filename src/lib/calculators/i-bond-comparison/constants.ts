// Current I Bond rates (Nov 2025 - Apr 2026)
// Source: https://www.treasurydirect.gov/savings-bonds/i-bonds/i-bonds-interest-rates/
export const CURRENT_RATES = {
  iBond: {
    fixedRate: 0.009, // 0.90% fixed rate
    inflationRate: 0.0312, // 3.12% annualized inflation rate (semiannual is 1.56%)
    compositeRate: 0.0403, // 4.03% composite rate
  },
  tips: {
    realYield: 0.013,
  },
  cd: {
    nominalRate: 0.04,
  },
};

export const I_BOND_RULES = {
  annualLimit: 10000,
  minHoldingMonths: 12,
  penaltyMonths: 3,
  penaltyExpiresYears: 5,
};

export const TAX_BRACKETS = [
  { label: "10%", value: 0.1 },
  { label: "12%", value: 0.12 },
  { label: "22%", value: 0.22 },
  { label: "24%", value: 0.24 },
  { label: "32%", value: 0.32 },
  { label: "35%", value: 0.35 },
  { label: "37%", value: 0.37 },
];

export const LIQUIDITY_SCORES = {
  iBondLocked: 0,
  iBond: 6,
  hysa: 10,
  tips: 5,
  cd: 4,
};
