import type { BankAccount, BankTransaction, FinancialMemory } from "@clearmoney/strata-sdk";
import type { CalculatorInputs } from "./types";
import {
  INFLOW_CATEGORIES,
  looksBusinessAccount,
  PERSONALISH_CATEGORIES,
} from "./bankingHeuristics";

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

function mapStateCode(state: FinancialMemory["state"]): string | null {
  if (!state) return null;
  const normalized = state.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

type OutflowSign = "positive" | "negative";

function determineOutflowSign(transactions: BankTransaction[]): OutflowSign | null {
  let personalCount = 0;
  let negativePersonal = 0;
  let positivePersonal = 0;

  for (const tx of transactions) {
    if (!tx.primary_category) continue;
    if (!PERSONALISH_CATEGORIES.has(tx.primary_category)) continue;
    personalCount += 1;
    if (tx.amount < 0) negativePersonal += 1;
    if (tx.amount > 0) positivePersonal += 1;
  }

  if (personalCount < 5) return null;
  if (negativePersonal / personalCount >= 0.6) return "negative";
  if (positivePersonal / personalCount >= 0.6) return "positive";
  return null;
}

function estimateAnnualNetIncomeFromBanking(args: {
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  now: Date;
}): number | null {
  const { bankAccounts, bankTransactions, now } = args;
  if (bankAccounts.length === 0 || bankTransactions.length === 0) return null;

  const businessIds = new Set(
    bankAccounts.filter(looksBusinessAccount).map((a) => a.id)
  );
  if (businessIds.size === 0) return null;

  const businessTx = bankTransactions.filter((t) => businessIds.has(t.cash_account_id));
  if (businessTx.length < 5) return null;

  const outflowSign = determineOutflowSign(businessTx);

  let inflow = 0;
  let outflow = 0;
  let earliest: string | null = null;

  for (const tx of businessTx) {
    // Track time range from the data we have.
    if (!earliest || tx.transaction_date < earliest) earliest = tx.transaction_date;

    const hasCategory = !!tx.primary_category;
    const isInflowCategory = hasCategory && tx.primary_category ? INFLOW_CATEGORIES.has(tx.primary_category) : false;

    if (outflowSign === "negative") {
      if (tx.amount >= 0 || isInflowCategory) inflow += Math.abs(tx.amount);
      else outflow += Math.abs(tx.amount);
      continue;
    }
    if (outflowSign === "positive") {
      // If amounts are positive for expenses (Plaid default), inflows may appear as negative.
      if (tx.amount <= 0 || isInflowCategory) inflow += Math.abs(tx.amount);
      else outflow += Math.abs(tx.amount);
      continue;
    }

    // Unknown sign convention: only count explicit inflow categories.
    if (isInflowCategory) inflow += Math.abs(tx.amount);
  }

  // Require some evidence of inflows; otherwise this isn't useful.
  if (inflow <= 0) return null;

  const start = earliest ? new Date(`${earliest}T00:00:00Z`) : null;
  const days = start ? Math.max(7, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : 30;
  const annualized = (inflow - outflow) * (365 / days);

  if (!Number.isFinite(annualized)) return null;
  if (annualized < 20000) return null;
  return Math.round(annualized);
}

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

  const stateCode = mapStateCode(memory?.state ?? null);
  if (stateCode) {
    sources.memory = true;
    defaults.stateCode = stateCode;
    filledFields.push("stateCode");
  }

  if (bankAccounts && bankTransactions) {
    const estimated = estimateAnnualNetIncomeFromBanking({
      bankAccounts,
      bankTransactions,
      now,
    });
    if (estimated != null) {
      sources.accounts = true;
      defaults.annualNetIncome = estimated;
      filledFields.push("annualNetIncome");
    }
  }

  // As a weak fallback, use annual income as a proxy for net business income.
  // This is intentionally conservative and should be shown as editable.
  if (defaults.annualNetIncome == null && memory?.annual_income != null && Number.isFinite(memory.annual_income)) {
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
