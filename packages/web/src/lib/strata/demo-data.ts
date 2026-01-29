import type {
  AllAccountsResponse,
  CashAccount,
  Connection,
  DebtAccount,
  HoldingDetail,
  HoldingWithSecurity,
  Institution,
  InvestmentAccount,
  InvestmentAccountWithHoldings,
  PortfolioSummary,
} from "@clearmoney/strata-sdk";

const NOW = "2025-01-15T12:00:00Z";
const DEMO_USER_ID = "demo-user-001";

// === Institutions ===

export const DEMO_INSTITUTIONS: Institution[] = [
  {
    id: "demo-inst-fidelity",
    name: "Fidelity Investments",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-vanguard",
    name: "Vanguard",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-schwab",
    name: "Charles Schwab",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-chase",
    name: "Chase",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-robinhood",
    name: "Robinhood",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-wealthfront",
    name: "Wealthfront",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Connections ===

export const DEMO_CONNECTIONS: Connection[] = [
  {
    id: "demo-conn-001",
    user_id: DEMO_USER_ID,
    institution_id: "demo-inst-fidelity",
    provider: "snaptrade",
    provider_user_id: "demo-provider-001",
    status: "active",
    last_synced_at: NOW,
    error_code: null,
    error_message: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-conn-002",
    user_id: DEMO_USER_ID,
    institution_id: "demo-inst-vanguard",
    provider: "snaptrade",
    provider_user_id: "demo-provider-002",
    status: "active",
    last_synced_at: NOW,
    error_code: null,
    error_message: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-conn-003",
    user_id: DEMO_USER_ID,
    institution_id: "demo-inst-schwab",
    provider: "snaptrade",
    provider_user_id: "demo-provider-003",
    status: "active",
    last_synced_at: NOW,
    error_code: null,
    error_message: null,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Investment Accounts ===

export const DEMO_INVESTMENT_ACCOUNTS: InvestmentAccount[] = [
  {
    id: "demo-acc-001",
    user_id: DEMO_USER_ID,
    connection_id: "demo-conn-001",
    institution_id: "demo-inst-fidelity",
    name: "Fidelity 401(k)",
    account_type: "401k",
    provider_account_id: "demo-prov-acc-001",
    balance: 425300.0,
    currency: "USD",
    is_tax_advantaged: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-acc-002",
    user_id: DEMO_USER_ID,
    connection_id: "demo-conn-002",
    institution_id: "demo-inst-vanguard",
    name: "Vanguard Roth IRA",
    account_type: "roth_ira",
    provider_account_id: "demo-prov-acc-002",
    balance: 187450.0,
    currency: "USD",
    is_tax_advantaged: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-acc-003",
    user_id: DEMO_USER_ID,
    connection_id: "demo-conn-003",
    institution_id: "demo-inst-schwab",
    name: "Schwab Individual Brokerage",
    account_type: "brokerage",
    provider_account_id: "demo-prov-acc-003",
    balance: 238120.0,
    currency: "USD",
    is_tax_advantaged: false,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Cash Accounts ===

const DEMO_CASH_ACCOUNTS: CashAccount[] = [
  {
    id: "demo-cash-001",
    user_id: DEMO_USER_ID,
    name: "Chase Total Checking",
    account_type: "checking",
    balance: 12340.0,
    apy: 0.01,
    institution_name: "Chase",
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-cash-002",
    user_id: DEMO_USER_ID,
    name: "Marcus Online Savings",
    account_type: "savings",
    balance: 45000.0,
    apy: 4.4,
    institution_name: "Goldman Sachs",
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Debt Accounts ===

const DEMO_DEBT_ACCOUNTS: DebtAccount[] = [
  {
    id: "demo-debt-001",
    user_id: DEMO_USER_ID,
    name: "Chase Sapphire Reserve",
    debt_type: "credit_card",
    balance: 3245.0,
    interest_rate: 21.49,
    minimum_payment: 89.0,
    institution_name: "Chase",
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Holdings per account ===

function makeSecurity(
  id: string,
  ticker: string | null,
  name: string,
  type: "stock" | "etf" | "mutual_fund" | "bond",
  price: number
) {
  return {
    id,
    ticker,
    name,
    security_type: type,
    cusip: null,
    isin: null,
    close_price: price,
    close_price_as_of: NOW,
    created_at: NOW,
    updated_at: NOW,
  };
}

function makeHolding(
  id: string,
  accountId: string,
  securityId: string,
  qty: number,
  costBasis: number,
  marketValue: number
) {
  return {
    id,
    account_id: accountId,
    security_id: securityId,
    quantity: qty,
    cost_basis: costBasis,
    market_value: marketValue,
    as_of: NOW,
    created_at: NOW,
    updated_at: NOW,
  };
}

// Fidelity 401(k) holdings
const FIDELITY_HOLDINGS: HoldingWithSecurity[] = [
  {
    ...makeHolding("demo-h-001", "demo-acc-001", "demo-sec-vti", 420, 78540, 112560),
    security: makeSecurity("demo-sec-vti", "VTI", "Vanguard Total Stock Market ETF", "etf", 268.0),
  },
  {
    ...makeHolding("demo-h-002", "demo-acc-001", "demo-sec-vxus", 580, 28420, 31320),
    security: makeSecurity("demo-sec-vxus", "VXUS", "Vanguard Total International Stock ETF", "etf", 54.0),
  },
  {
    ...makeHolding("demo-h-003", "demo-acc-001", "demo-sec-bnd", 310, 22940, 22630),
    security: makeSecurity("demo-sec-bnd", "BND", "Vanguard Total Bond Market ETF", "bond", 73.0),
  },
  {
    ...makeHolding("demo-h-004", "demo-acc-001", "demo-sec-voo", 520, 178360, 258790),
    security: makeSecurity("demo-sec-voo", "VOO", "Vanguard S&P 500 ETF", "etf", 497.67),
  },
];

// Vanguard Roth IRA holdings
const VANGUARD_HOLDINGS: HoldingWithSecurity[] = [
  {
    ...makeHolding("demo-h-005", "demo-acc-002", "demo-sec-qqq", 145, 38640, 58000),
    security: makeSecurity("demo-sec-qqq", "QQQ", "Invesco QQQ Trust", "etf", 400.0),
  },
  {
    ...makeHolding("demo-h-006", "demo-acc-002", "demo-sec-aapl", 180, 21600, 43200),
    security: makeSecurity("demo-sec-aapl", "AAPL", "Apple Inc.", "stock", 240.0),
  },
  {
    ...makeHolding("demo-h-007", "demo-acc-002", "demo-sec-msft", 110, 24200, 46200),
    security: makeSecurity("demo-sec-msft", "MSFT", "Microsoft Corporation", "stock", 420.0),
  },
  {
    ...makeHolding("demo-h-008", "demo-acc-002", "demo-sec-googl", 140, 16800, 25200),
    security: makeSecurity("demo-sec-googl", "GOOGL", "Alphabet Inc.", "stock", 180.0),
  },
  {
    ...makeHolding("demo-h-009", "demo-acc-002", "demo-sec-vgit", 200, 10400, 14850),
    security: makeSecurity("demo-sec-vgit", "VGIT", "Vanguard Intermediate-Term Treasury ETF", "bond", 74.25),
  },
];

// Schwab Brokerage holdings
const SCHWAB_HOLDINGS: HoldingWithSecurity[] = [
  {
    ...makeHolding("demo-h-010", "demo-acc-003", "demo-sec-amzn", 120, 14400, 26400),
    security: makeSecurity("demo-sec-amzn", "AMZN", "Amazon.com Inc.", "stock", 220.0),
  },
  {
    ...makeHolding("demo-h-011", "demo-acc-003", "demo-sec-nvda", 85, 10200, 59500),
    security: makeSecurity("demo-sec-nvda", "NVDA", "NVIDIA Corporation", "stock", 700.0),
  },
  {
    ...makeHolding("demo-h-012", "demo-acc-003", "demo-sec-tsla", 60, 12000, 14700),
    security: makeSecurity("demo-sec-tsla", "TSLA", "Tesla Inc.", "stock", 245.0),
  },
  {
    ...makeHolding("demo-h-013", "demo-acc-003", "demo-sec-schd", 340, 23800, 27200),
    security: makeSecurity("demo-sec-schd", "SCHD", "Schwab U.S. Dividend Equity ETF", "etf", 80.0),
  },
  {
    ...makeHolding("demo-h-014", "demo-acc-003", "demo-sec-vti", 200, 42000, 53600),
    security: makeSecurity("demo-sec-vti", "VTI", "Vanguard Total Stock Market ETF", "etf", 268.0),
  },
  {
    ...makeHolding("demo-h-015", "demo-acc-003", "demo-sec-jpst", 700, 35000, 35700),
    security: makeSecurity("demo-sec-jpst", "JPST", "JPMorgan Ultra-Short Income ETF", "bond", 51.0),
  },
  {
    ...makeHolding("demo-h-016", "demo-acc-003", "demo-sec-schx", 250, 14250, 15500),
    security: makeSecurity("demo-sec-schx", "SCHX", "Schwab U.S. Large-Cap ETF", "etf", 62.0),
  },
];

const HOLDINGS_BY_ACCOUNT: Record<string, HoldingWithSecurity[]> = {
  "demo-acc-001": FIDELITY_HOLDINGS,
  "demo-acc-002": VANGUARD_HOLDINGS,
  "demo-acc-003": SCHWAB_HOLDINGS,
};

// === Pre-computed derived data (static, so computed once at module load) ===

function computeHoldings(): HoldingDetail[] {
  const details: HoldingDetail[] = [];
  for (const account of DEMO_INVESTMENT_ACCOUNTS) {
    const holdings = HOLDINGS_BY_ACCOUNT[account.id] ?? [];
    for (const h of holdings) {
      details.push({
        id: h.id,
        account_id: account.id,
        account_name: account.name,
        account_type: account.account_type,
        is_tax_advantaged: account.is_tax_advantaged,
        security: {
          id: h.security.id,
          ticker: h.security.ticker,
          name: h.security.name,
          security_type: h.security.security_type,
          close_price: h.security.close_price,
        },
        quantity: h.quantity,
        cost_basis: h.cost_basis,
        market_value: h.market_value,
        as_of: h.as_of,
      });
    }
  }
  return details;
}

function computePortfolioSummary(allHoldings: HoldingDetail[]): PortfolioSummary {
  const totalInvestment = DEMO_INVESTMENT_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalCash = DEMO_CASH_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalDebt = DEMO_DEBT_ACCOUNTS.reduce((s, a) => s + a.balance, 0);

  const taxAdvantaged = DEMO_INVESTMENT_ACCOUNTS
    .filter((a) => a.is_tax_advantaged)
    .reduce((s, a) => s + a.balance, 0);
  const taxable = totalInvestment - taxAdvantaged;

  const byType: Record<string, number> = {};
  for (const h of allHoldings) {
    const type = h.security.security_type;
    byType[type] = (byType[type] ?? 0) + (h.market_value ?? 0);
  }

  const allocationByAssetType = Object.entries(byType).map(([category, value]) => ({
    category,
    value,
    percentage: Math.round((value / totalInvestment) * 10000) / 100,
  }));

  const allocationByAccountType = DEMO_INVESTMENT_ACCOUNTS.map((a) => ({
    category: a.account_type,
    value: a.balance,
    percentage: Math.round((a.balance / totalInvestment) * 10000) / 100,
  }));

  const sorted = [...allHoldings].sort(
    (a, b) => (b.market_value ?? 0) - (a.market_value ?? 0)
  );
  const topHoldings = sorted.slice(0, 10).map((h) => ({
    ticker: h.security.ticker,
    name: h.security.name,
    security_type: h.security.security_type,
    quantity: h.quantity,
    market_value: h.market_value ?? 0,
    cost_basis: h.cost_basis,
    account_name: h.account_name,
  }));

  const concentrationAlerts = allHoldings
    .filter((h) => ((h.market_value ?? 0) / totalInvestment) > 0.08)
    .map((h) => ({
      ticker: h.security.ticker,
      name: h.security.name,
      percentage: Math.round(((h.market_value ?? 0) / totalInvestment) * 10000) / 100,
      message: `${h.security.ticker ?? h.security.name} represents ${(((h.market_value ?? 0) / totalInvestment) * 100).toFixed(1)}% of your portfolio`,
    }));

  return {
    total_investment_value: totalInvestment,
    total_cash_value: totalCash,
    total_debt_value: totalDebt,
    net_worth: totalInvestment + totalCash - totalDebt,
    tax_advantaged_value: taxAdvantaged,
    taxable_value: taxable,
    allocation_by_asset_type: allocationByAssetType,
    allocation_by_account_type: allocationByAccountType,
    top_holdings: topHoldings,
    concentration_alerts: concentrationAlerts,
  };
}

const DEMO_HOLDINGS = computeHoldings();
const DEMO_PORTFOLIO_SUMMARY = computePortfolioSummary(DEMO_HOLDINGS);

// === Public accessors ===

export function getDemoAccountsResponse(): AllAccountsResponse {
  return {
    investment_accounts: DEMO_INVESTMENT_ACCOUNTS,
    cash_accounts: DEMO_CASH_ACCOUNTS,
    debt_accounts: DEMO_DEBT_ACCOUNTS,
  };
}

export function getDemoInvestmentAccountWithHoldings(
  accountId: string
): InvestmentAccountWithHoldings | null {
  const account = DEMO_INVESTMENT_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) return null;
  return {
    ...account,
    holdings: HOLDINGS_BY_ACCOUNT[accountId] ?? [],
  };
}

export function getDemoHoldings(): HoldingDetail[] {
  return DEMO_HOLDINGS;
}

export function getDemoPortfolioSummary(): PortfolioSummary {
  return DEMO_PORTFOLIO_SUMMARY;
}
