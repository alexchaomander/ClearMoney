import {
  getDemoAccountsResponse,
  getDemoInvestmentAccountWithHoldings,
  getDemoHoldings,
  getDemoPortfolioHistory,
  getDemoPortfolioSummary,
} from "@/lib/strata/demo-data";
import type {
  AllAccountsResponse,
  BankAccount,
  BankTransaction,
  InvestmentAccountWithHoldings,
  DecisionTrace,
  PaginatedBankTransactions,
  FinancialMemory,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  PortfolioSummary,
  HoldingDetail,
  SpendingSummary,
} from "@clearmoney/strata-sdk";

export function getPreviewPortfolioSummary(): PortfolioSummary {
  return getDemoPortfolioSummary();
}

export function getPreviewPortfolioHistory(range: PortfolioHistoryRange): PortfolioHistoryPoint[] {
  return getDemoPortfolioHistory(range);
}

export function getPreviewAccounts(): AllAccountsResponse {
  return getDemoAccountsResponse();
}

export const PREVIEW_INVESTMENT_ACCOUNT_IDS = ["demo-acc-001", "demo-acc-002", "demo-acc-003"] as const;

export function getPreviewInvestmentAccount(accountId?: string | null): InvestmentAccountWithHoldings | null {
  const targetId = accountId && accountId !== "_" ? accountId : PREVIEW_INVESTMENT_ACCOUNT_IDS[0];
  return (
    getDemoInvestmentAccountWithHoldings(targetId) ??
    getDemoInvestmentAccountWithHoldings(PREVIEW_INVESTMENT_ACCOUNT_IDS[0]) ??
    getDemoInvestmentAccountWithHoldings(PREVIEW_INVESTMENT_ACCOUNT_IDS[1]) ??
    getDemoInvestmentAccountWithHoldings(PREVIEW_INVESTMENT_ACCOUNT_IDS[2]) ??
    null
  );
}

export function getPreviewHoldings(): HoldingDetail[] {
  return getDemoHoldings();
}

export const FALLBACK_SPENDING_SUMMARY: SpendingSummary = {
  total_spending: 5400,
  monthly_average: 1800,
  categories: [
    { category: "FOOD_AND_DRINK", total: 1200, percentage: 22.2, transaction_count: 45 },
    { category: "TRANSPORTATION", total: 800, percentage: 14.8, transaction_count: 20 },
    { category: "SHOPPING", total: 600, percentage: 11.1, transaction_count: 15 },
    { category: "ENTERTAINMENT", total: 400, percentage: 7.4, transaction_count: 12 },
    { category: "PERSONAL_CARE", total: 200, percentage: 3.7, transaction_count: 8 },
    { category: "GENERAL_MERCHANDISE", total: 2200, percentage: 40.7, transaction_count: 35 },
  ],
  start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  months_analyzed: 3,
};

export const FALLBACK_FINANCIAL_MEMORY: Partial<FinancialMemory> = {
  id: "preview-memory-001",
  user_id: "demo-user-001",
  annual_income: 128_500,
  monthly_income: 10_708,
  monthly_savings_target: 2_200,
  risk_tolerance: "moderate",
  average_monthly_expenses: 4_800,
  emergency_fund_target_months: 6,
  investment_horizon_years: 18,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const FALLBACK_DECISION_TRACES: DecisionTrace[] = [
  {
    id: "preview-decision-1",
    session_id: "session-graph",
    recommendation_id: "rec-alloc-1",
    trace_type: "recommendation",
    input_data: {
      scope: "portfolio_review",
      source: "dashboard",
      account_count: 3,
      debt_to_income_ratio: 0.11,
    },
    reasoning_steps: [
      "Calculated concentration risk across account categories.",
      "Compared target allocation assumptions to observed asset mix.",
      "Checked cash coverage for 3-month expense buffer threshold.",
    ],
    outputs: {
      trace: {
        deterministic: {
          rules_applied: [
            {
              name: "Emergency fund coverage",
              passed: true,
              message: "3.6 months visible, above minimum alert threshold.",
            },
            {
              name: "Concentration risk",
              passed: false,
              value: 0.31,
              threshold: 0.25,
              message: "Employer stock > 25% of equities.",
            },
          ],
          insights: [
            {
              title: "Allocation efficiency",
              summary:
                "Your portfolio has a defensible base but can be improved with broader diversification.",
              recommendation: "Set a target range by account type and rebalance 5% quarterly.",
              severity: "medium",
            },
          ],
          assumptions: [
            "Markets assumed to move with 7% annualized baseline return.",
            "Expenses assumed to include business and personal blended categories.",
          ],
        },
      },
      summary:
        "Recommended rebalancing sequence: trim concentrated holdings first, then rebuild cash ladder and debt payoff runway.",
      actions: [
        "Review top employer equity exposure",
        "Raise emergency fund target to 6 months if monthly volatility rises",
        "Enable advisor session for a policy-adjusted plan",
      ],
    },
    data_freshness: {
      status: "demo",
      updated_at: new Date().toISOString(),
    },
    warnings: [
      {
        id: "w-1",
        title: "Forecast uncertainty",
        detail: "Real outcomes vary with market regime and tax assumptions.",
      },
    ],
    source: "preview",
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "preview-decision-2",
    session_id: "session-coverage",
    recommendation_id: null,
    trace_type: "analysis",
    input_data: {
      scope: "founder_operations",
      coverage_items: ["bank_accounts", "tax_profile", "decision_traces"],
      consent: ["accounts:read", "transactions:read", "memory:read"],
    },
    reasoning_steps: [
      "Scored data completeness across connected sources.",
      "Flagged missing transaction tags in high-volume categories.",
      "Simulated decision reliability uplift with additional connections.",
    ],
    outputs: {
      trace: {
        deterministic: {
          rules_applied: [
            {
              name: "Bank connection required",
              passed: true,
              message: "Connections are available and last-sync is recent.",
            },
            {
              name: "Financial profile completeness",
              passed: true,
              message: "Income, taxes, retirement, and risk fields are sufficiently populated.",
            },
          ],
          insights: [
            {
              title: "Coverage estimate",
              summary: "Current recommendations run with moderate confidence.",
              recommendation: "Add at least one additional bank account and one savings goal to push confidence higher.",
              severity: "low",
            },
          ],
          assumptions: [
            "Founding team context treated as a single financial persona.",
            "No tax-year-specific election changes are applied.",
          ],
        },
      },
      summary:
        "Coverage gaps are limited; the biggest signal is category coverage in recurring non-personal spend.",
      actions: ["Connect savings account", "Enable category tagging", "Review commingling signals"],
    },
    data_freshness: {
      status: "demo",
      updated_at: new Date().toISOString(),
    },
    warnings: [],
    source: "preview",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const FALLBACK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "preview-bank-001",
    user_id: "demo-user-001",
    connection_id: "preview-conn-001",
    name: "Chase Checking",
    account_type: "checking",
    balance: 8500,
    available_balance: 8450,
    institution_name: "Chase",
    mask: "1234",
    is_manual: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-bank-002",
    user_id: "demo-user-001",
    connection_id: "preview-conn-001",
    name: "Mercury Business Checking",
    account_type: "checking",
    balance: 42000,
    available_balance: 41800,
    institution_name: "Mercury",
    mask: "0420",
    is_manual: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const FALLBACK_BANK_TRANSACTIONS: PaginatedBankTransactions = {
  transactions: [
    {
      id: "preview-tx-1",
      cash_account_id: "preview-bank-002",
      provider_transaction_id: "ptx-1",
      amount: 18000,
      transaction_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      posted_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      name: "STRIPE PAYOUT",
      primary_category: "INCOME",
      detailed_category: "INCOME_OTHER_INCOME",
      merchant_name: "Stripe",
      payment_channel: "online",
      pending: false,
      iso_currency_code: "USD",
      reimbursed_at: null,
      reimbursement_memo: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "preview-tx-2",
      cash_account_id: "preview-bank-002",
      provider_transaction_id: "ptx-2",
      amount: -280,
      transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      name: "AWS",
      primary_category: "GENERAL_SERVICES",
      detailed_category: "GENERAL_SERVICES_CLOUD_SERVICES",
      merchant_name: "Amazon Web Services",
      payment_channel: "online",
      pending: false,
      iso_currency_code: "USD",
      reimbursed_at: null,
      reimbursement_memo: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "preview-tx-3",
      cash_account_id: "preview-bank-001",
      provider_transaction_id: "ptx-3",
      amount: -45.67,
      transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      name: "UBER EATS",
      primary_category: "FOOD_AND_DRINK",
      detailed_category: "FOOD_AND_DRINK_RESTAURANTS",
      merchant_name: "Uber Eats",
      payment_channel: "online",
      pending: false,
      iso_currency_code: "USD",
      reimbursed_at: null,
      reimbursement_memo: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  total: 3,
  page: 1,
  page_size: 50,
  total_pages: 1,
};
