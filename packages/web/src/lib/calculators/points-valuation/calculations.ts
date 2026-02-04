import type {
  CalculatorInputs,
  CalculatorResults,
  HoldingValuation,
  PointsCurrency,
} from "./types";

export const DEFAULT_CURRENCIES: PointsCurrency[] = [
  {
    id: "chase-ur",
    name: "Chase Ultimate Rewards",
    shortName: "Chase UR",
    valuations: { tpg: 2.0, conservative: 1.25, moderate: 1.35, optimistic: 1.5 },
    methodology: {
      cashOut: 1.0,
      portalValue: 1.25,
      transferValue: "Hyatt transfers often yield 1.5-2cpp.",
    },
    bestUses: [
      "Hyatt transfers",
      "Pay Yourself Back",
      "Travel portal with Sapphire Reserve",
    ],
    worstUses: [
      "Amazon checkout (0.8cpp)",
      "Cash back without Sapphire",
    ],
  },
  {
    id: "amex-mr",
    name: "Amex Membership Rewards",
    shortName: "Amex MR",
    valuations: { tpg: 2.0, conservative: 1.1, moderate: 1.25, optimistic: 1.5 },
    methodology: {
      cashOut: 0.6,
      portalValue: 1.0,
      transferValue: "ANA/Virgin transfers can yield 1.5-2cpp.",
    },
    bestUses: [
      "Transfer to ANA",
      "Transfer to Virgin Atlantic",
      "Schwab cash out (1.1cpp)",
    ],
    worstUses: ["Statement credits", "Amazon (0.7cpp)"],
  },
  {
    id: "citi-ty",
    name: "Citi ThankYou Points",
    shortName: "Citi TY",
    valuations: { tpg: 1.7, conservative: 1.0, moderate: 1.1, optimistic: 1.25 },
    methodology: {
      cashOut: 1.0,
      portalValue: 1.0,
      transferValue: "Limited transfer partners; JetBlue can be solid.",
    },
    bestUses: ["Cash back", "JetBlue transfers", "Travel portal"],
    worstUses: ["Gift cards", "Merchandise"],
  },
  {
    id: "capital-one",
    name: "Capital One Miles",
    shortName: "Capital One",
    valuations: { tpg: 1.85, conservative: 0.85, moderate: 0.9, optimistic: 1.0 },
    methodology: {
      cashOut: 0.5,
      portalValue: 1.0,
      transferValue: "Some partners are 1:1, but value varies by route.",
    },
    bestUses: [
      "Erase travel purchases",
      "Select transfer partners at 1:1",
    ],
    worstUses: ["Cash out", "Gift cards"],
  },
  {
    id: "marriott",
    name: "Marriott Bonvoy",
    shortName: "Marriott",
    valuations: { tpg: 0.8, conservative: 0.6, moderate: 0.7, optimistic: 0.8 },
    methodology: {
      cashOut: null,
      portalValue: null,
      transferValue: "Transfers to airlines run about 3:1.",
    },
    bestUses: ["Off-peak hotel stays", "5th night free on 5-night stays"],
    worstUses: ["Peak pricing properties", "Airline transfers (3:1)"],
  },
  {
    id: "hilton",
    name: "Hilton Honors",
    shortName: "Hilton",
    valuations: { tpg: 0.5, conservative: 0.4, moderate: 0.45, optimistic: 0.5 },
    methodology: {
      cashOut: null,
      portalValue: null,
      transferValue: "Devalued over time, 5th night free helps.",
    },
    bestUses: ["Standard room redemptions", "5th night free"],
    worstUses: ["Premium properties", "Points + Cash"],
  },
  {
    id: "hyatt",
    name: "World of Hyatt",
    shortName: "Hyatt",
    valuations: { tpg: 1.7, conservative: 1.5, moderate: 1.7, optimistic: 1.9 },
    methodology: {
      cashOut: null,
      portalValue: null,
      transferValue: "Best hotel currency with consistent value.",
    },
    bestUses: ["Category 1-4 properties", "Suite upgrades"],
    worstUses: ["All-inclusive resorts (lower cpp)"],
  },
];

export function calculate(
  inputs: CalculatorInputs,
  currencies: PointsCurrency[] = DEFAULT_CURRENCIES
): CalculatorResults {
  const { holdings, redemptionStyle } = inputs;

  const holdingValuations: HoldingValuation[] = [];

  for (const currency of currencies) {
    const points = holdings[currency.id] || 0;
    if (points > 0) {
      const ourCpp = currency.valuations[redemptionStyle];
      const tpgCpp = currency.valuations.tpg;
      const ourValue = (points * ourCpp) / 100;
      const tpgValue = (points * tpgCpp) / 100;
      const difference = tpgValue - ourValue;
      const percentDifference = ourValue > 0 ? (difference / ourValue) * 100 : 0;

      holdingValuations.push({
        currency,
        points,
        ourValue,
        tpgValue,
        difference,
        percentDifference,
      });
    }
  }

  const totals = holdingValuations.reduce(
    (acc, holding) => ({
      ourValue: acc.ourValue + holding.ourValue,
      tpgValue: acc.tpgValue + holding.tpgValue,
      overvaluation: acc.overvaluation + holding.difference,
      percentOvervaluation: 0,
    }),
    { ourValue: 0, tpgValue: 0, overvaluation: 0, percentOvervaluation: 0 }
  );

  totals.percentOvervaluation =
    totals.ourValue > 0
      ? (totals.overvaluation / totals.ourValue) * 100
      : 0;

  return {
    holdings: holdingValuations,
    totals,
    currencies,
  };
}
