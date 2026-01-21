import type {
  FilingStatus,
  IRMAABracketRaw,
  LifeChangingEvent,
} from "./types";

export const BASE_PART_B_PREMIUM_2026 = 185.0;

export const IRMAA_BRACKETS_2026: Record<FilingStatus, IRMAABracketRaw[]> = {
  single: [
    { min: 0, max: 106000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 106001, max: 133000, partBSurcharge: 74.0, partDSurcharge: 13.7 },
    { min: 133001, max: 167000, partBSurcharge: 185.0, partDSurcharge: 35.3 },
    { min: 167001, max: 200000, partBSurcharge: 295.9, partDSurcharge: 57.0 },
    { min: 200001, max: 500000, partBSurcharge: 406.9, partDSurcharge: 78.6 },
    {
      min: 500001,
      max: Infinity,
      partBSurcharge: 443.9,
      partDSurcharge: 85.8,
    },
  ],
  married: [
    { min: 0, max: 212000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 212001, max: 266000, partBSurcharge: 74.0, partDSurcharge: 13.7 },
    { min: 266001, max: 334000, partBSurcharge: 185.0, partDSurcharge: 35.3 },
    { min: 334001, max: 400000, partBSurcharge: 295.9, partDSurcharge: 57.0 },
    { min: 400001, max: 750000, partBSurcharge: 406.9, partDSurcharge: 78.6 },
    {
      min: 750001,
      max: Infinity,
      partBSurcharge: 443.9,
      partDSurcharge: 85.8,
    },
  ],
  married_separate: [
    { min: 0, max: 106000, partBSurcharge: 0, partDSurcharge: 0 },
    { min: 106001, max: 394000, partBSurcharge: 406.9, partDSurcharge: 78.6 },
    {
      min: 394001,
      max: Infinity,
      partBSurcharge: 443.9,
      partDSurcharge: 85.8,
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
