import type {
  CalculatorInputs,
  CalculatorResults,
  CreditCard,
  ValueComparison,
} from "./types";

export const DEFAULT_CARDS: CreditCard[] = [
  {
    id: "sapphire-preferred",
    name: "Chase Sapphire Preferred",
    issuer: "Chase",
    annualFee: 95,
    signUpBonus: { points: 60000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 3, travel: 2, groceries: 1, other: 1 },
    credits: [{ name: "$50 Hotel Credit", value: 50, usability: 70 }],
    valuations: { tpg: 2.0, conservative: 1.25, optimistic: 1.5 },
    estimatedAffiliatePayout: 175,
    tpgRanking: 1,
  },
  {
    id: "sapphire-reserve",
    name: "Chase Sapphire Reserve",
    issuer: "Chase",
    annualFee: 550,
    signUpBonus: { points: 60000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 3, travel: 3, groceries: 1, other: 1 },
    credits: [{ name: "$300 Travel Credit", value: 300, usability: 90 }],
    valuations: { tpg: 2.0, conservative: 1.5, optimistic: 1.75 },
    estimatedAffiliatePayout: 350,
  },
  {
    id: "amex-gold",
    name: "American Express Gold",
    issuer: "Amex",
    annualFee: 250,
    signUpBonus: { points: 60000, spendRequired: 6000, timeframe: 6 },
    earnRates: { dining: 4, travel: 3, groceries: 4, other: 1 },
    credits: [
      { name: "$120 Uber Credits", value: 120, usability: 80 },
      { name: "$120 Dining Credits", value: 120, usability: 70 },
    ],
    valuations: { tpg: 2.0, conservative: 1.1, optimistic: 1.5 },
    estimatedAffiliatePayout: 175,
  },
  {
    id: "amex-platinum",
    name: "American Express Platinum",
    issuer: "Amex",
    annualFee: 695,
    signUpBonus: { points: 80000, spendRequired: 8000, timeframe: 6 },
    earnRates: { dining: 1, travel: 5, groceries: 1, other: 1 },
    credits: [
      { name: "$200 Airline Fee Credit", value: 200, usability: 50 },
      { name: "$200 Hotel Credit", value: 200, usability: 50 },
      { name: "$200 Uber Credits", value: 200, usability: 80 },
      { name: "$240 Entertainment", value: 240, usability: 60 },
      { name: "$100 Saks Credit", value: 100, usability: 30 },
    ],
    valuations: { tpg: 2.0, conservative: 1.1, optimistic: 1.5 },
    estimatedAffiliatePayout: 450,
  },
  {
    id: "venture-x",
    name: "Capital One Venture X",
    issuer: "Capital One",
    annualFee: 395,
    signUpBonus: { points: 75000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 2, travel: 2, groceries: 2, other: 2 },
    credits: [
      { name: "$300 Travel Credit", value: 300, usability: 85 },
      { name: "10K Anniversary Bonus", value: 100, usability: 100 },
    ],
    valuations: { tpg: 1.85, conservative: 0.9, optimistic: 1.0 },
    estimatedAffiliatePayout: 350,
  },
  {
    id: "citi-premier",
    name: "Citi Premier",
    issuer: "Citi",
    annualFee: 95,
    signUpBonus: { points: 60000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 3, travel: 3, groceries: 3, other: 1 },
    credits: [],
    valuations: { tpg: 1.7, conservative: 1.0, optimistic: 1.25 },
    estimatedAffiliatePayout: 150,
  },
];

export function getCards(cards?: CreditCard[]): CreditCard[] {
  return cards && cards.length > 0 ? cards : DEFAULT_CARDS;
}

export function calculate(
  inputs: CalculatorInputs,
  cards: CreditCard[] = DEFAULT_CARDS
): CalculatorResults {
  const { selectedCard, spending, redemptionStyle } = inputs;

  const card = cards.find((entry) => entry.id === selectedCard) ?? cards[0];
  if (!card) {
    throw new Error("No cards available for analysis.");
  }

  const annualSpending = {
    dining: spending.dining * 12,
    travel: spending.travel * 12,
    groceries: spending.groceries * 12,
    other: spending.other * 12,
  };

  const annualPointsEarned =
    annualSpending.dining * card.earnRates.dining +
    annualSpending.travel * card.earnRates.travel +
    annualSpending.groceries * card.earnRates.groceries +
    annualSpending.other * card.earnRates.other;

  const tpgPointValue = card.valuations.tpg;
  const tpgAnnualRewardsValue = (annualPointsEarned * tpgPointValue) / 100;
  const tpgCreditsValue = card.credits.reduce((sum, credit) => sum + credit.value, 0);
  const tpgTotalValue = tpgAnnualRewardsValue + tpgCreditsValue;
  const tpgNetValue = tpgTotalValue - card.annualFee;

  let ourPointValue: number;
  switch (redemptionStyle) {
    case "cashBack":
      ourPointValue = 1.0;
      break;
    case "portal":
      ourPointValue = card.valuations.conservative;
      break;
    case "transfers":
      ourPointValue = card.valuations.optimistic;
      break;
    default:
      ourPointValue = card.valuations.conservative;
  }

  const ourAnnualRewardsValue = (annualPointsEarned * ourPointValue) / 100;
  const ourCreditsValue = card.credits.reduce(
    (sum, credit) => sum + (credit.value * credit.usability) / 100,
    0,
  );
  const ourTotalValue = ourAnnualRewardsValue + ourCreditsValue;
  const ourNetValue = ourTotalValue - card.annualFee;

  const valueDifference = tpgNetValue - ourNetValue;
  const percentageInflation =
    ourTotalValue > 0 ? ((tpgTotalValue - ourTotalValue) / ourTotalValue) * 100 : 0;

  const affiliateAsPercentOfFee =
    card.annualFee > 0
      ? (card.estimatedAffiliatePayout / card.annualFee) * 100
      : 0;

  const comparisons: ValueComparison[] = [
    {
      label: "Point Valuation",
      tpgValue: tpgPointValue,
      ourValue: ourPointValue,
      difference: tpgPointValue - ourPointValue,
      percentInflated:
        ourPointValue > 0
          ? ((tpgPointValue - ourPointValue) / ourPointValue) * 100
          : 0,
    },
    {
      label: "Annual Rewards Value",
      tpgValue: tpgAnnualRewardsValue,
      ourValue: ourAnnualRewardsValue,
      difference: tpgAnnualRewardsValue - ourAnnualRewardsValue,
      percentInflated:
        ourAnnualRewardsValue > 0
          ? ((tpgAnnualRewardsValue - ourAnnualRewardsValue) /
              ourAnnualRewardsValue) *
            100
          : 0,
    },
    {
      label: "Credits Value",
      tpgValue: tpgCreditsValue,
      ourValue: ourCreditsValue,
      difference: tpgCreditsValue - ourCreditsValue,
      percentInflated:
        ourCreditsValue > 0
          ? ((tpgCreditsValue - ourCreditsValue) / ourCreditsValue) * 100
          : 0,
    },
    {
      label: "Net Annual Value",
      tpgValue: tpgNetValue,
      ourValue: ourNetValue,
      difference: valueDifference,
      percentInflated:
        ourNetValue !== 0
          ? ((tpgNetValue - ourNetValue) / Math.abs(ourNetValue)) * 100
          : 0,
    },
  ];

  const redFlags: string[] = [];

  if (card.estimatedAffiliatePayout > 300) {
    redFlags.push(
      `High affiliate payout (~$${card.estimatedAffiliatePayout}) may influence recommendations`,
    );
  }

  if (tpgPointValue >= 2.0) {
    redFlags.push(
      `TPG values ${card.issuer} points at ${tpgPointValue}cpp—most people get far less`,
    );
  }

  if (percentageInflation > 50) {
    redFlags.push(
      `TPG's valuation is ${Math.round(percentageInflation)}% higher than conservative estimates`,
    );
  }

  if (card.credits.length > 3) {
    redFlags.push("Many credits that may be hard to fully use");
  }

  const lowUsabilityCredits = card.credits.filter((credit) => credit.usability < 60);
  if (lowUsabilityCredits.length > 0) {
    redFlags.push(
      `${lowUsabilityCredits.length} credit(s) with <60% usability for most people`,
    );
  }

  const considerations: string[] = [];

  if (ourNetValue < 0) {
    considerations.push(
      `Based on your spending, this card may cost you $${Math.round(-ourNetValue)}/year`,
    );
  } else {
    considerations.push(
      `Realistic net value: $${Math.round(ourNetValue)}/year (vs TPG's $${Math.round(
        tpgNetValue,
      )})`,
    );
  }

  if (redemptionStyle === "cashBack") {
    considerations.push("You're using cash back valuation—the safest baseline");
  } else if (redemptionStyle === "transfers") {
    considerations.push("Transfer partner value requires research and flexibility");
  }

  considerations.push(
    `Estimated affiliate payout: $${card.estimatedAffiliatePayout} (${Math.round(
      affiliateAsPercentOfFee,
    )}% of annual fee)`,
  );

  return {
    card,
    annualPointsEarned,
    tpgPointValue,
    tpgAnnualRewardsValue,
    tpgCreditsValue,
    tpgTotalValue,
    tpgNetValue,
    ourPointValue,
    ourAnnualRewardsValue,
    ourCreditsValue,
    ourTotalValue,
    ourNetValue,
    valueDifference,
    percentageInflation,
    estimatedAffiliatePayout: card.estimatedAffiliatePayout,
    affiliateAsPercentOfFee,
    comparisons,
    redFlags,
    considerations,
  };
}
