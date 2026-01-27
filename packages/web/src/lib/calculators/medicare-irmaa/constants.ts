import type {
  FilingStatus,
  IRMAABracketRaw,
  LifeChangingEvent,
} from "./types";

// 2026 standard Part B premium per CMS (announced November 2025)
// Source: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
export const BASE_PART_B_PREMIUM_2026 = 202.9;

// 2026 IRMAA brackets per CMS (based on 2024 MAGI, 2-year lookback)
// Source: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
export const IRMAA_BRACKETS_2026: Record<FilingStatus, IRMAABracketRaw[]> = {
  single: [
    { min: 0, max: 109000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 109001, max: 137000, partBSurcharge: 81.2, partDSurcharge: 14.5 },
    { min: 137001, max: 171000, partBSurcharge: 202.9, partDSurcharge: 37.5 },
    { min: 171001, max: 205000, partBSurcharge: 324.6, partDSurcharge: 60.4 },
    { min: 205001, max: 499999, partBSurcharge: 446.3, partDSurcharge: 83.3 },
    {
      min: 500000,
      max: Infinity,
      partBSurcharge: 487.0,
      partDSurcharge: 91.0,
    },
  ],
  married: [
    { min: 0, max: 218000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 218001, max: 274000, partBSurcharge: 81.2, partDSurcharge: 14.5 },
    { min: 274001, max: 342000, partBSurcharge: 202.9, partDSurcharge: 37.5 },
    { min: 342001, max: 410000, partBSurcharge: 324.6, partDSurcharge: 60.4 },
    { min: 410001, max: 749999, partBSurcharge: 446.3, partDSurcharge: 83.3 },
    {
      min: 750000,
      max: Infinity,
      partBSurcharge: 487.0,
      partDSurcharge: 91.0,
    },
  ],
  married_separate: [
    { min: 0, max: 109000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 109001, max: 390999, partBSurcharge: 446.3, partDSurcharge: 83.3 },
    {
      min: 391000,
      max: Infinity,
      partBSurcharge: 487.0,
      partDSurcharge: 91.0,
    },
  ],
};

export const LIFE_CHANGING_EVENTS: Array<{
  code: LifeChangingEvent;
  description: string;
}> = [
  { code: "marriage", description: "Marriage" },
  { code: "divorce", description: "Divorce or annulment" },
  { code: "death_of_spouse", description: "Death of spouse" },
  {
    code: "work_stoppage",
    description: "Work stoppage (retirement, layoff)",
  },
  { code: "work_reduction", description: "Work reduction" },
  {
    code: "loss_of_pension",
    description: "Loss of income-producing property or pension",
  },
];

export const PROJECTION_GROWTH_RATE = 0.03;
