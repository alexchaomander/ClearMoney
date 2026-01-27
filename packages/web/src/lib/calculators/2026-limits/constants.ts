import type { ReferenceLimitsByCategory } from "./types";

export const LIMITS_2026 = {
  deferral401k: 24500,
  catchUp50Plus: 8000,
  catchUp60to63: 11250,
  total415Limit: 72000,
  iraLimit: 7500,
  iraCatchUp50Plus: 1100,
  hsaSelf: 4400,
  hsaFamily: 8750,
  hsaCatchUp55Plus: 1000,
  healthFSA: 3350,
  dependentCareFSA: 5000,
  limitedPurposeFSA: 3350,
  simpleIRA: 17000,
  simpleCatchUp50Plus: 4000,
  simpleCatchUp60to63: 5250,
  sepIRA: 72000,
  solo401kEmployee: 24500,
  solo401kTotal: 72000,
  coverdell: 2000,
  afterTax401kLimit: 3300,
} as const;

export const LIMITS_2025 = {
  deferral401k: 23500,
  iraLimit: 7000,
  hsaFamily: 8550,
  simpleIRA: 16500,
} as const;

export const IRA_PHASEOUTS_2026 = {
  traditional: {
    single: { start: 81000, end: 91000 },
    married: { start: 129000, end: 149000 },
  },
  roth: {
    single: { start: 153000, end: 168000 },
    married: { start: 242000, end: 252000 },
  },
} as const;

export const KEY_DATES_2026 = [
  { date: "January 1, 2026", description: "New contribution limits take effect" },
  { date: "April 15, 2026", description: "Deadline for 2025 IRA contributions" },
  { date: "April 15, 2026", description: "Deadline for 2025 HSA contributions" },
  { date: "October 15, 2026", description: "Extended IRA recharacterization deadline" },
  { date: "December 31, 2026", description: "Deadline for 2026 401(k) contributions" },
  {
    date: "December 31, 2026",
    description: "Deadline for 2026 FSA spending (plan-specific grace periods may apply)",
  },
] as const;

export const REFERENCE_LIMITS_2026: ReferenceLimitsByCategory = {
  retirement: [
    {
      accountType: "401(k)",
      baseLimit: LIMITS_2026.deferral401k,
      catchUp50: LIMITS_2026.catchUp50Plus,
      catchUp60: LIMITS_2026.catchUp60to63,
      notes: "Employee deferral limit.",
    },
    {
      accountType: "403(b)",
      baseLimit: LIMITS_2026.deferral401k,
      catchUp50: LIMITS_2026.catchUp50Plus,
      catchUp60: LIMITS_2026.catchUp60to63,
      notes: "Same deferral limits as 401(k).",
    },
    {
      accountType: "457(b)",
      baseLimit: LIMITS_2026.deferral401k,
      catchUp50: LIMITS_2026.catchUp50Plus,
      catchUp60: LIMITS_2026.catchUp60to63,
      notes: "Governmental 457(b) plans match 401(k) deferral limits.",
    },
    {
      accountType: "Traditional IRA",
      baseLimit: LIMITS_2026.iraLimit,
      catchUp50: LIMITS_2026.iraCatchUp50Plus,
      notes: "Combined limit across Traditional + Roth IRA.",
    },
    {
      accountType: "Roth IRA",
      baseLimit: LIMITS_2026.iraLimit,
      catchUp50: LIMITS_2026.iraCatchUp50Plus,
      notes: "Income phase-outs apply.",
    },
    {
      accountType: "SIMPLE IRA",
      baseLimit: LIMITS_2026.simpleIRA,
      catchUp50: LIMITS_2026.simpleCatchUp50Plus,
      catchUp60: LIMITS_2026.simpleCatchUp60to63,
      notes: "Super catch-up applies ages 60-63.",
    },
    {
      accountType: "SEP IRA",
      baseLimit: LIMITS_2026.sepIRA,
      notes: "Limited to 25% of compensation.",
    },
    {
      accountType: "Solo 401(k) employee",
      baseLimit: LIMITS_2026.solo401kEmployee,
      catchUp50: LIMITS_2026.catchUp50Plus,
      catchUp60: LIMITS_2026.catchUp60to63,
      notes: "Employee deferral portion.",
    },
    {
      accountType: "Total 415(c) limit",
      baseLimit: LIMITS_2026.total415Limit,
      notes: "Employee + employer annual additions cap.",
    },
  ],
  health: [
    {
      accountType: "HSA (self-only)",
      baseLimit: LIMITS_2026.hsaSelf,
      catchUp50: LIMITS_2026.hsaCatchUp55Plus,
      notes: "Catch-up applies at age 55+.",
    },
    {
      accountType: "HSA (family)",
      baseLimit: LIMITS_2026.hsaFamily,
      catchUp50: LIMITS_2026.hsaCatchUp55Plus,
      notes: "Catch-up applies at age 55+.",
    },
    {
      accountType: "Health FSA",
      baseLimit: LIMITS_2026.healthFSA,
    },
    {
      accountType: "Dependent Care FSA",
      baseLimit: LIMITS_2026.dependentCareFSA,
      notes: "$2,500 if married filing separately.",
    },
  ],
  education: [
    {
      accountType: "Coverdell ESA",
      baseLimit: LIMITS_2026.coverdell,
      notes: "Per beneficiary.",
    },
    {
      accountType: "529 Plan",
      baseLimit: 0,
      notes: "No federal limit; state rules apply.",
    },
  ],
};

export const YEAR_OVER_YEAR_ACCOUNTS = [
  {
    accountType: "401(k) employee deferral",
    limit2025: LIMITS_2025.deferral401k,
    limit2026: LIMITS_2026.deferral401k,
  },
  {
    accountType: "Traditional/Roth IRA",
    limit2025: LIMITS_2025.iraLimit,
    limit2026: LIMITS_2026.iraLimit,
  },
  {
    accountType: "HSA (family)",
    limit2025: LIMITS_2025.hsaFamily,
    limit2026: LIMITS_2026.hsaFamily,
  },
  {
    accountType: "SIMPLE IRA",
    limit2025: LIMITS_2025.simpleIRA,
    limit2026: LIMITS_2026.simpleIRA,
  },
] as const;

export const MANDATORY_ROTH_CATCHUP_INCOME = 150000;
