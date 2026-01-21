import type { FilingStatus, LoanType } from "./types";

export const POVERTY_GUIDELINE_2026 = {
  baseAmount: 15650,
  perPerson: 5520,
};

export const IDR_PLANS = {
  ibr: {
    name: "Income-Based Repayment (IBR)",
    paymentPercent: 0.15,
    paymentPercentNew: 0.1,
    forgivenessYears: 25,
    forgivenessYearsNew: 20,
    povertyMultiplier: 1.5, // 150% of poverty line
    available: true,
    closingDate: null,
  },
  icr: {
    name: "Income-Contingent Repayment (ICR)",
    paymentPercent: 0.2,
    forgivenessYears: 25,
    povertyMultiplier: 1.0, // 100% of poverty line for ICR
    available: true,
    closingDate: "2028-07-01",
  },
  paye: {
    name: "Pay As You Earn (PAYE)",
    paymentPercent: 0.1,
    forgivenessYears: 20,
    povertyMultiplier: 1.5, // 150% of poverty line
    available: true,
    closingDate: "2027-07-01",
  },
  save: {
    name: "Saving on a Valuable Education (SAVE)",
    paymentPercent: 0.1, // 5% for undergrad, 10% for grad (simplified to 10%)
    forgivenessYears: 20,
    povertyMultiplier: 2.25, // 225% of poverty line for SAVE
    available: false,
    closingDate: "2025-12-31",
  },
  rap: {
    name: "Repayment Assistance Plan (RAP)",
    // RAP uses AGI-based sliding scale (1%-10%), not discretionary income
    // This is handled specially in calculations.ts
    paymentPercent: 0.1, // Max rate (not used directly - see RAP_AGI_BRACKETS)
    forgivenessYears: 30,
    minimumMonthlyPayment: 10, // $10 minimum
    dependentDeduction: 50, // $50 per dependent reduction
    povertyMultiplier: 1.0, // Not used for RAP but included for type consistency
    available: true,
    availableDate: "2026-07-01",
  },
} as const;

// RAP payment percentage brackets based on AGI
// Payment = (AGI * percentage) / 12 - ($50 * dependents), minimum $10
export const RAP_AGI_BRACKETS = [
  { maxAGI: 10000, percent: 0 }, // $10 minimum applies
  { maxAGI: 20000, percent: 0.01 },
  { maxAGI: 30000, percent: 0.02 },
  { maxAGI: 40000, percent: 0.03 },
  { maxAGI: 50000, percent: 0.04 },
  { maxAGI: 60000, percent: 0.05 },
  { maxAGI: 70000, percent: 0.06 },
  { maxAGI: 80000, percent: 0.07 },
  { maxAGI: 90000, percent: 0.08 },
  { maxAGI: 100000, percent: 0.09 },
  { maxAGI: Infinity, percent: 0.1 },
] as const;

// Reference year for calculations to avoid SSR hydration issues
export const REFERENCE_YEAR = 2026;

export const STANDARD_PLAN = {
  name: "Standard (10-year)",
  termYears: 10,
};

export const GRADUATED_PLAN = {
  name: "Graduated (10-year)",
  termYears: 10,
  startFactor: 0.5,
  endFactor: 1.5,
  stepMonths: 24,
};

export const EXTENDED_PLAN = {
  name: "Extended (25-year)",
  termYears: 25,
  minBalance: 30000,
};

export const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head_of_household", label: "Head of household" },
];

export const LOAN_TYPE_OPTIONS: Array<{ value: LoanType; label: string }> = [
  { value: "direct", label: "Direct Loans" },
  { value: "ffel", label: "FFEL Loans" },
  { value: "perkins", label: "Perkins Loans" },
  { value: "parent_plus", label: "Parent PLUS Loans" },
];

export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05,
  AK: 0,
  AZ: 0.025,
  AR: 0.049,
  CA: 0.093,
  CO: 0.044,
  CT: 0.05,
  DC: 0.085,
  DE: 0.055,
  FL: 0,
  GA: 0.053,
  HI: 0.0825,
  IA: 0.038,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0315,
  KS: 0.052,
  KY: 0.045,
  LA: 0.0425,
  MA: 0.05,
  MD: 0.0575,
  ME: 0.0715,
  MI: 0.0425,
  MN: 0.0785,
  MO: 0.0495,
  MS: 0.05,
  MT: 0.059,
  NC: 0.045,
  ND: 0.029,
  NE: 0.0535,
  NH: 0,
  NJ: 0.0637,
  NM: 0.049,
  NV: 0,
  NY: 0.0685,
  OH: 0.0395,
  OK: 0.0475,
  OR: 0.0875,
  PA: 0.0307,
  RI: 0.0599,
  SC: 0.064,
  SD: 0,
  TN: 0,
  TX: 0,
  UT: 0.0485,
  VA: 0.0575,
  VT: 0.081,
  WA: 0,
  WI: 0.053,
  WV: 0.0482,
  WY: 0,
};

export const STATE_OPTIONS = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DC", label: "District of Columbia" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "IA", label: "Iowa" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "MA", label: "Massachusetts" },
  { value: "MD", label: "Maryland" },
  { value: "ME", label: "Maine" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MO", label: "Missouri" },
  { value: "MS", label: "Mississippi" },
  { value: "MT", label: "Montana" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "NE", label: "Nebraska" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NV", label: "Nevada" },
  { value: "NY", label: "New York" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VA", label: "Virginia" },
  { value: "VT", label: "Vermont" },
  { value: "WA", label: "Washington" },
  { value: "WI", label: "Wisconsin" },
  { value: "WV", label: "West Virginia" },
  { value: "WY", label: "Wyoming" },
];

export const KEY_DEADLINES = [
  {
    date: "2025-12-31",
    action: "SAVE plan ends; new enrollments close.",
  },
  {
    date: "2026-07-01",
    action: "RAP launches + Parent PLUS consolidation deadline.",
  },
  {
    date: "2027-07-01",
    action: "PAYE closes to new borrowers.",
  },
  {
    date: "2028-07-01",
    action: "ICR closes to new borrowers.",
  },
];
