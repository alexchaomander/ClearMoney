// Common types
export interface HealthResponse {
  status: string;
  database: string;
}

// Connection types
export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'pending';

export interface Connection {
  id: string;
  user_id: string;
  institution_id: string | null;
  provider: string;
  provider_user_id: string;
  status: ConnectionStatus;
  last_synced_at: string | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkSessionRequest {
  institution_id?: string;
  redirect_uri?: string;
}

export interface LinkSessionResponse {
  redirect_url: string;
  session_id: string | null;
}

export interface ConnectionCallbackRequest {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// Institution types
export interface Institution {
  id: string;
  name: string;
  logo_url: string | null;
  providers: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Account types
export type InvestmentAccountType =
  | 'brokerage'
  | 'ira'
  | 'roth_ira'
  | '401k'
  | '403b'
  | 'hsa'
  | 'sep_ira'
  | 'simple_ira'
  | 'pension'
  | 'trust'
  | 'other';

export type CashAccountType = 'checking' | 'savings' | 'money_market' | 'cd' | 'other';

export type DebtType =
  | 'credit_card'
  | 'student_loan'
  | 'mortgage'
  | 'auto_loan'
  | 'personal_loan'
  | 'medical'
  | 'other';

export interface InvestmentAccount {
  id: string;
  user_id: string;
  connection_id: string | null;
  institution_id: string | null;
  institution_name: string | null;
  name: string;
  account_type: InvestmentAccountType;
  provider_account_id: string | null;
  balance: number;
  currency: string;
  is_tax_advantaged: boolean;
  created_at: string;
  updated_at: string;
}

export interface CashAccount {
  id: string;
  user_id: string;
  name: string;
  account_type: CashAccountType;
  balance: number;
  apy: number | null;
  institution_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtAccount {
  id: string;
  user_id: string;
  name: string;
  debt_type: DebtType;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  institution_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AllAccountsResponse {
  cash_accounts: CashAccount[];
  debt_accounts: DebtAccount[];
  investment_accounts: InvestmentAccount[];
}

// Security and Holding types
export type SecurityType =
  | 'stock'
  | 'etf'
  | 'mutual_fund'
  | 'bond'
  | 'crypto'
  | 'cash'
  | 'option'
  | 'other';

export interface Security {
  id: string;
  ticker: string | null;
  name: string;
  security_type: SecurityType;
  cusip: string | null;
  isin: string | null;
  close_price: number | null;
  close_price_as_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  account_id: string;
  security_id: string;
  quantity: number;
  cost_basis: number | null;
  market_value: number | null;
  as_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface HoldingWithSecurity extends Holding {
  security: Security;
}

export interface InvestmentAccountWithHoldings extends InvestmentAccount {
  holdings: HoldingWithSecurity[];
}

export interface HoldingDetail {
  id: string;
  account_id: string;
  account_name: string;
  account_type: InvestmentAccountType;
  is_tax_advantaged: boolean;
  security: {
    id: string;
    ticker: string | null;
    name: string;
    security_type: SecurityType;
    close_price: number | null;
  };
  quantity: number;
  cost_basis: number | null;
  market_value: number | null;
  as_of: string | null;
}

// Portfolio types
export interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
}

export interface TopHolding {
  ticker: string | null;
  name: string;
  security_type: string;
  quantity: number;
  market_value: number;
  cost_basis: number | null;
  account_name: string;
}

export interface ConcentrationAlert {
  ticker: string | null;
  name: string;
  percentage: number;
  message: string;
}

export interface PortfolioSummary {
  total_investment_value: number;
  total_cash_value: number;
  total_debt_value: number;
  net_worth: number;
  tax_advantaged_value: number;
  taxable_value: number;
  allocation_by_asset_type: AssetAllocation[];
  allocation_by_account_type: AssetAllocation[];
  top_holdings: TopHolding[];
  concentration_alerts: ConcentrationAlert[];
}
