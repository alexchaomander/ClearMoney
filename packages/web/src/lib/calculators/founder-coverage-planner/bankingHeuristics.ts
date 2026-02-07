import type { BankAccount, BankTransaction } from "@clearmoney/strata-sdk";

export function looksBusinessAccount(
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

export const PERSONALISH_CATEGORIES = new Set<BankTransaction["primary_category"]>([
  "FOOD_AND_DRINK",
  "SHOPPING",
  "ENTERTAINMENT",
  "PERSONAL_CARE",
  "TRANSPORTATION",
]);

export const INFLOW_CATEGORIES = new Set<BankTransaction["primary_category"]>([
  "INCOME",
  "TRANSFER_IN",
  "PAYROLL",
  "LOAN_PAYMENTS_INCOME",
]);

