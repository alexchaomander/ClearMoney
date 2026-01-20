
import { BiltCardTier, BiltCardData } from './types';

export const POINT_VALUATION = 0.022; // 2.2 cents per TPG
export const BILT_CASH_UNLOCK_RATIO = 0.03; // 3% of housing payment in Bilt Cash for full points
export const BILT_CASH_EARN_RATE = 0.04; // 4% Bilt Cash on everyday spend
export const ASSUME_MIN_SPEND_MET_TEXT = "Calculations assume you meet the minimum spend requirements to unlock all Welcome Bonuses.";

// Base points earned on rent when below 25% spend threshold (per month)
export const BASE_RENT_POINTS_MONTHLY = 250;

export const BILT_CARDS: Record<BiltCardTier, BiltCardData> = {
  [BiltCardTier.BLUE]: {
    tier: BiltCardTier.BLUE,
    annualFee: 0,
    welcomeBonusCash: 100, // $100 Bilt Cash Sign-up
    welcomeBonusPoints: 0,
    welcomeBonusSpendRequirement: 0,
    hotelCredit: 0,
    annualBiltCash: 0,
    diningMultiplier: 1,
    groceryMultiplier: 1,
    groceryAnnualCap: Infinity, // No cap for Blue
    travelMultiplier: 1,
    everythingElseMultiplier: 1,
  },
  [BiltCardTier.OBSIDIAN]: {
    tier: BiltCardTier.OBSIDIAN,
    annualFee: 95,
    welcomeBonusCash: 200, // $200 Bilt Cash Sign-up
    welcomeBonusPoints: 0,
    welcomeBonusSpendRequirement: 0,
    hotelCredit: 100,
    annualBiltCash: 0,
    // Obsidian: Choose 3x on EITHER dining OR grocery (not both)
    // Calculator assumes optimal choice (whichever has higher spend)
    diningMultiplier: 3, // If dining is chosen as 3x category
    groceryMultiplier: 3, // If grocery is chosen as 3x category
    groceryAnnualCap: 25000, // $25k/year cap on grocery bonus
    travelMultiplier: 2,
    everythingElseMultiplier: 1,
  },
  [BiltCardTier.PALLADIUM]: {
    tier: BiltCardTier.PALLADIUM,
    annualFee: 495,
    welcomeBonusCash: 300, // $300 Bilt Cash Sign-up
    welcomeBonusPoints: 50000, // 50k points (Req $4k spend/3mo)
    welcomeBonusSpendRequirement: 4000,
    hotelCredit: 400,
    annualBiltCash: 200, // $200 annual Bilt Cash
    diningMultiplier: 2,
    groceryMultiplier: 2,
    groceryAnnualCap: Infinity, // No cap for Palladium
    travelMultiplier: 2,
    everythingElseMultiplier: 2,
  }
};

export const CARD_BENEFITS_TEXT = {
  common: {
    rent: "All Bilt Cards can earn up to 1X points on rent and mortgage payments, with no transaction fees.",
    biltCash: "All three Bilt Cards earn 4% back in Bilt Cash on everyday purchases (excluding rent/mortgage).",
    apr: "Get a 10% introductory APR on new eligible purchases for up to 12 payment periods. After that, a variable APR of 26.74% – 34.74% applies.",
    fx: "No foreign transaction fees on any of the Bilt Cards."
  },
  [BiltCardTier.BLUE]: {
    headline: "The Foundation",
    description: "A no annual fee card that turns your rent, mortgage, and everyday spend into valuable rewards.",
    highlights: [
      "No Annual Fee ($0)",
      "Welcome Bonus: $100 Bilt Cash",
      "1X Points on Everyday Purchases",
      "Earn 4% back in Bilt Cash on everyday spend"
    ]
  },
  [BiltCardTier.OBSIDIAN]: {
    headline: "The Strategist",
    description: "Designed for members who want more control over their rewards with selectable bonus categories.",
    highlights: [
      "$95 Annual Fee",
      "Welcome Bonus: $200 Bilt Cash",
      "Choose 3X Category: Dining OR Grocery (Grocery up to $25k/yr)",
      "$100 Bilt Hotel Credit",
      "2X Points on Travel"
    ]
  },
  [BiltCardTier.PALLADIUM]: {
    headline: "The Powerhouse",
    description: "The premium card offering over $1,000 in annual value with high-value rewards and elevated benefits.",
    highlights: [
      "$495 Annual Fee",
      "Welcome Bonus: 50k Points + $300 Bilt Cash",
      "2X Points on EVERYTHING (excluding rent)",
      "$200 Annual Bilt Cash + $400 Hotel Credit",
      "Priority Pass™ Select Lounge Access"
    ]
  }
};
