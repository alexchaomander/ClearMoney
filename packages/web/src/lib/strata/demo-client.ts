"use client";

import type {
  ActionIntent,
  ActionIntentStatus,
  ActionIntentUpdate,
  ActionPolicyRequest,
  ActionPolicyResponse,
  AllAccountsResponse,
  BankAccount,
  BankTransaction,
  BankTransactionQuery,
  BankTransactionReimbursementUpdate,
  CashAccount,
  CashAccountCreate,
  CashAccountUpdate,
  Connection,
  ConnectionCallbackRequest,
  DebtAccount,
  DebtAccountCreate,
  DebtAccountUpdate,
  EquityPortfolioSummary,
  EquityProjection,
  EquityGrant,
  EquityGrantCreate,
  EquityGrantUpdate,
  AdvisorRecommendation,
  AdvisorSession,
  AdvisorSessionSummary,
  ConsentCreateRequest,
  ConsentResponse,
  DecisionTrace,
  FinancialContext,
  FinancialMemory,
  FinancialPassport,
  PaginatedBankTransactions,
  PlaidCallbackRequest,
  PlaidLinkRequest,
  PlaidLinkResponse,
  PointsProgram,
  CreditCardData,
  SavingsProduct,
  InvestmentData,
  RealAssetData,
  LiabilityData,
  IncomeData,
  CreditData,
  ProtectionData,
  ToolPresetBundle,
  ShareReportCreateRequest,
  ShareReportCreateResponse,
  ShareReportListItem,
  ShareReportPublicResponse,
  TaxPlan,
  TaxPlanCollaborator,
  TaxPlanCollaboratorCreateRequest,
  TaxPlanComment,
  TaxPlanCommentCreateRequest,
  TaxPlanCreateRequest,
  TaxPlanEvent,
  TaxPlanEventCreateRequest,
  TaxPlanUpdateRequest,
  TaxPlanVersion,
  TaxPlanVersionCreateRequest,
  PrefillTaxPlanRequest,
  PrefillTaxPlanResponse,
  SkillDetail,
  SkillSummary,
  SpendingSummary,
  TaxDocumentListResponse,
  TaxDocumentResponse,
  FinancialMemoryUpdate,
  DataHealthResponse,
  TransparencyPayload,
  ExecuteRecommendationRequest,
  ExecuteRecommendationResponse,
  HealthResponse,
  HoldingDetail,
  Institution,
  InvestmentAccount,
  InvestmentAccountCreate,
  InvestmentAccountUpdate,
  InvestmentAccountWithHoldings,
  LinkSessionRequest,
  LinkSessionResponse,
  MemoryEvent,
  NotificationResponse,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  PortfolioSummary,
  RunwayMetrics,
  SVPAttestation,
  StrataClientInterface,
  SubscriptionSummary,
  TaxShieldMetrics,
  Transaction,
  VulnerabilityReport,
  CreditCard,
  CryptoWallet,
  CryptoWalletCreate,
  CryptoPortfolioResponse,
} from "@clearmoney/strata-sdk";

import {
  DEMO_CONNECTIONS,
  DEMO_INSTITUTIONS,
  DEMO_INVESTMENT_ACCOUNTS,
  getDemoAccountsResponse,
  getDemoHoldings,
  getDemoInvestmentAccountWithHoldings,
  getDemoPortfolioHistory,
  getDemoPortfolioSummary,
  DEMO_POINTS_PROGRAMS,
  DEMO_CREDIT_CARD_DATA,
  DEMO_LIQUID_ASSETS,
  DEMO_INVESTMENT_DATA,
  DEMO_REAL_ASSET_DATA,
  DEMO_LIABILITY_DATA,
  DEMO_INCOME_DATA,
  DEMO_CREDIT_DATA,
  DEMO_PROTECTION_DATA,
  DEMO_TOOL_PRESETS,
  DEMO_DATA_HEALTH,
  DEMO_TRANSPARENCY_PAYLOAD,
} from "./demo-data";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DemoStrataClient implements StrataClientInterface {
  private static readonly BANK_TX_REIMBURSEMENTS_STORAGE_KEY = "clearmoney-demo-bank-tx-reimbursements.v1";

  private cryptoWallets: CryptoWallet[] = [
    {
      id: "demo-wallet-001",
      user_id: "demo-user-001",
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      chain: "ethereum",
      label: "Main ETH Wallet",
      last_balance_usd: 45200.50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "demo-wallet-002",
      user_id: "demo-user-001",
      address: "H8S9Pjdb6p56T3fSjS3vSjS3vSjS3vSjS3vSjS3vSjS3",
      chain: "solana",
      label: "Solana Phantom",
      last_balance_usd: 12450.75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  setClerkUserId(_userId: string | null): void {
    // no-op in demo mode
  }

  setAuthToken(_token: string | null): void {
    void _token;
    // no-op in demo mode
  }

  async healthCheck(): Promise<HealthResponse> {
    await delay(100);
    return { status: "ok", database: "ok" };
  }

  async getDataHealth(): Promise<DataHealthResponse> {
    await delay(120);
    return { ...DEMO_DATA_HEALTH };
  }

  async createLinkSession(
    _request?: LinkSessionRequest
  ): Promise<LinkSessionResponse> {
    void _request;
    await delay(800);
    return {
      redirect_url:
        "/connect/callback?demo=true&code=demo-code&state=demo-state",
      session_id: "demo-session",
    };
  }

  async handleConnectionCallback(
    _request: ConnectionCallbackRequest
  ): Promise<Connection> {
    void _request;
    await delay(1500);
    return DEMO_CONNECTIONS[0];
  }

  async getConnections(): Promise<Connection[]> {
    await delay(300);
    return DEMO_CONNECTIONS;
  }

  async deleteConnection(_connectionId: string): Promise<void> {
    void _connectionId;
    await delay(300);
    // no-op in demo mode
  }

  async syncConnection(_connectionId: string): Promise<Connection> {
    void _connectionId;
    await delay(300);
    return DEMO_CONNECTIONS[0];
  }

  async syncAllConnections(): Promise<Connection[]> {
    await delay(300);
    return DEMO_CONNECTIONS.map((conn) => ({
      ...conn,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  async getAccounts(): Promise<AllAccountsResponse> {
    await delay(300);
    return getDemoAccountsResponse();
  }

  async getInvestmentAccounts(): Promise<InvestmentAccount[]> {
    await delay(300);
    return DEMO_INVESTMENT_ACCOUNTS;
  }

  async getInvestmentAccount(
    accountId: string
  ): Promise<InvestmentAccountWithHoldings> {
    await delay(300);
    const account = getDemoInvestmentAccountWithHoldings(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }
    return account;
  }

  async searchInstitutions(
    query?: string,
    limit?: number
  ): Promise<Institution[]> {
    await delay(300);
    let results = DEMO_INSTITUTIONS;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (limit) {
      results = results.slice(0, limit);
    }
    return results;
  }

  async getPopularInstitutions(limit?: number): Promise<Institution[]> {
    await delay(300);
    return limit ? DEMO_INSTITUTIONS.slice(0, limit) : DEMO_INSTITUTIONS;
  }

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    await delay(300);
    return getDemoPortfolioSummary();
  }

  async getVulnerabilityReport(): Promise<VulnerabilityReport> {
    await delay(150);
    return {
      risk_score: 26,
      commingled_count: 3,
      commingled_amount: 1420.50,
      total_analyzed: 142,
      status: "warning",
    };
  }

  async getRunwayMetrics(): Promise<RunwayMetrics> {
    await delay(150);
    return {
      personal: { liquid_cash: 57340, monthly_burn: 6200, runway_months: 9.2 },
      entity: { liquid_cash: 410000, monthly_burn: 28000, runway_months: 14.6 },
    };
  }

  async getTaxShieldMetrics(): Promise<TaxShieldMetrics> {
    await delay(150);
    return {
      ytd_business_income: 184000,
      estimated_combined_tax_rate: 0.32,
      estimated_tax_ytd: 58880,
      next_quarterly_payment: 14600,
      safe_harbor_met: false,
    };
  }

  async getHoldings(): Promise<HoldingDetail[]> {
    await delay(300);
    return getDemoHoldings();
  }


  async getTransactions(
    _params?: { accountId?: string; startDate?: string; endDate?: string }
  ): Promise<Transaction[]> {
    void _params;
    await delay(300);
    return [];
  }

  async runRetirementMonteCarlo(params: {
    current_savings: number;
    monthly_contribution: number;
    years_to_retirement: number;
    retirement_duration_years: number;
    desired_annual_income: number;
  }): Promise<Record<string, unknown>> {
    await delay(200);
    const projected =
      params.current_savings +
      params.monthly_contribution * 12 * params.years_to_retirement;
    return {
      success_probability:
        projected > params.desired_annual_income * 15 ? 0.84 : 0.62,
      projected_balance: projected,
      assumptions: {
        years_to_retirement: params.years_to_retirement,
        retirement_duration_years: params.retirement_duration_years,
      },
    };
  }

  // === Investment Account CRUD ===

  async createInvestmentAccount(data: InvestmentAccountCreate): Promise<InvestmentAccount> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      connection_id: null,
      institution_id: null,
      institution_name: null,
      name: data.name,
      account_type: data.account_type,
      provider_account_id: null,
      balance: data.balance ?? 0,
      currency: "USD",
      is_tax_advantaged: data.is_tax_advantaged ?? false,
      is_business: data.is_business ?? false,
      created_at: now,
      updated_at: now,
    };
  }

  async updateInvestmentAccount(
    id: string,
    data: InvestmentAccountUpdate
  ): Promise<InvestmentAccount> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id,
      user_id: "demo-user-001",
      connection_id: null,
      institution_id: null,
      institution_name: null,
      name: data.name ?? "Updated Investment Account",
      account_type: data.account_type ?? "brokerage",
      provider_account_id: null,
      balance: data.balance ?? 0,
      currency: "USD",
      is_tax_advantaged: data.is_tax_advantaged ?? false,
      is_business: data.is_business ?? false,
      created_at: now,
      updated_at: now,
    };
  }

  async deleteInvestmentAccount(_id: string): Promise<void> {
    void _id;
    await delay(250);
  }

  // === Cash Account CRUD ===

  async createCashAccount(data: CashAccountCreate): Promise<CashAccount> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      name: data.name,
      account_type: data.account_type,
      balance: data.balance ?? 0,
      apy: data.apy ?? null,
      institution_name: data.institution_name ?? null,
      connection_id: null,
      provider_account_id: null,
      available_balance: null,
      mask: null,
      is_manual: true,
      created_at: now,
      updated_at: now,
    };
  }

  async updateCashAccount(id: string, data: CashAccountUpdate): Promise<CashAccount> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id,
      user_id: "demo-user-001",
      name: data.name ?? "Updated Account",
      account_type: data.account_type ?? "checking",
      balance: data.balance ?? 0,
      apy: data.apy ?? null,
      institution_name: data.institution_name ?? null,
      connection_id: null,
      provider_account_id: null,
      available_balance: null,
      mask: null,
      is_manual: true,
      created_at: now,
      updated_at: now,
    };
  }

  async deleteCashAccount(_id: string): Promise<void> {
    await delay(300);
  }

  // === Debt Account CRUD ===

  async createDebtAccount(data: DebtAccountCreate): Promise<DebtAccount> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      name: data.name,
      debt_type: data.debt_type,
      balance: data.balance ?? 0,
      interest_rate: data.interest_rate,
      minimum_payment: data.minimum_payment ?? 0,
      institution_name: data.institution_name ?? null,
      created_at: now,
      updated_at: now,
    };
  }

  async updateDebtAccount(id: string, data: DebtAccountUpdate): Promise<DebtAccount> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id,
      user_id: "demo-user-001",
      name: data.name ?? "Updated Debt",
      debt_type: data.debt_type ?? "credit_card",
      balance: data.balance ?? 0,
      interest_rate: data.interest_rate ?? 0,
      minimum_payment: data.minimum_payment ?? 0,
      institution_name: data.institution_name ?? null,
      created_at: now,
      updated_at: now,
    };
  }

  async deleteDebtAccount(_id: string): Promise<void> {
    await delay(300);
  }

  // === Portfolio History ===

  async getPortfolioHistory(range: PortfolioHistoryRange): Promise<PortfolioHistoryPoint[]> {
    await delay(300);
    return getDemoPortfolioHistory(range);
  }

  // === Financial Memory ===

  private demoMemory: FinancialMemory = {
    id: crypto.randomUUID(),
    user_id: "demo-user-001",
    age: 32,
    state: "CA",
    filing_status: "single",
    num_dependents: 0,
    annual_income: 125000,
    monthly_income: 10417,
    income_growth_rate: 0.03,
    federal_tax_rate: 0.24,
    state_tax_rate: 0.093,
    capital_gains_rate: 0.15,
    retirement_age: 65,
    current_retirement_savings: 85000,
    monthly_retirement_contribution: 1500,
    employer_match_pct: 0.04,
    expected_social_security: 2500,
    desired_retirement_income: 80000,
    home_value: null,
    mortgage_balance: null,
    mortgage_rate: null,
    monthly_rent: 2800,
    risk_tolerance: "moderate",
    investment_horizon_years: 33,
    monthly_savings_target: 2000,
    average_monthly_expenses: 6000,
    emergency_fund_target_months: 6,
    spending_categories_monthly: null,
    debt_profile: null,
    portfolio_summary: null,
    equity_compensation: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  private demoMemoryEvents: MemoryEvent[] = [];

  async getFinancialMemory(): Promise<FinancialMemory> {
    await delay(300);
    return { ...this.demoMemory };
  }

  async updateFinancialMemory(data: FinancialMemoryUpdate): Promise<FinancialMemory> {
    await delay(300);
    const { source: _source, source_context: _ctx, ...fields } = data;
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        const mem = this.demoMemory as unknown as Record<string, unknown>;
        const oldValue = mem[key];
        mem[key] = value;
        this.demoMemoryEvents.unshift({
          id: crypto.randomUUID(),
          user_id: "demo-user-001",
          field_name: key,
          old_value: oldValue != null ? String(oldValue) : null,
          new_value: value != null ? String(value) : null,
          source: _source ?? "user_input",
          context: _ctx ?? null,
          created_at: new Date().toISOString(),
        });
      }
    }
    this.demoMemory.updated_at = new Date().toISOString();
    return { ...this.demoMemory };
  }

  async getMemoryEvents(): Promise<MemoryEvent[]> {
    await delay(300);
    return [...this.demoMemoryEvents];
  }

  async deriveMemory(): Promise<FinancialMemory> {
    await delay(800);
    // Simulate deriving from accounts
    this.demoMemory.current_retirement_savings = 85000;
    this.demoMemory.updated_at = new Date().toISOString();
    return { ...this.demoMemory };
  }

  async getFinancialContext(format: 'json' | 'markdown' = 'json'): Promise<FinancialContext | string> {
    await delay(500);
    const context: FinancialContext = {
      profile: { ...this.demoMemory },
      accounts: {
        investment: [
          { name: "Vanguard 401(k)", type: "401k", balance: 85000, is_tax_advantaged: true },
          { name: "Robinhood Brokerage", type: "brokerage", balance: 42000 },
        ],
        cash: [
          { name: "Chase Checking", type: "checking", balance: 8500 },
          { name: "Marcus Savings", type: "savings", balance: 25000 },
        ],
        debt: [
          { name: "Student Loan", type: "student_loan", balance: 18000, interest_rate: 0.045, minimum_payment: 350 },
        ],
      },
      holdings: [
        { ticker: "VTI", name: "Vanguard Total Stock Market", security_type: "etf", quantity: 120, market_value: 32400, cost_basis: 28000, account: "Robinhood Brokerage" },
        { ticker: "VXUS", name: "Vanguard International Stock", security_type: "etf", quantity: 80, market_value: 9600, cost_basis: 8200, account: "Robinhood Brokerage" },
      ],
      recent_transactions: [],
      portfolio_metrics: {
        net_worth: 142500,
        total_investment_value: 127000,
        total_cash_value: 33500,
        total_debt_value: 18000,
        tax_advantaged_value: 85000,
        taxable_value: 42000,
      },
      data_freshness: {
        last_sync: new Date().toISOString(),
        profile_updated: this.demoMemory.updated_at,
        accounts_count: 5,
        connections_count: 2,
      },
    };

    if (format === 'markdown') {
      return `## Financial Profile\n- Age: 32\n- Income: $125,000\n\n## Portfolio Summary\n- Net Worth: $142,500`;
    }
    return context;
  }

  async listNotifications(): Promise<NotificationResponse[]> {
    await delay(120);
    return [];
  }

  async updateNotification(
    id: string,
    data: { is_read: boolean }
  ): Promise<NotificationResponse> {
    await delay(120);
    const now = new Date().toISOString();
    return {
      id,
      type: "info",
      severity: "info",
      title: "Demo Notification",
      message: "Demo notification updated.",
      metadata_json: null,
      is_read: data.is_read,
      action_url: null,
      created_at: now,
      updated_at: now,
    };
  }

  async markAllNotificationsRead(): Promise<{ status: string }> {
    await delay(120);
    return { status: "ok" };
  }

  // === Action Policy ===

  async getActionPolicy(): Promise<ActionPolicyResponse> {
    await delay(100);
    const now = new Date().toISOString();
    return {
      id: "demo-action-policy",
      allowed_actions: ["savings_transfer"],
      max_amount: 500,
      require_confirmation: true,
      require_mfa: false,
      status: "active",
      created_at: now,
      updated_at: now,
    };
  }

  async upsertActionPolicy(
    data: ActionPolicyRequest
  ): Promise<ActionPolicyResponse> {
    await delay(120);
    const now = new Date().toISOString();
    return {
      id: "demo-action-policy",
      allowed_actions: data.allowed_actions,
      max_amount: data.max_amount,
      require_confirmation: data.require_confirmation,
      require_mfa: data.require_mfa,
      status: data.status,
      created_at: now,
      updated_at: now,
    };
  }

  // === Skills ===

  async getSkills(): Promise<SkillSummary[]> {
    await delay(300);
    return [];
  }

  async getAvailableSkills(): Promise<SkillSummary[]> {
    await delay(300);
    return [];
  }

  async getSkill(name: string): Promise<SkillDetail> {
    throw new Error(`Skill '${name}' not found`);
  }

  // === Advisor ===

  async createAdvisorSession(
    _skillName?: string,
    _vanishMode?: boolean
  ): Promise<AdvisorSession> {
    await delay(300);
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      skill_name: _skillName ?? null,
      status: "active",
      vanish_mode: _vanishMode ?? false,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getAdvisorSessions(): Promise<AdvisorSessionSummary[]> {
    return [];
  }

  async getAdvisorSession(sessionId: string): Promise<AdvisorSession> {
    throw new Error("Session not found");
  }

  async sendAdvisorMessage(sessionId: string, content: string): Promise<ReadableStream<Uint8Array>> {
    throw new Error("Not implemented in simplified demo client");
  }

  async getRecommendations(): Promise<AdvisorRecommendation[]> {
    return [];
  }

  async executeRecommendation(
    recommendationId: string,
    request: ExecuteRecommendationRequest
  ): Promise<ExecuteRecommendationResponse> {
    throw new Error("Not implemented in demo mode");
  }

  async getDecisionTraces(): Promise<DecisionTrace[]> {
    return [];
  }

  // === Consent ===

  async listConsents(): Promise<ConsentResponse[]> {
    return [];
  }

  async createConsent(data: ConsentCreateRequest): Promise<ConsentResponse> {
    return {
      id: "demo-consent",
      user_id: "demo-user-001",
      scopes: data.scopes,
      purpose: data.purpose,
      status: "active",
      source: data.source ?? "demo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async revokeConsent(consentId: string): Promise<ConsentResponse> {
    throw new Error("Not implemented in demo mode");
  }

  // === Credit Cards ===

  async getCreditCards(): Promise<CreditCard[]> {
    return [];
  }

  async getCreditCard(id: string): Promise<CreditCard> {
    throw new Error("Card not found");
  }

  async seedAmexPlatinum(): Promise<CreditCard> {
    throw new Error("Not implemented in demo mode");
  }

  // === Shared Data ===

  async getPointsPrograms(): Promise<PointsProgram[]> {
    return DEMO_POINTS_PROGRAMS;
  }

  async getCreditCardData(): Promise<CreditCardData[]> {
    return DEMO_CREDIT_CARD_DATA;
  }

  async getLiquidAssets(): Promise<SavingsProduct[]> {
    return DEMO_LIQUID_ASSETS;
  }

  async getInvestments(): Promise<InvestmentData> {
    return DEMO_INVESTMENT_DATA;
  }

  async getRealAssets(): Promise<RealAssetData> {
    return DEMO_REAL_ASSET_DATA;
  }

  async getLiabilities(): Promise<LiabilityData> {
    return DEMO_LIABILITY_DATA;
  }

  async getIncome(): Promise<IncomeData> {
    return DEMO_INCOME_DATA;
  }

  async getCredit(): Promise<CreditData> {
    return DEMO_CREDIT_DATA;
  }

  async getProtection(): Promise<ProtectionData> {
    return DEMO_PROTECTION_DATA;
  }

  async getToolPresets(): Promise<ToolPresetBundle> {
    return DEMO_TOOL_PRESETS;
  }

  async getTransparencyPayload(): Promise<TransparencyPayload> {
    return DEMO_TRANSPARENCY_PAYLOAD;
  }

  // === Banking (Plaid) ===

  async createPlaidLinkToken(_request?: PlaidLinkRequest): Promise<PlaidLinkResponse> {
    await delay(500);
    return {
      link_token: "demo-link-token",
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async handlePlaidCallback(request: PlaidCallbackRequest): Promise<Connection> {
    await delay(1500);
    return DEMO_CONNECTIONS[0];
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    await delay(300);
    return [
      {
        id: "demo-cash-001",
        user_id: "demo-user-001",
        connection_id: "demo-conn-chase",
        name: "Chase Checking",
        account_type: "checking",
        balance: 12340.0,
        available_balance: 12100.0,
        institution_name: "Chase",
        mask: "1234",
        is_manual: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-cash-biz-001",
        user_id: "demo-user-001",
        connection_id: "demo-conn-mercury",
        name: "ClearMoney Operating",
        account_type: "checking",
        balance: 410000.0,
        available_balance: 408500.0,
        institution_name: "Mercury",
        mask: "0420",
        is_manual: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async getBankTransactions(params?: BankTransactionQuery): Promise<PaginatedBankTransactions> {
    await delay(500);
    const transactions = [
      {
        id: "demo-tx-1",
        cash_account_id: "demo-cash-biz-001",
        provider_transaction_id: "ptx-1",
        amount: 18000,
        transaction_date: new Date(Date.now() - 6 * ONE_DAY_MS).toISOString().slice(0, 10),
        posted_date: new Date(Date.now() - 6 * ONE_DAY_MS).toISOString().slice(0, 10),
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
        id: "demo-tx-2",
        cash_account_id: "demo-cash-biz-001",
        provider_transaction_id: "ptx-2",
        amount: -1250.00,
        transaction_date: new Date(Date.now() - 5 * ONE_DAY_MS).toISOString().slice(0, 10),
        posted_date: new Date(Date.now() - 5 * ONE_DAY_MS).toISOString().slice(0, 10),
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
        id: "demo-tx-3",
        cash_account_id: "demo-cash-001",
        provider_transaction_id: "ptx-3",
        amount: -45.67,
        transaction_date: new Date(Date.now() - 1 * ONE_DAY_MS).toISOString().slice(0, 10),
        posted_date: new Date(Date.now() - 1 * ONE_DAY_MS).toISOString().slice(0, 10),
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
      {
        id: "demo-tx-4",
        cash_account_id: "demo-cash-biz-001",
        provider_transaction_id: "ptx-4",
        amount: -2000.00,
        transaction_date: new Date(Date.now() - 2 * ONE_DAY_MS).toISOString().slice(0, 10),
        posted_date: new Date(Date.now() - 2 * ONE_DAY_MS).toISOString().slice(0, 10),
        name: "OPENAI",
        primary_category: "GENERAL_SERVICES",
        detailed_category: "GENERAL_SERVICES_SOFTWARE",
        merchant_name: "OpenAI",
        payment_channel: "online",
        pending: false,
        iso_currency_code: "USD",
        reimbursed_at: null,
        reimbursement_memo: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    return { transactions, total: transactions.length, page: 1, page_size: 50, total_pages: 1 };
  }

  async updateBankTransactionReimbursement(
    transactionId: string,
    data: BankTransactionReimbursementUpdate
  ): Promise<BankTransaction> {
    throw new Error("Not implemented in demo mode");
  }

  async getSpendingSummary(_months: number = 3): Promise<SpendingSummary> {
    await delay(300);
    return {
      total_spending: 31200,
      monthly_average: 10400,
      categories: [
        { category: "GENERAL_SERVICES", total: 18000, percentage: 57.7, transaction_count: 24 },
        { category: "FOOD_AND_DRINK", total: 4200, percentage: 13.5, transaction_count: 58 },
        { category: "TRANSPORTATION", total: 3500, percentage: 11.2, transaction_count: 42 },
        { category: "SHOPPING", total: 2500, percentage: 8.0, transaction_count: 15 },
        { category: "RENT_AND_UTILITIES", total: 3000, percentage: 9.6, transaction_count: 3 },
      ],
      start_date: new Date(Date.now() - 90 * ONE_DAY_MS).toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      months_analyzed: 3,
    };
  }

  async getSubscriptions(): Promise<SubscriptionSummary> {
    await delay(200);
    const subscriptions: Subscription[] = [
      { merchant: "AWS", amount: 1250.00, monthly_impact: 1250.00, frequency: "monthly", last_date: "2026-01-01", category: "Cloud" },
      { merchant: "Google Workspace", amount: 144.00, monthly_impact: 144.00, frequency: "monthly", last_date: "2026-01-12", category: "Productivity" },
      { merchant: "Slack", amount: 88.00, monthly_impact: 88.00, frequency: "monthly", last_date: "2026-01-15", category: "Communication" },
      { merchant: "OpenAI", amount: 2000.00, monthly_impact: 2000.00, frequency: "monthly", last_date: "2026-01-20", category: "AI" },
      { merchant: "GitHub", amount: 42.00, monthly_impact: 42.00, frequency: "monthly", last_date: "2026-01-22", category: "Development" },
    ];
    const total = subscriptions.reduce((sum, s) => sum + s.monthly_impact, 0);
    return { 
      subscriptions, 
      total_monthly_subscription_burn: total, 
      subscription_count: subscriptions.length 
    };
  }

  // === Share Reports ===

  async createShareReport(data: ShareReportCreateRequest): Promise<ShareReportCreateResponse> {
    throw new Error("Not implemented in demo mode");
  }

  async getShareReport(reportId: string, token: string): Promise<ShareReportPublicResponse> {
    throw new Error("Not implemented in demo mode");
  }

  async listShareReports(params?: { toolId?: string; limit?: number; includePayload?: boolean }): Promise<ShareReportListItem[]> {
    return [];
  }

  async rotateShareReport(reportId: string, params?: { expiresInDays?: number | null }): Promise<ShareReportCreateResponse> {
    throw new Error("Not implemented in demo mode");
  }

  async revokeShareReport(reportId: string): Promise<{ status: string }> {
    throw new Error("Not implemented in demo mode");
  }

  // === Tax Plan Workspace ===

  async createTaxPlan(data: TaxPlanCreateRequest): Promise<TaxPlan> {
    throw new Error("Not implemented in demo mode");
  }

  async listTaxPlans(params?: { limit?: number }): Promise<TaxPlan[]> {
    return [];
  }

  async getTaxPlan(planId: string): Promise<TaxPlan> {
    throw new Error("Not found");
  }

  async updateTaxPlan(planId: string, data: TaxPlanUpdateRequest): Promise<TaxPlan> {
    throw new Error("Not found");
  }

  async createTaxPlanVersion(planId: string, data: TaxPlanVersionCreateRequest): Promise<TaxPlanVersion> {
    throw new Error("Not found");
  }

  async listTaxPlanVersions(planId: string, params?: { limit?: number }): Promise<TaxPlanVersion[]> {
    return [];
  }

  async approveTaxPlanVersion(planId: string, versionId: string): Promise<TaxPlanVersion> {
    throw new Error("Not found");
  }

  async createTaxPlanComment(planId: string, data: TaxPlanCommentCreateRequest): Promise<TaxPlanComment> {
    throw new Error("Not found");
  }

  async listTaxPlanComments(planId: string, params?: { limit?: number }): Promise<TaxPlanComment[]> {
    return [];
  }

  async addTaxPlanCollaborator(planId: string, data: TaxPlanCollaboratorCreateRequest): Promise<TaxPlanCollaborator> {
    throw new Error("Not found");
  }

  async listTaxPlanCollaborators(planId: string): Promise<TaxPlanCollaborator[]> {
    return [];
  }

  async revokeTaxPlanCollaborator(planId: string, collaboratorId: string): Promise<{ status: string }> {
    throw new Error("Not found");
  }

  async createTaxPlanEvent(planId: string, data: TaxPlanEventCreateRequest): Promise<TaxPlanEvent> {
    throw new Error("Not found");
  }

  async listTaxPlanEvents(planId: string, params?: { limit?: number }): Promise<TaxPlanEvent[]> {
    return [];
  }

  // === Tax Documents ===

  async uploadTaxDocument(file: File | Blob, filename: string, documentTypeHint?: string): Promise<TaxDocumentResponse> {
    throw new Error("Not implemented in demo mode");
  }

  async listTaxDocuments(limit?: number): Promise<TaxDocumentListResponse[]> {
    return [];
  }

  async getTaxDocument(documentId: string): Promise<TaxDocumentResponse> {
    throw new Error("Not found");
  }

  async deleteTaxDocument(documentId: string): Promise<void> {
    throw new Error("Not found");
  }

  async prefillTaxPlan(data: PrefillTaxPlanRequest): Promise<PrefillTaxPlanResponse> {
    throw new Error("Not found");
  }

  // === Action Intents ===

  async getActionIntents(status?: ActionIntentStatus): Promise<ActionIntent[]> {
    return [];
  }

  async getActionIntent(intentId: string): Promise<ActionIntent> {
    throw new Error("Not found");
  }

  async updateActionIntent(intentId: string, data: ActionIntentUpdate): Promise<ActionIntent> {
    throw new Error("Not found");
  }

  async getIntentManifest(intentId: string): Promise<Blob> {
    throw new Error("Not found");
  }

  // === Portability ===

  async exportFinancialPassport(): Promise<FinancialPassport> {
    throw new Error("Not implemented in demo mode");
  }

  // === Equity ===

  async getEquityPortfolio(): Promise<EquityPortfolioSummary> {
    await delay(150);
    return {
      total_vested_value: 125000,
      total_unvested_value: 450000,
      total_value: 575000,
      grant_valuations: [
        {
          symbol: "AAPL",
          current_price: 185.42,
          vested_quantity: 674,
          unvested_quantity: 2426,
          vested_value: 125000,
          unvested_value: 450000,
          total_value: 575000,
          next_vest_date: "2026-04-15",
          next_vest_quantity: 150,
        },
      ],
    };
  }

  async getEquityProjections(): Promise<EquityProjection[]> {
    await delay(200);
    const today = new Date();
    return Array.from({ length: 25 }, (_, i) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      return {
        date: date.toISOString(),
        total_value: String(575000 + (i * 2000)), // Slight appreciation
        liquid_value: String(125000 + (Math.floor(i / 3) * 35000)), // Quarterly vests
      };
    });
  }

  async createEquityGrant(data: EquityGrantCreate): Promise<EquityGrant> {
    await delay(300);
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      symbol: data.symbol,
      grant_name: data.grant_name,
      grant_type: data.grant_type,
      quantity: data.quantity,
      strike_price: data.strike_price ?? null,
      grant_date: data.grant_date,
      vesting_schedule: data.vesting_schedule ?? null,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateEquityGrant(id: string, data: EquityGrantUpdate): Promise<EquityGrant> {
    await delay(300);
    return {
      id,
      user_id: "demo-user-001",
      symbol: data.symbol ?? "AAPL",
      grant_name: data.grant_name ?? "Common Stock",
      grant_type: data.grant_type ?? "rsu",
      quantity: data.quantity ?? 1000,
      strike_price: data.strike_price ?? null,
      grant_date: data.grant_date ?? "2024-01-01",
      vesting_schedule: data.vesting_schedule ?? null,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async deleteEquityGrant(_id: string): Promise<void> {
    await delay(250);
  }

  // === Crypto ===

  async listCryptoWallets(): Promise<CryptoWallet[]> {
    await delay(200);
    return [...this.cryptoWallets];
  }

  async addCryptoWallet(data: CryptoWalletCreate): Promise<CryptoWallet> {
    await delay(500);
    const newWallet: CryptoWallet = {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      address: data.address,
      chain: data.chain,
      label: data.label ?? "Added Wallet",
      last_balance_usd: 12500.00, // Simulated initial balance
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.cryptoWallets.push(newWallet);
    return newWallet;
  }

  async deleteCryptoWallet(walletId: string): Promise<void> {
    await delay(300);
    this.cryptoWallets = this.cryptoWallets.filter(w => w.id !== walletId);
  }

  async deleteAllCryptoWallets(): Promise<void> {
    await delay(300);
    this.cryptoWallets = [];
  }

  async getCryptoPortfolio(): Promise<CryptoPortfolioResponse> {
    await delay(600);
    if (this.cryptoWallets.length === 0) {
      return {
        wallets: [],
        total_value_usd: 0,
        assets: [],
        defi_positions: []
      };
    }

    const assets = [
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: 4.25,
        balance_usd: 9850.50,
        current_price: 2317.76,
        chain: "ethereum" as const,
        contract_address: null,
        logo_url: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: 12500.00,
        balance_usd: 12500.00,
        current_price: 1.00,
        chain: "ethereum" as const,
        contract_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        logo_url: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
      },
      {
        symbol: "SOL",
        name: "Solana",
        balance: 42.5,
        balance_usd: 5418.75,
        current_price: 127.50,
        chain: "solana" as const,
        contract_address: null,
        logo_url: "https://assets.coingecko.com/coins/images/4128/small/solana.png"
      },
      {
        symbol: "JUP",
        name: "Jupiter",
        balance: 1200,
        balance_usd: 1320.00,
        current_price: 1.10,
        chain: "solana" as const,
        contract_address: "JUPyiKBSn7W9zFicNsSQQWYC8U61TNjJ6H27vj9F9D6",
        logo_url: "https://assets.coingecko.com/coins/images/34188/small/jup.png"
      }
    ];
    const defi_positions = [
      {
        protocol_name: "Aave V3",
        protocol_logo: "https://assets.coingecko.com/markets/images/698/small/aave.png",
        position_type: "Lending",
        value_usd: 22850.00,
        assets: [
          {
            symbol: "WETH",
            name: "Wrapped Ether",
            balance: 10.0,
            balance_usd: 23177.60,
            current_price: 2317.76,
            chain: "ethereum" as const,
            contract_address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            logo_url: null
          }
        ]
      },
      {
        protocol_name: "Uniswap V3",
        protocol_logo: "https://assets.coingecko.com/markets/images/665/small/uniswap-v3.png",
        position_type: "LP",
        value_usd: 5640.25,
        assets: [
          {
            symbol: "USDC/ETH",
            name: "USDC/ETH LP",
            balance: 1.0,
            balance_usd: 5640.25,
            current_price: 5640.25,
            chain: "ethereum" as const,
            contract_address: null,
            logo_url: null
          }
        ]
      }
    ];

    const total_value_usd =
      assets.reduce((sum, a) => sum + a.balance_usd, 0) +
      defi_positions.reduce((sum, p) => sum + p.value_usd, 0);

    return {
      wallets: this.cryptoWallets,
      total_value_usd,
      assets,
      defi_positions,
    };
  }

  // === Verification (SVP) ===

  async generateProofOfFunds(threshold: number): Promise<SVPAttestation> {
    throw new Error("Not implemented in demo mode");
  }

  async validateAttestation(attestation: SVPAttestation): Promise<{ 
    valid: boolean; 
    statement: string | null;
    issued_at: string;
    expires_at: string;
  }> {
    throw new Error("Not implemented in demo mode");
  }

  private loadBankTxReimbursements(): Record<string, { reimbursed_at: string; reimbursement_memo: string | null }> {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(DemoStrataClient.BANK_TX_REIMBURSEMENTS_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private persistBankTxReimbursements(data: Record<string, { reimbursed_at: string; reimbursement_memo: string | null }>): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DemoStrataClient.BANK_TX_REIMBURSEMENTS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}
