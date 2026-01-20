
export enum BiltCardTier {
  BLUE = 'Blue',
  OBSIDIAN = 'Obsidian',
  PALLADIUM = 'Palladium'
}

export enum RewardMode {
  MULTIPLIER = 'Multiplier',
  BILT_CASH = 'Bilt Cash'
}

export interface BiltCardData {
  tier: BiltCardTier;
  annualFee: number;
  welcomeBonusCash: number;
  welcomeBonusPoints: number;
  welcomeBonusSpendRequirement: number; // New field for qualification logic
  hotelCredit: number;
  annualBiltCash: number;
  diningMultiplier: number;
  groceryMultiplier: number;
  groceryAnnualCap: number; // Annual cap on grocery spend eligible for bonus multiplier (Obsidian: $25k)
  travelMultiplier: number;
  everythingElseMultiplier: number;
}

export interface CalculationResult {
  cardTier: BiltCardTier;
  annualPointsEarned: number; // Actual points earned per year (not dollar value)
  netValueYear1: number; // Dollar value including welcome bonus
  netValueYear2: number; // Dollar value for Year 2+ (recurring)
  rentPointsUnlockedMonthly: number; // For Bilt Cash mode
  rentMultiplier: number; // For Multiplier mode
  annualBiltCashProfit: number; // Tracks the 4% cash generated (minus usage for rent in Mode 2)
  isUnlockedFully: boolean;
  qualifiedForBonus: boolean;
}
