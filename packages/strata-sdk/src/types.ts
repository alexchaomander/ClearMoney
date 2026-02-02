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

// Transaction types
export type TransactionType =
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'interest'
  | 'fee'
  | 'transfer'
  | 'other';

export interface Transaction {
  id: string;
  account_id: string;
  security_id: string | null;
  provider_transaction_id: string | null;
  type: TransactionType;
  quantity: number | null;
  price: number | null;
  amount: number | null;
  trade_date: string | null;
  settlement_date: string | null;
  currency: string;
  description: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
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

// Cash/Debt CRUD
export interface CashAccountCreate {
  name: string;
  account_type: CashAccountType;
  balance?: number;
  apy?: number | null;
  institution_name?: string | null;
}
export interface CashAccountUpdate {
  name?: string;
  account_type?: CashAccountType;
  balance?: number;
  apy?: number | null;
  institution_name?: string | null;
}
export interface DebtAccountCreate {
  name: string;
  debt_type: DebtType;
  balance?: number;
  interest_rate: number;
  minimum_payment?: number;
  institution_name?: string | null;
}
export interface DebtAccountUpdate {
  name?: string;
  debt_type?: DebtType;
  balance?: number;
  interest_rate?: number;
  minimum_payment?: number;
  institution_name?: string | null;
}

// Investment Account CRUD
export interface InvestmentAccountCreate {
  name: string;
  account_type: InvestmentAccountType;
  balance?: number;
  is_tax_advantaged?: boolean;
}

// Portfolio history
export type PortfolioHistoryRange = '30d' | '90d' | '1y' | 'all';
export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

// Financial Memory types
export type FilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export type MemoryEventSource = 'user_input' | 'calculator' | 'account_sync' | 'agent';

export interface FinancialMemory {
  id: string;
  user_id: string;

  // Demographics
  age: number | null;
  state: string | null;
  filing_status: FilingStatus | null;
  num_dependents: number | null;

  // Income
  annual_income: number | null;
  monthly_income: number | null;
  income_growth_rate: number | null;

  // Tax
  federal_tax_rate: number | null;
  state_tax_rate: number | null;
  capital_gains_rate: number | null;

  // Retirement
  retirement_age: number | null;
  current_retirement_savings: number | null;
  monthly_retirement_contribution: number | null;
  employer_match_pct: number | null;
  expected_social_security: number | null;
  desired_retirement_income: number | null;

  // Housing
  home_value: number | null;
  mortgage_balance: number | null;
  mortgage_rate: number | null;
  monthly_rent: number | null;

  // Goals & Preferences
  risk_tolerance: RiskTolerance | null;
  investment_horizon_years: number | null;
  monthly_savings_target: number | null;
  average_monthly_expenses: number | null;
  emergency_fund_target_months: number | null;

  // Freeform
  notes: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
}

export interface FinancialMemoryUpdate {
  // Demographics
  age?: number | null;
  state?: string | null;
  filing_status?: FilingStatus | null;
  num_dependents?: number | null;

  // Income
  annual_income?: number | null;
  monthly_income?: number | null;
  income_growth_rate?: number | null;

  // Tax
  federal_tax_rate?: number | null;
  state_tax_rate?: number | null;
  capital_gains_rate?: number | null;

  // Retirement
  retirement_age?: number | null;
  current_retirement_savings?: number | null;
  monthly_retirement_contribution?: number | null;
  employer_match_pct?: number | null;
  expected_social_security?: number | null;
  desired_retirement_income?: number | null;

  // Housing
  home_value?: number | null;
  mortgage_balance?: number | null;
  mortgage_rate?: number | null;
  monthly_rent?: number | null;

  // Goals & Preferences
  risk_tolerance?: RiskTolerance | null;
  investment_horizon_years?: number | null;
  monthly_savings_target?: number | null;
  average_monthly_expenses?: number | null;
  emergency_fund_target_months?: number | null;

  // Freeform
  notes?: Record<string, unknown> | null;

  // Source tracking
  source?: MemoryEventSource;
  source_context?: string | null;
}

export interface MemoryEvent {
  id: string;
  user_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  source: MemoryEventSource;
  context: string | null;
  created_at: string;
}

// Financial Context types
export interface FinancialContextAccount {
  name: string;
  type: string;
  balance: number | null;
  is_tax_advantaged?: boolean;
  interest_rate?: number | null;
  minimum_payment?: number | null;
}

export interface FinancialContextHolding {
  ticker: string | null;
  name: string;
  security_type: string;
  quantity: number;
  market_value: number | null;
  cost_basis: number | null;
  account: string;
}

export interface PortfolioMetrics {
  net_worth: number;
  total_investment_value: number;
  total_cash_value: number;
  total_debt_value: number;
  tax_advantaged_value: number;
  taxable_value: number;
}

export interface DataFreshness {
  last_sync: string | null;
  profile_updated: string | null;
  accounts_count: number;
  connections_count: number;
}

// Skill types
export interface SkillSummary {
  name: string;
  display_name: string;
  description: string;
  required_context: string[];
  output_format: string;
}

export interface SkillDetail extends SkillSummary {
  optional_context: string[];
  tools: string[];
  content: string;
}

// Advisor types
export type SessionStatus = 'active' | 'completed' | 'paused';
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed';

export interface AdvisorSession {
  id: string;
  user_id: string;
  skill_name: string | null;
  status: SessionStatus;
  messages: AdvisorMessage[];
  created_at: string;
  updated_at: string;
}

export interface AdvisorSessionSummary {
  id: string;
  skill_name: string | null;
  status: SessionStatus;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string | AdvisorContentBlock[];
}

export interface AdvisorContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

export interface AdvisorRecommendation {
  id: string;
  user_id: string;
  session_id: string;
  skill_name: string;
  title: string;
  summary: string;
  details: Record<string, unknown>;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
}

export interface FinancialContext {
  profile: Record<string, unknown>;
  accounts: {
    investment: FinancialContextAccount[];
    cash: FinancialContextAccount[];
    debt: FinancialContextAccount[];
  };
  holdings: FinancialContextHolding[];
  recent_transactions: {
    type: string;
    amount: number | null;
    description: string | null;
    trade_date: string | null;
  }[];
  portfolio_metrics: PortfolioMetrics;
  data_freshness: DataFreshness;
}

// Credit Card types
export interface CardCredit {
  id: string;
  card_id: string;
  name: string;
  value: string;
  period: "annual" | "monthly";
  description: string | null;
  category: string | null;
}

export interface CardBenefit {
  id: string;
  card_id: string;
  name: string;
  description: string | null;
  valuation_method: string | null;
  default_value: string | null;
  // user_valuation? No, that's UI state.
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  annual_fee: string;
  image_url: string | null;
  apply_url: string | null;
  credits: CardCredit[];
  benefits: CardBenefit[];
  created_at: string;
  updated_at: string;
}
