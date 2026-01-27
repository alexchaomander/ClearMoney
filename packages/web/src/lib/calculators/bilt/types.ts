export enum BiltCardTier {
  BLUE = "Blue",
  OBSIDIAN = "Obsidian",
  PALLADIUM = "Palladium",
}

export enum RewardMode {
  MULTIPLIER = "Multiplier",
  BILT_CASH = "Bilt Cash",
}

export interface BiltCardData {
  tier: BiltCardTier;
  annualFee: number;
  welcomeBonusCash: number;
  welcomeBonusPoints: number;
  welcomeBonusSpendRequirement: number;
  hotelCredit: number;
  annualBiltCash: number;
  diningMultiplier: number;
  groceryMultiplier: number;
  groceryAnnualCap: number;
  travelMultiplier: number;
  everythingElseMultiplier: number;
}

export interface CalculationResult {
  cardTier: BiltCardTier;
  annualPointsEarned: number;
  netValueYear1: number;
  netValueYear2: number;
  rentPointsUnlockedMonthly: number;
  rentMultiplier: number;
  annualBiltCashProfit: number;
  isUnlockedFully: boolean;
  qualifiedForBonus: boolean;
}
