import { describe, expect, test } from "vitest";
import { buildFounderPrefillFromData } from "./prefill";
import type { FinancialMemory, BankAccount, BankTransaction } from "@clearmoney/strata-sdk";

test("prefill prefers saved snapshot in memory notes", () => {
  const memory = {
    id: "m1",
    user_id: "u1",
    age: null,
    state: null,
    filing_status: "single",
    num_dependents: null,
    annual_income: 123000,
    monthly_income: null,
    income_growth_rate: null,
    federal_tax_rate: null,
    state_tax_rate: null,
    capital_gains_rate: null,
    retirement_age: null,
    current_retirement_savings: null,
    monthly_retirement_contribution: null,
    employer_match_pct: null,
    expected_social_security: null,
    desired_retirement_income: null,
    home_value: null,
    mortgage_balance: null,
    mortgage_rate: null,
    monthly_rent: null,
    risk_tolerance: null,
    investment_horizon_years: null,
    monthly_savings_target: null,
    average_monthly_expenses: null,
    emergency_fund_target_months: null,
    spending_categories_monthly: null,
    debt_profile: null,
    portfolio_summary: null,
    equity_compensation: null,
    notes: {
      founderCoveragePlanner: {
        version: 1,
        inputs: {
          legalEntityType: "llc",
          taxElection: "s_corp",
          annualNetIncome: 240000,
        },
      },
    },
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  } satisfies FinancialMemory;

  const { defaults } = buildFounderPrefillFromData({ memory });
  expect(defaults.annualNetIncome).toBe(240000);
  expect(defaults.taxElection).toBe("s_corp");
});

test("prefill infers business/personal accounts and mixed transactions from banking data", () => {
  const bankAccounts = [
    { id: "a1", user_id: "u1", connection_id: null, name: "Chase Checking", account_type: "checking", balance: 0, available_balance: null, institution_name: "Chase", mask: null, is_manual: false, created_at: "x", updated_at: "x" },
    { id: "a2", user_id: "u1", connection_id: null, name: "Mercury Business Checking", account_type: "checking", balance: 0, available_balance: null, institution_name: "Mercury", mask: null, is_manual: false, created_at: "x", updated_at: "x" },
  ] satisfies BankAccount[];

  const bankTransactions = [
    { id: "t1", cash_account_id: "a2", provider_transaction_id: "p1", amount: -12, transaction_date: "2026-02-01", posted_date: null, name: "UBER EATS", primary_category: "FOOD_AND_DRINK", detailed_category: null, merchant_name: null, payment_channel: null, pending: false, iso_currency_code: "USD", created_at: "x", updated_at: "x" },
    { id: "t2", cash_account_id: "a2", provider_transaction_id: "p2", amount: -250, transaction_date: "2026-02-01", posted_date: null, name: "AWS", primary_category: "TRANSFER_OUT", detailed_category: null, merchant_name: null, payment_channel: null, pending: false, iso_currency_code: "USD", created_at: "x", updated_at: "x" },
    { id: "t3", cash_account_id: "a2", provider_transaction_id: "p3", amount: -40, transaction_date: "2026-02-01", posted_date: null, name: "TARGET", primary_category: "SHOPPING", detailed_category: null, merchant_name: null, payment_channel: null, pending: false, iso_currency_code: "USD", created_at: "x", updated_at: "x" },
  ] satisfies BankTransaction[];

  const { defaults } = buildFounderPrefillFromData({
    bankAccounts,
    bankTransactions,
    now: new Date("2026-02-07T12:00:00Z"),
  });

  expect(defaults.personalAccounts).toBe(1);
  expect(defaults.businessAccounts).toBe(1);
  expect(defaults.mixedTransactionsPerMonth).toBe(2);
  expect(defaults.currentQuarter).toBe(1);
  expect(defaults.taxYearStartDate).toBe("2026-01-01");
});
