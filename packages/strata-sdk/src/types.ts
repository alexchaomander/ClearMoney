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
  // Provider-linked fields (Plaid banking)
  connection_id: string | null;
  provider_account_id: string | null;
  available_balance: number | null;
  mask: string | null;
  is_manual: boolean;
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

export interface DebtProfileByType {
  count: number;
  balance: number;
  minimum_payment: number;
  weighted_interest_rate: number | null;
}

export interface DebtProfile {
  total_balance: number;
  total_minimum_payment: number;
  weighted_interest_rate: number | null;
  by_type: Record<string, DebtProfileByType>;
}

export interface MemoryPortfolioSummaryAllocation {
  value: number;
  percent: number;
}

export interface MemoryPortfolioSummaryHolding {
  ticker: string | null;
  name: string;
  security_type: string;
  market_value: number | null;
}

export interface MemoryPortfolioSummary {
  total_investment_value: number;
  total_cash_value: number;
  total_debt_value: number;
  net_worth: number;
  allocation_by_security_type: Record<string, MemoryPortfolioSummaryAllocation>;
  top_holdings: MemoryPortfolioSummaryHolding[];
}

export interface EquityCompensationProfile {
  target_bonus_pct?: number | null;
  expected_bonus_multiplier?: number | null;
  rsu_grant_total_value?: number | null;
  rsu_grant_vesting_schedule?: string | null;
  rsu_grant_vesting_years?: number | null;
  rsu_grant_current_price?: number | null;
  rsu_grant_price?: number | null;
  rsu_shares_vesting?: number | null;
  sign_on_bonus?: number | null;
  sign_on_vesting_years?: number | null;
  match_401k_pct?: number | null;
  match_401k_limit?: number | null;
  espp_discount?: number | null;
  espp_contribution?: number | null;
  hsa_contribution?: number | null;
  annual_refresher_value?: number | null;
  refresher_vesting_years?: number | null;
  current_equity_value?: number | null;
  vested_options_value?: number | null;
  unvested_equity_value?: number | null;
  equity_cost_basis?: number | null;
  annual_equity_grant?: number | null;
  years_at_company?: number | null;
  stock_option_type?: 'iso' | 'nso' | null;
  stock_option_total_options?: number | null;
  stock_option_strike_price?: number | null;
  stock_option_current_fmv?: number | null;
  stock_option_vested_options?: number | null;
}

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
  spending_categories_monthly: Record<string, number> | null;
  debt_profile: DebtProfile | null;
  portfolio_summary: PortfolioSummary | null;
  equity_compensation: EquityCompensationProfile | null;

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
  spending_categories_monthly?: Record<string, number> | null;
  debt_profile?: DebtProfile | null;
  portfolio_summary?: PortfolioSummary | null;
  equity_compensation?: EquityCompensationProfile | null;

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

// Consent types
export interface ConsentCreateRequest {
  scopes: string[];
  purpose: string;
  source?: string | null;
}

export interface ConsentResponse {
  id: string;
  user_id: string;
  scopes: string[];
  purpose: string;
  status: 'active' | 'revoked' | 'expired';
  source: string;
  created_at: string;
  updated_at: string;
}

// Decision trace types
export interface DecisionTrace {
  id: string;
  session_id: string;
  recommendation_id: string | null;
  trace_type: 'recommendation' | 'analysis' | 'action';
  input_data: Record<string, unknown>;
  reasoning_steps: unknown[];
  outputs: Record<string, unknown>;
  data_freshness: Record<string, unknown>;
  warnings: unknown[];
  source: string;
  created_at: string;
}

// Shared data source types
export interface PointsValuations {
  tpg: number;
  conservative: number;
  moderate: number;
  optimistic: number;
}

export interface PointsMethodology {
  cash_out: number | null;
  portal_value: number | null;
  transfer_value: string;
}

export interface PointsProgram {
  id: string;
  name: string;
  short_name: string;
  issuer: string;
  category: string;
  valuations: PointsValuations;
  methodology: PointsMethodology;
  best_uses: string[];
  worst_uses: string[];
  last_updated: string;
}

export interface CreditCardDataCredit {
  name: string;
  value: number;
  period: string;
  description: string | null;
  category: string | null;
  default_usable_pct: number | null;
}

export interface CreditCardDataBenefit {
  name: string;
  description: string | null;
  valuation_method: string | null;
  default_value: number | null;
}

export interface CreditCardSignupBonus {
  points: number;
  spend_required: number;
  timeframe_months: number;
}

export interface CreditCardData {
  id: string;
  name: string;
  issuer: string;
  annual_fee: number;
  currency_id: string | null;
  image_url: string | null;
  apply_url: string | null;
  affiliate_payout_estimate: number | null;
  tpg_rank: number | null;
  default_rewards_rate: number | null;
  credits: CreditCardDataCredit[];
  benefits: CreditCardDataBenefit[];
  earn_rates: Record<string, number> | null;
  signup_bonus: CreditCardSignupBonus | null;
}

// Shared data (seven pillars)
export interface SavingsProduct {
  id: string;
  name: string;
  provider: string;
  product_type: string;
  apy: number;
  minimum_balance: number | null;
  monthly_fee: number | null;
  fdic_insured: boolean;
  last_updated: string | null;
  notes: string | null;
}

export interface ContributionLimit {
  id: string;
  account_type: string;
  year: number;
  base_limit: number;
  catch_up_50: number | null;
  catch_up_60_63: number | null;
  notes: string | null;
}

export interface MarketAssumption {
  id: string;
  name: string;
  expected_return: number;
  volatility: number;
  inflation: number;
  notes: string | null;
}

export interface InvestmentData {
  last_updated: string | null;
  contribution_limits: ContributionLimit[];
  market_assumptions: MarketAssumption[];
}

export interface MortgageRate {
  id: string;
  loan_type: string;
  term_years: number;
  rate: number;
  points: number | null;
  notes: string | null;
}

export interface HomePriceAssumption {
  id: string;
  name: string;
  appreciation_rate: number;
  notes: string | null;
}

export interface RealAssetData {
  last_updated: string | null;
  mortgage_rates: MortgageRate[];
  home_price_assumptions: HomePriceAssumption[];
}

export interface LoanRate {
  id: string;
  loan_type: string;
  rate: number;
  term_years: number | null;
  notes: string | null;
}

export interface LiabilityData {
  last_updated: string | null;
  loan_rates: LoanRate[];
}

export interface TaxBracket {
  rate: number;
  cap: number | null;
}

export interface IncomeTaxBracket {
  id: string;
  year: number;
  filing_status: string;
  brackets: TaxBracket[];
}

export interface StandardDeduction {
  year: number;
  filing_status: string;
  amount: number;
}

export interface PayrollLimit {
  year: number;
  social_security_wage_base: number;
  medicare_additional_threshold: number;
}

export interface IncomeData {
  last_updated: string | null;
  tax_brackets: IncomeTaxBracket[];
  standard_deductions: StandardDeduction[];
  payroll_limits: PayrollLimit[];
}

export interface CreditScoreFactor {
  id: string;
  name: string;
  weight: number;
  description: string | null;
}

export interface UtilizationGuideline {
  label: string;
  min: number;
  max: number;
  notes: string | null;
}

export interface CreditData {
  last_updated: string | null;
  score_factors: CreditScoreFactor[];
  utilization_guidelines: UtilizationGuideline[];
}

export interface InsuranceEstimate {
  id: string;
  name: string;
  coverage_multiple_income: number;
  typical_cost_pct_income: number;
  notes: string | null;
}

export interface ProtectionData {
  last_updated: string | null;
  insurance_estimates: InsuranceEstimate[];
}

export interface ToolPreset {
  tool_id: string;
  defaults: Record<string, unknown>;
  updated_at: string | null;
}

export interface ToolPresetBundle {
  last_updated: string | null;
  presets: ToolPreset[];
}

// Banking types (Plaid integration)
export interface PlaidLinkRequest {
  redirect_uri?: string;
}

export interface PlaidLinkResponse {
  link_token: string;
  expiration: string | null;
}

export interface PlaidCallbackRequest {
  public_token: string;
  institution_id?: string;
  institution_name?: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  connection_id: string | null;
  name: string;
  account_type: CashAccountType;
  balance: number;
  available_balance: number | null;
  institution_name: string | null;
  mask: string | null;
  is_manual: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  cash_account_id: string;
  provider_transaction_id: string;
  amount: number;
  transaction_date: string;
  posted_date: string | null;
  name: string;
  primary_category: string | null;
  detailed_category: string | null;
  merchant_name: string | null;
  payment_channel: string | null;
  pending: boolean;
  iso_currency_code: string;
  reimbursed_at: string | null;
  reimbursement_memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankTransactionQuery {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

export interface BankTransactionReimbursementUpdate {
  reimbursed: boolean;
  memo?: string | null;
}

export interface PaginatedBankTransactions {
  transactions: BankTransaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SpendingCategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  transaction_count: number;
}

export interface SpendingSummary {
  total_spending: number;
  monthly_average: number;
  categories: SpendingCategoryBreakdown[];
  start_date: string;
  end_date: string;
  months_analyzed: number;
}

// === Share Reports ===

export type ShareReportMode = "full" | "redacted";

export interface ShareReportCreateRequest {
  tool_id: string;
  mode: ShareReportMode;
  payload: Record<string, unknown>;
  expires_in_days?: number | null;
  max_views?: number | null;
}

export interface ShareReportCreateResponse {
  id: string;
  token: string;
  tool_id: string;
  mode: ShareReportMode;
  created_at: string;
  expires_at: string | null;
  max_views: number | null;
}

export interface ShareReportPublicResponse {
  id: string;
  tool_id: string;
  mode: ShareReportMode;
  created_at: string;
  expires_at: string | null;
  max_views: number | null;
  view_count: number;
  last_viewed_at: string | null;
  payload: Record<string, unknown>;
}

export interface ShareReportListItem {
  id: string;
  tool_id: string;
  mode: ShareReportMode;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  max_views: number | null;
  view_count: number;
  last_viewed_at: string | null;
  payload?: Record<string, unknown> | null;
}

// === Tax Plan Workspace ===

export type TaxPlanStatus = "draft" | "active" | "archived";
export type TaxPlanCollaboratorRole = "owner" | "editor" | "viewer";

export interface TaxPlan {
  id: string;
  user_id: string;
  name: string;
  household_name: string | null;
  status: TaxPlanStatus;
  approved_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxPlanCreateRequest {
  name: string;
  household_name?: string | null;
}

export interface TaxPlanUpdateRequest {
  name?: string;
  household_name?: string | null;
  status?: TaxPlanStatus;
}

export interface TaxPlanVersion {
  id: string;
  plan_id: string;
  created_by_user_id: string;
  label: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown> | null;
  source: string;
  is_approved: boolean;
  approved_at: string | null;
  approved_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxPlanVersionCreateRequest {
  label: string;
  inputs: Record<string, unknown>;
  results?: Record<string, unknown> | null;
  source?: string;
}

export interface TaxPlanComment {
  id: string;
  plan_id: string;
  version_id: string | null;
  author_user_id: string;
  author_role: TaxPlanCollaboratorRole;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TaxPlanCommentCreateRequest {
  version_id?: string | null;
  author_role?: TaxPlanCollaboratorRole;
  body: string;
}

export interface TaxPlanCollaborator {
  id: string;
  plan_id: string;
  email: string;
  role: TaxPlanCollaboratorRole;
  invited_by_user_id: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxPlanCollaboratorCreateRequest {
  email: string;
  role: TaxPlanCollaboratorRole;
}

export interface TaxPlanEvent {
  id: string;
  plan_id: string;
  version_id: string | null;
  actor_user_id: string | null;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TaxPlanEventCreateRequest {
  version_id?: string | null;
  event_type: string;
  event_metadata?: Record<string, unknown>;
}
