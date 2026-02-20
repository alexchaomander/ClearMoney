import { IRMAA_BRACKETS_2026 } from "../medicare-irmaa/constants";
import type { IRMAABracketRaw } from "../medicare-irmaa/types";
import type { FilingStatus } from "./types";

// Re-export IRMAA brackets for Roth conversion IRMAA impact analysis.
// Maps our 4-status filing to the 3-status IRMAA bracket keys.
type IRMAAFilingStatus = "single" | "married" | "married_separate";

const FILING_STATUS_TO_IRMAA: Record<FilingStatus, IRMAAFilingStatus> = {
  single: "single",
  married: "married",
  married_separate: "married_separate",
  head_of_household: "single",
};

export function getIRMAABrackets(filingStatus: FilingStatus): IRMAABracketRaw[] {
  return IRMAA_BRACKETS_2026[FILING_STATUS_TO_IRMAA[filingStatus]];
}

// Projection end age
export const PROJECTION_END_AGE = 90;
