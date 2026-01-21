import type { FilingStatus } from "./types";

export const PRIMARY_COLOR = "#10b981";

export const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
];

export const MARGINAL_RATE_OPTIONS = [
  { value: 0.1, label: "10%" },
  { value: 0.12, label: "12%" },
  { value: 0.22, label: "22%" },
  { value: 0.24, label: "24%" },
  { value: 0.32, label: "32%" },
  { value: 0.35, label: "35%" },
  { value: 0.37, label: "37%" },
];

export const SENIOR_DEDUCTION_AMOUNT = 6000;
export const SENIOR_DEDUCTION_PHASEOUT_START: Record<FilingStatus, number> = {
  single: 75000,
  married: 150000,
  head_of_household: 112500,
};
export const SENIOR_DEDUCTION_PHASEOUT_RANGE = 15000;

export const TIPS_DEDUCTION_MAX = 25000;

export const OVERTIME_DEDUCTION_MAX: Record<FilingStatus, number> = {
  single: 12500,
  married: 25000,
  head_of_household: 12500,
};
export const OVERTIME_PHASEOUT_START: Record<FilingStatus, number> = {
  single: 150000,
  married: 300000,
  head_of_household: 225000,
};
export const OVERTIME_PHASEOUT_RANGE = 25000;

export const CAR_LOAN_DEDUCTION_MAX = 10000;
export const CAR_LOAN_PHASEOUT_START: Record<FilingStatus, number> = {
  single: 100000,
  married: 200000,
  head_of_household: 150000,
};
export const CAR_LOAN_PHASEOUT_RANGE = 25000;

export const OLD_SALT_CAP = 10000;
export const NEW_SALT_CAP = 40000;

export const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 15000,
  married: 30000,
  head_of_household: 22500,
};

export const TIMELINE_YEARS = ["2025", "2026", "2027", "2028"]; 
