import type { FilingStatus } from "./types";

export const PRIMARY_COLOR = "#f97316";

export const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
];

export const METHOD_DETAILS: Record<
  string,
  { label: string; description: string }
> = {
  fifo: {
    label: "FIFO",
    description: "First in, first out (IRS default unless you specify otherwise).",
  },
  lifo: {
    label: "LIFO",
    description: "Last in, first out (sells your newest lots first).",
  },
  hifo: {
    label: "HIFO",
    description: "Highest in, first out (prioritizes highest cost basis lots).",
  },
  specificId: {
    label: "Specific ID",
    description: "Manually select lots for maximum tax flexibility.",
  },
};

export const FEDERAL_BRACKETS: Record<
  FilingStatus,
  Array<{ min: number; max: number; rate: number }>
> = {
  single: [
    { min: 0, max: 11600, rate: 0.1 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.1 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.1 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

export const LTCG_BRACKETS: Record<
  FilingStatus,
  Array<{ min: number; max: number; rate: number }>
> = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.2 },
  ],
  married: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.2 },
  ],
  head_of_household: [
    { min: 0, max: 63100, rate: 0 },
    { min: 63100, max: 551350, rate: 0.15 },
    { min: 551350, max: Infinity, rate: 0.2 },
  ],
};

export const NIIT_RATE = 0.038;
export const NIIT_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

export const STATE_RATES: Record<string, number> = {
  AL: 0.05,
  AK: 0,
  AZ: 0.025,
  AR: 0.047,
  CA: 0.133,
  CO: 0.044,
  CT: 0.0699,
  DE: 0.066,
  FL: 0,
  GA: 0.0549,
  HI: 0.11,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0315,
  IA: 0.06,
  KS: 0.057,
  KY: 0.04,
  LA: 0.0425,
  ME: 0.0715,
  MD: 0.0575,
  MA: 0.09,
  MI: 0.0425,
  MN: 0.0985,
  MS: 0.05,
  MO: 0.048,
  MT: 0.059,
  NE: 0.0664,
  NV: 0,
  NH: 0,
  NJ: 0.1075,
  NM: 0.059,
  NY: 0.109,
  NC: 0.0525,
  ND: 0.025,
  OH: 0.0399,
  OK: 0.0475,
  OR: 0.099,
  PA: 0.0307,
  RI: 0.0599,
  SC: 0.064,
  SD: 0,
  TN: 0,
  TX: 0,
  UT: 0.0465,
  VT: 0.0875,
  VA: 0.0575,
  WA: 0,
  WV: 0.0512,
  WI: 0.0765,
  WY: 0,
  DC: 0.1075,
};

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

export const STATE_OPTIONS = Object.keys(STATE_NAMES)
  .map((code) => ({
    code,
    name: STATE_NAMES[code],
    rate: STATE_RATES[code] ?? 0,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
