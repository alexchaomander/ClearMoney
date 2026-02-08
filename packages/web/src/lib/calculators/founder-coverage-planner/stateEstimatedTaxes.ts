import { nextBusinessDayDateOnlyUtc, type DateOnly } from "./dateUtils";

export type StateEstimatedTaxRule = {
  stateCode: string;
  label: string;
  // Date-only strings (YYYY-MM-DD). We'll shift for weekends/holidays using federal rules.
  dueDates: (taxYear: number) => Array<{ date: DateOnly; label: string; note: string }>;
  lastVerified: string; // YYYY-MM-DD
  sources: string[]; // human-readable; not URLs
};

const LAST_VERIFIED = "2026-02-08";

function buildAprJunSepJanSchedule(args: {
  stateCode: string;
  taxYear: number;
}): Array<{ date: DateOnly; label: string; note: string }> {
  const { stateCode, taxYear } = args;
  return [
    {
      date: nextBusinessDayDateOnlyUtc(`${taxYear}-04-15`),
      label: `${stateCode} Q1 estimated tax due`,
      note: "Typically April 15.",
    },
    {
      date: nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`),
      label: `${stateCode} Q2 estimated tax due`,
      note: "Typically June 15.",
    },
    {
      date: nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`),
      label: `${stateCode} Q3 estimated tax due`,
      note: "Typically September 15.",
    },
    {
      date: nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`),
      label: `${stateCode} Q4 estimated tax due`,
      note: "Typically January 15.",
    },
  ];
}

// As of 2026-02-08. (NH only taxes interest/dividends; excluded here.)
const NO_STATE_INCOME_TAX_STATES = new Set(["AK", "FL", "NV", "SD", "TN", "TX", "WA", "WY"]);

// Verified 2026-02-08 by checking state revenue sites. See sources strings.
const RULES: Record<string, StateEstimatedTaxRule> = {
  CA: {
    stateCode: "CA",
    label: "California",
    dueDates: (taxYear) => [
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-04-15`), label: "CA Q1 estimated tax due", note: "Typically April 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`), label: "CA Q2 estimated tax due", note: "Typically June 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`), label: "CA Q3 estimated tax due", note: "Typically September 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`), label: "CA Q4 estimated tax due", note: "Typically January 15." },
    ],
    lastVerified: LAST_VERIFIED,
    sources: [
      "California Franchise Tax Board: Estimated tax payments (Forms 540-ES / 100-ES).",
    ],
  },
  MA: {
    stateCode: "MA",
    label: "Massachusetts",
    dueDates: (taxYear) => [
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-04-15`), label: "MA Q1 estimated tax due", note: "Typically April 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`), label: "MA Q2 estimated tax due", note: "Typically June 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`), label: "MA Q3 estimated tax due", note: "Typically September 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`), label: "MA Q4 estimated tax due", note: "Typically January 15." },
    ],
    lastVerified: LAST_VERIFIED,
    sources: [
      "Massachusetts DOR: Estimated income tax payment due dates (Form 1-ES / 1-NR/PY-ES).",
    ],
  },
  NY: {
    stateCode: "NY",
    label: "New York",
    dueDates: (taxYear) => [
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-04-15`), label: "NY Q1 estimated tax due", note: "Typically April 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`), label: "NY Q2 estimated tax due", note: "Typically June 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`), label: "NY Q3 estimated tax due", note: "Typically September 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`), label: "NY Q4 estimated tax due", note: "Typically January 15." },
    ],
    lastVerified: LAST_VERIFIED,
    sources: [
      "New York Department of Taxation and Finance: Estimated tax (IT-2105).",
    ],
  },
  IL: {
    stateCode: "IL",
    label: "Illinois",
    dueDates: (taxYear) => [
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-04-15`), label: "IL Q1 estimated tax due", note: "Typically April 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`), label: "IL Q2 estimated tax due", note: "Typically June 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`), label: "IL Q3 estimated tax due", note: "Typically September 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`), label: "IL Q4 estimated tax due", note: "Typically January 15." },
    ],
    lastVerified: LAST_VERIFIED,
    sources: [
      "Illinois Department of Revenue: Estimated income tax payments due dates (IL-1040-ES).",
    ],
  },
  CO: {
    stateCode: "CO",
    label: "Colorado",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "CO", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "Colorado Department of Revenue: Individual income tax estimated payments.",
    ],
  },
  CT: {
    stateCode: "CT",
    label: "Connecticut",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "CT", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "Connecticut Department of Revenue Services: Estimated income tax payments (Informational Publication).",
    ],
  },
  GA: {
    stateCode: "GA",
    label: "Georgia",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "GA", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "Georgia Department of Revenue: Pay estimated tax.",
    ],
  },
  NC: {
    stateCode: "NC",
    label: "North Carolina",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "NC", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "North Carolina Department of Revenue: Estimated income tax payments.",
    ],
  },
  NJ: {
    stateCode: "NJ",
    label: "New Jersey",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "NJ", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "New Jersey Division of Taxation: Estimated payments.",
    ],
  },
  OR: {
    stateCode: "OR",
    label: "Oregon",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "OR", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "Oregon Department of Revenue: Gig work (includes estimated tax due dates).",
    ],
  },
  PA: {
    stateCode: "PA",
    label: "Pennsylvania",
    dueDates: (taxYear) => buildAprJunSepJanSchedule({ stateCode: "PA", taxYear }),
    lastVerified: LAST_VERIFIED,
    sources: [
      "Pennsylvania Department of Revenue: Personal income tax guide (estimated payments).",
    ],
  },
  VA: {
    stateCode: "VA",
    label: "Virginia",
    dueDates: (taxYear) => [
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-05-01`), label: "VA Q1 estimated tax due", note: "Typically May 1." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`), label: "VA Q2 estimated tax due", note: "Typically June 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`), label: "VA Q3 estimated tax due", note: "Typically September 15." },
      { date: nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`), label: "VA Q4 estimated tax due", note: "Typically January 15." },
    ],
    lastVerified: LAST_VERIFIED,
    sources: [
      "Code of Virginia: Individual estimated tax installments due dates (58.1-492).",
    ],
  },
};

export function isNoStateIncomeTaxState(stateCode: string): boolean {
  const normalized = stateCode.trim().toUpperCase();
  return NO_STATE_INCOME_TAX_STATES.has(normalized);
}

export function getStateEstimatedTaxRule(stateCode: string): StateEstimatedTaxRule | null {
  const normalized = stateCode.trim().toUpperCase();
  return RULES[normalized] ?? null;
}
