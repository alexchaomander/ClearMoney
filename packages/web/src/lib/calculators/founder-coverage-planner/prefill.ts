import type { BankAccount, BankTransaction, FinancialMemory } from "@clearmoney/strata-sdk";
import type { CalculatorInputs } from "./types";

export type FounderPrefillResult = {
  defaults: Partial<CalculatorInputs>;
  filledFields: string[];
  sources: {
    snapshot: boolean;
    memory: boolean;
    accounts: boolean;
  };
  hasRealData: boolean;
};

export type FounderPrefillArgs = {
  memory?: FinancialMemory | null;
  bankAccounts?: BankAccount[] | null;
  bankTransactions?: BankTransaction[] | null;
  now?: Date;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getQuarterForDate(date: Date): 1 | 2 | 3 | 4 {
  const m = date.getMonth(); // local month is fine for quarter.
  if (m <= 2) return 1;
  if (m <= 5) return 2;
  if (m <= 8) return 3;
  return 4;
}

function mapFilingStatus(
  memoryStatus: FinancialMemory["filing_status"]
): CalculatorInputs["filingStatus"] | null {
  if (!memoryStatus) return null;
  if (memoryStatus === "single" || memoryStatus === "head_of_household") return "single";
  if (memoryStatus.startsWith("married")) return "married";
  return null;
}

function looksBusinessAccount(
  account: Pick<BankAccount, "name" | "institution_name">
): boolean {
  const hay = `${account.institution_name ?? ""} ${account.name}`.toLowerCase();
  return (
    hay.includes("business") ||
    hay.includes("mercury") ||
    hay.includes("brex") ||
    hay.includes("relay") ||
    hay.includes("novo")
  );
}

const PERSONALISH_CATEGORIES = new Set([
  "FOOD_AND_DRINK",
  "SHOPPING",
  "ENTERTAINMENT",
  "PERSONAL_CARE",
  "TRANSPORTATION",
]);

function getSavedSnapshotInputs(
  memory: FinancialMemory | null | undefined
): Record<string, unknown> | null {
  const notes = memory?.notes;
  if (!isPlainObject(notes)) return null;

  const snapshot = notes["founderCoveragePlanner"];
  if (!isPlainObject(snapshot)) return null;

  const inputs = snapshot["inputs"];
  if (!isPlainObject(inputs)) return null;

  return inputs;
}

export function buildFounderPrefillFromData(args: FounderPrefillArgs): FounderPrefillResult {
  const { memory, bankAccounts, bankTransactions, now = new Date() } = args;
  const defaults: Partial<CalculatorInputs> = {};
  const filledFields: string[] = [];
  const sources = {
    snapshot: false,
    memory: false,
    accounts: false,
  };

  // If we have a saved snapshot in memory notes, prefer it (it is most specific).
  const savedInputs = getSavedSnapshotInputs(memory);
  if (savedInputs) {
    sources.snapshot = true;
    sources.memory = true;
    for (const [key, value] of Object.entries(savedInputs)) {
      if (value === null || value === undefined) continue;
      // Trust snapshot types, since it was written by this calculator.
      (defaults as Record<string, unknown>)[key] = value;
      filledFields.push(key);
    }
    return { defaults, filledFields, sources, hasRealData: true };
  }

  const filingStatus = mapFilingStatus(memory?.filing_status ?? null);
  if (filingStatus) {
    sources.memory = true;
    defaults.filingStatus = filingStatus;
    filledFields.push("filingStatus");
  }

  // As a weak fallback, use annual income as a proxy for net business income.
  // This is intentionally conservative and should be shown as editable.
  if (memory?.annual_income != null && Number.isFinite(memory.annual_income)) {
    sources.memory = true;
    defaults.annualNetIncome = Math.round(memory.annual_income);
    filledFields.push("annualNetIncome");
  }

  const hasAnySourceData =
    sources.memory ||
    (bankAccounts != null && bankAccounts.length > 0) ||
    (bankTransactions != null && bankTransactions.length > 0);
  if (hasAnySourceData) {
    const year = now.getFullYear();
    defaults.taxYearStartDate = `${year}-01-01`;
    defaults.currentQuarter = getQuarterForDate(now);
    filledFields.push("taxYearStartDate", "currentQuarter");
  }

  if (bankAccounts && bankAccounts.length > 0) {
    sources.accounts = true;

    const businessCount = bankAccounts.filter(looksBusinessAccount).length;
    const personalCount = Math.max(0, bankAccounts.length - businessCount);
    defaults.personalAccounts = personalCount;
    filledFields.push("personalAccounts");

    defaults.businessAccounts = businessCount;
    filledFields.push("businessAccounts");
  }

  if (bankAccounts && bankTransactions && bankTransactions.length > 0) {
    sources.accounts = true;
    const businessAccountIds = new Set(
      bankAccounts.filter(looksBusinessAccount).map((a) => a.id)
    );

    if (businessAccountIds.size > 0) {
      let mixed = 0;
      for (const tx of bankTransactions) {
        if (!businessAccountIds.has(tx.cash_account_id)) continue;
        if (!tx.primary_category) continue;
        if (!PERSONALISH_CATEGORIES.has(tx.primary_category)) continue;
        mixed += 1;
      }
      defaults.mixedTransactionsPerMonth = mixed;
      filledFields.push("mixedTransactionsPerMonth");
    }
  }

  const hasRealData = sources.snapshot || sources.memory || sources.accounts;
  return { defaults, filledFields, sources, hasRealData };
}
