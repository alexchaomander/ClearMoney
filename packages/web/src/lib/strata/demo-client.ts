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
  ContextQuality,
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
  FinancialCorrection,
  FinancialCorrectionCreate,
  RecommendationReview,
  RecommendationReviewConvertToCorrection,
  RecommendationReviewCreate,
  RecommendationReviewResolve,
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
  UserResponse,
  MetricTrace,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  PortfolioSummary,
  RunwayMetrics,
  SVPAttestation,
  StrataClientInterface,
  Subscription,
  SubscriptionSummary,
  TaxShieldMetrics,
  Transaction,
  VulnerabilityReport,
  CreditCard,
  CryptoWallet,
  CryptoWalletCreate,
  CryptoPortfolioResponse,
  PhysicalAssetsSummary,
  RealEstateAsset,
  RealEstateAssetCreate,
  RealEstateAssetUpdate,
  VehicleAsset,
  VehicleAssetCreate,
  VehicleAssetUpdate,
  CollectibleAsset,
  CollectibleAssetCreate,
  CollectibleAssetUpdate,
  PreciousMetalAsset,
  PreciousMetalAssetCreate,
  PreciousMetalAssetUpdate,
  AlternativeAsset,
  AlternativeAssetCreate,
  AlternativeAssetUpdate,
  AssetValuation,
  ValuationRefreshResponse,
  PropertySearchRequest,
  PropertySearchResult,
  VehicleSearchRequest,
  VehicleSearchResult,
  Invoice,
  UpgradeResponse,
  BriefingSummary,
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
  getDemoPhysicalAssetsSummary,
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DemoStrataClient implements StrataClientInterface {
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
  ): Promise<{ status: string }> {
    void _request;
    await delay(1500);
    return { status: "success" };
  }

  async getConnections(): Promise<Connection[]> {
    await delay(300);
    return DEMO_CONNECTIONS;
  }

  async deleteConnection(_connectionId: string): Promise<{ status: string }> {
    void _connectionId;
    await delay(300);
    return { status: "success" };
  }

  async syncConnection(_connectionId: string): Promise<{ status: string }> {
    void _connectionId;
    await delay(300);
    return { status: "success" };
  }

  async syncAllConnections(): Promise<{ status: string }> {
    await delay(300);
    return { status: "success" };
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
      ytd_1099_income: 184000,
      ytd_w2_income: 120000,
      estimated_federal_tax: 42000,
      estimated_state_tax: 15000,
      estimated_self_employment_tax: 25000,
      total_tax_liability_ytd: 82000,
      next_quarterly_payment: 20500,
      current_quarter: 2,
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

  async getFinancialMemory(): Promise<FinancialMemory> {
    await delay(300);
    return {
      id: "demo-memory",
      user_id: "demo-user",
      age: 32,
      state: "CA",
      filing_status: "single",
      num_dependents: 0,
      annual_income: 185000,
      monthly_income: 15400,
      income_growth_rate: 0.05,
      federal_tax_rate: 0.24,
      state_tax_rate: 0.09,
      capital_gains_rate: 0.15,
      retirement_age: 55,
      current_retirement_savings: 142000,
      monthly_retirement_contribution: 2500,
      employer_match_pct: 0.04,
      expected_social_security: 2800,
      desired_retirement_income: 120000,
      home_value: 1250000,
      mortgage_balance: 840000,
      mortgage_rate: 0.0325,
      monthly_rent: null,
      risk_tolerance: "moderate",
      investment_horizon_years: 25,
      monthly_savings_target: 4000,
      average_monthly_expenses: 6800,
      emergency_fund_target_months: 6,
      spending_categories_monthly: {
        housing: 3200,
        food: 800,
        transport: 400,
        lifestyle: 1200,
        other: 1200,
      },
      debt_profile: null,
      portfolio_summary: null,
      equity_compensation: null,
      notes: {},
      employer_name: "Demo Employer INC",
      employer_industry: "Technology",
      life_insurance_benefit: 1000000,
      disability_insurance_benefit: 7000,
      umbrella_policy_limit: null,
      has_will: true,
      has_trust: false,
      has_poa: true,
      entity_type: "s_corp",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateFinancialMemory(data: FinancialMemoryUpdate): Promise<FinancialMemory> {
    await delay(500);
    const current = await this.getFinancialMemory();
    return { ...current, ...data } as FinancialMemory;
  }

  async deriveMemory(): Promise<FinancialMemory> {
    await delay(1500);
    return this.getFinancialMemory();
  }

  async getMemoryEvents(): Promise<MemoryEvent[]> {
    await delay(300);
    return [];
  }

  async getFinancialContext(format: 'json' | 'markdown' = 'json'): Promise<FinancialContext | string> {
    await delay(1000);
    if (format === 'markdown') return "Demo Context Markdown";
    return {
      profile: { age: 32, income: 185000 },
      accounts: {
        investment: [
          { name: "Main Brokerage", type: "brokerage", balance: 142000, is_tax_advantaged: false },
          { name: "Roth IRA", type: "roth_ira", balance: 45000, is_tax_advantaged: true }
        ],
        cash: [
          { name: "High Yield Savings", type: "savings", balance: 52000 }
        ],
        debt: [
          { name: "Primary Mortgage", type: "mortgage", balance: 840000, interest_rate: 0.0325, minimum_payment: 3800 }
        ],
        real_estate: [],
        vehicles: [],
        collectibles: [],
        precious_metals: [],
        alternative_assets: [],
        crypto_wallets: [],
      },
      holdings: [],
      equity: {},
      recent_transactions: [],
      portfolio_metrics: {
        net_worth: 642000,
        total_investment_value: 187000,
        total_cash_value: 52000,
        total_debt_value: 840000,
        tax_advantaged_value: 45000,
        taxable_value: 142000
      },
      data_freshness: {
        last_sync: new Date().toISOString(),
        profile_updated: new Date().toISOString(),
        accounts_count: 4,
        connections_count: 2
      }
    };
  }

  // === Account ===

  async getMe(): Promise<UserResponse> {
    await delay(300);
    return {
      id: "demo-user-001",
      clerk_id: "user_2demo",
      email: "demo@clearmoney.ai",
      plan: "free",
      subscription_status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async upgradeAccount(): Promise<UpgradeResponse> {
    await delay(1000);
    return { checkout_url: "https://checkout.stripe.com/pay/cs_test_mock" };
  }

  async exportAccountData(): Promise<any> {
    await delay(1500);
    return { status: "success", data: {} };
  }

  async deleteAccount(): Promise<void> {
    await delay(1000);
  }

  // === Notifications ===

  async listNotifications(): Promise<NotificationResponse[]> {
    await delay(200);
    return [
      {
        id: "notif-1",
        type: "alert",
        severity: "warning",
        title: "Large Transaction Detected",
        message: "A transaction of $4,500 was detected at 'Apple Store'.",
        metadata_json: {},
        is_read: false,
        action_url: "/dashboard/transactions",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  async updateNotification(id: string, data: { is_read: boolean }): Promise<NotificationResponse> {
    await delay(100);
    const all = await this.listNotifications();
    return { ...all[0], ...data };
  }

  async markAllNotificationsRead(): Promise<{ status: string }> {
    await delay(300);
    return { status: "success" };
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
    await delay(300);
    return { name, display_name: name, description: "", required_context: [], output_format: "", optional_context: [], tools: [], content: "" };
  }

  // === Action Policy ===

  async getActionPolicy(): Promise<ActionPolicyResponse> {
    await delay(300);
    return {
      id: "policy-1",
      allowed_actions: ["rebalance", "transfer"],
      max_amount: 10000,
      require_confirmation: true,
      require_mfa: false,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async upsertActionPolicy(data: ActionPolicyRequest): Promise<ActionPolicyResponse> {
    await delay(500);
    return {
      id: "policy-1",
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // === Advisor ===

  async createAdvisorSession(skillName?: string, vanishMode?: boolean): Promise<AdvisorSession> {
    await delay(500);
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user",
      skill_name: skillName ?? null,
      status: "active",
      vanish_mode: vanishMode,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getAdvisorSessions(): Promise<AdvisorSessionSummary[]> {
    await delay(300);
    return [];
  }

  async getInvoices(): Promise<Invoice[]> {
    await delay(300);
    return [
      {
        id: "in_demo1",
        amount: 29.00,
        status: "paid",
        date: Math.floor(Date.now() / 1000) - 86400 * 30,
        pdf_url: "#",
      }
    ];
  }

  async getAdvisorBriefing(): Promise<BriefingSummary> {
    await delay(300);
    return {
      last_login: new Date().toISOString(),
      items: []
    };
  }

  async getAdvisorSession(sessionId: string): Promise<AdvisorSession> {
    await delay(300);
    return {
      id: sessionId,
      user_id: "demo-user",
      skill_name: null,
      status: "active",
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async sendAdvisorMessage(_sessionId: string, _content: string): Promise<ReadableStream<Uint8Array>> {
    await delay(1000);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Demo message chunk"));
        controller.close();
      }
    });
  }

  async getRecommendations(): Promise<AdvisorRecommendation[]> {
    await delay(300);
    return [];
  }

  async executeRecommendation(id: string, _request: ExecuteRecommendationRequest): Promise<ExecuteRecommendationResponse> {
    await delay(1500);
    return {
      recommendation_id: id,
      action: "rebalance",
      status: "success",
      result: {},
      trace_id: "trace-123",
      updated_at: new Date().toISOString()
    };
  }

  async getDecisionTraces(params?: { sessionId?: string; recommendationId?: string }): Promise<DecisionTrace[]> {
    void params;
    await delay(300);
    return [];
  }

  async getMetricTrace(metricId: string): Promise<MetricTrace> {
    await delay(200);
    return {
      metric_id: metricId,
      formula_id: `demo.${metricId}`,
      formula_version: "2.0.0",
      label: metricId,
      formula: "Demo Formula",
      description: "Demo provenance trace.",
      data_points: [],
      components: [],
      confidence_score: 0.88,
      confidence_factors: [],
      determinism_class: "deterministic",
      source_tier: "derived_context",
      continuity_status: "healthy",
      recommendation_readiness: "ready",
      coverage_status: "full",
      methodology_version: "2.0.0",
      as_of: new Date().toISOString(),
      warnings: [],
      policy_version: "context-policy-v1",
      correction_targets: [],
    };
  }

  async getContextQuality(): Promise<ContextQuality> {
    await delay(200);
    return {
      continuity_status: "healthy",
      recommendation_readiness: "ready",
      confidence_score: 0.9,
      freshness: {
        is_fresh: true,
        age_hours: 2,
        max_age_hours: 24,
        last_sync: new Date().toISOString(),
        warning: null,
      },
      coverage_ratio: 1,
      active_connection_count: 3,
      total_connection_count: 3,
      stale_connection_count: 0,
      errored_connection_count: 0,
      warnings: [],
      confidence_factors: [],
    };
  }

  async createCorrection(data: FinancialCorrectionCreate): Promise<FinancialCorrection> {
    await delay(300);
    const now = new Date().toISOString();
    return {
      id: "corr-1",
      user_id: "u1",
      trace_id: data.trace_id ?? null,
      metric_id: data.metric_id ?? null,
      correction_type: data.correction_type,
      status: "applied",
      target_field: data.target_field,
      target_id: data.target_id ?? null,
      summary: data.summary ?? null,
      reason: data.reason,
      original_value: {},
      proposed_value: data.proposed_value,
      resolved_value: data.proposed_value,
      impact_summary: {},
      created_at: now,
      updated_at: now,
    };
  }

  async getCorrections(_metricId?: string): Promise<FinancialCorrection[]> {
    await delay(200);
    return [];
  }

  async createRecommendationReview(data: RecommendationReviewCreate): Promise<RecommendationReview> {
    await delay(250);
    const now = new Date().toISOString();
    return {
      id: "demo-review-1",
      user_id: "demo-user-001",
      decision_trace_id: data.decision_trace_id,
      recommendation_id: data.recommendation_id ?? null,
      review_type: data.review_type ?? "user_dispute",
      status: "open",
      opened_reason: data.opened_reason,
      resolution: null,
      resolution_notes: null,
      applied_changes: {},
      reviewer_label: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    };
  }

  async getRecommendationReviews(_params?: {
    status?: string;
    recommendationId?: string;
    decisionTraceId?: string;
  }): Promise<RecommendationReview[]> {
    await delay(200);
    return [];
  }

  async resolveRecommendationReview(
    reviewId: string,
    data: RecommendationReviewResolve
  ): Promise<RecommendationReview> {
    await delay(250);
    const now = new Date().toISOString();
    return {
      id: reviewId,
      user_id: "demo-user-001",
      decision_trace_id: "demo-trace-1",
      recommendation_id: null,
      review_type: "human_review",
      status: data.status,
      opened_reason: "Demo review",
      resolution: data.resolution,
      resolution_notes: data.resolution_notes ?? null,
      applied_changes: data.applied_changes ?? {},
      reviewer_label: data.reviewer_label ?? null,
      resolved_at: now,
      created_at: now,
      updated_at: now,
    };
  }

  async reopenRecommendationReview(
    reviewId: string,
    notes?: string
  ): Promise<RecommendationReview> {
    await delay(250);
    const now = new Date().toISOString();
    return {
      id: reviewId,
      user_id: "demo-user-001",
      decision_trace_id: "demo-trace-1",
      recommendation_id: null,
      review_type: "human_review",
      status: "open",
      opened_reason: "Demo review",
      resolution: null,
      resolution_notes: notes ?? null,
      applied_changes: {},
      reviewer_label: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    };
  }

  async convertRecommendationReviewToCorrection(
    reviewId: string,
    data: RecommendationReviewConvertToCorrection
  ): Promise<RecommendationReview> {
    await delay(250);
    const now = new Date().toISOString();
    return {
      id: reviewId,
      user_id: "demo-user-001",
      decision_trace_id: data.correction.trace_id ?? "demo-trace-1",
      recommendation_id: null,
      review_type: "user_dispute",
      status: "converted_to_correction",
      opened_reason: "Demo review",
      resolution: "converted_to_correction",
      resolution_notes: data.resolution_notes ?? null,
      applied_changes: { correction_id: "demo-correction-1" },
      reviewer_label: data.reviewer_label ?? null,
      resolved_at: now,
      created_at: now,
      updated_at: now,
    };
  }

  // === Consent ===

  async listConsents(): Promise<ConsentResponse[]> {
    await delay(300);
    return [];
  }

  async createConsent(data: ConsentCreateRequest): Promise<ConsentResponse> {
    await delay(300);
    const now = new Date().toISOString();
    return { id: "c1", user_id: "u1", scopes: data.scopes, purpose: data.purpose, status: "active", source: data.source ?? "user", created_at: now, updated_at: now };
  }

  async revokeConsent(consentId: string): Promise<ConsentResponse> {
    await delay(300);
    const now = new Date().toISOString();
    return { id: consentId, user_id: "u1", scopes: [], purpose: "", status: "revoked", source: "", created_at: now, updated_at: now };
  }

  // === Credit Cards ===

  async getCreditCards(): Promise<CreditCard[]> {
    await delay(300);
    return [];
  }

  async getCreditCard(id: string): Promise<CreditCard> {
    await delay(300);
    return { id, name: "Card", issuer: "Bank", annual_fee: "0", image_url: null, apply_url: null, credits: [], benefits: [], created_at: "", updated_at: "" };
  }

  async seedAmexPlatinum(): Promise<{ status: string }> {
    await delay(1000);
    return { status: "success" };
  }

  // === Shared Data ===

  async getPointsPrograms(): Promise<PointsProgram[]> {
    await delay(300);
    return DEMO_POINTS_PROGRAMS;
  }

  async getCreditCardData(): Promise<CreditCardData[]> {
    await delay(300);
    return DEMO_CREDIT_CARD_DATA;
  }

  async getLiquidAssets(): Promise<SavingsProduct[]> {
    await delay(300);
    return DEMO_LIQUID_ASSETS;
  }

  async getInvestments(): Promise<InvestmentData> {
    await delay(300);
    return DEMO_INVESTMENT_DATA;
  }

  async getRealAssets(): Promise<RealAssetData> {
    await delay(300);
    return DEMO_REAL_ASSET_DATA;
  }

  async getLiabilities(): Promise<LiabilityData> {
    await delay(300);
    return DEMO_LIABILITY_DATA;
  }

  async getIncome(): Promise<IncomeData> {
    await delay(300);
    return DEMO_INCOME_DATA;
  }

  async getCredit(): Promise<CreditData> {
    await delay(300);
    return DEMO_CREDIT_DATA;
  }

  async getProtection(): Promise<ProtectionData> {
    await delay(300);
    return DEMO_PROTECTION_DATA;
  }

  async getTransparencyPayload(): Promise<TransparencyPayload> {
    await delay(300);
    return DEMO_TRANSPARENCY_PAYLOAD;
  }

  async getToolPresets(): Promise<ToolPresetBundle> {
    await delay(300);
    return DEMO_TOOL_PRESETS;
  }

  // === Banking (Plaid) ===

  async createPlaidLinkToken(_request?: PlaidLinkRequest): Promise<PlaidLinkResponse> {
    await delay(800);
    return { link_token: "demo-link-token", expiration: null };
  }

  async handlePlaidCallback(_request: PlaidCallbackRequest): Promise<Connection> {
    await delay(1500);
    return DEMO_CONNECTIONS[0];
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    await delay(300);
    return [];
  }

  async getBankTransactions(_query: BankTransactionQuery): Promise<PaginatedBankTransactions> {
    await delay(300);
    return { transactions: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
  }

  async getSpendingSummary(_months?: number): Promise<SpendingSummary> {
    await delay(300);
    return {
      total_spending: 0,
      monthly_average: 0,
      categories: [],
      start_date: "",
      end_date: "",
      months_analyzed: 0
    };
  }

  async getSubscriptions(): Promise<SubscriptionSummary> {
    await delay(300);
    return { subscriptions: [], total_monthly_subscription_burn: 0, subscription_count: 0 };
  }

  async updateBankTransactionReimbursement(_id: string, _data: BankTransactionReimbursementUpdate): Promise<BankTransaction> {
    await delay(300);
    return {} as BankTransaction;
  }

  // === Share Reports ===

  async createShareReport(_request: ShareReportCreateRequest): Promise<ShareReportCreateResponse> {
    await delay(500);
    return {
      id: "report-123",
      token: "demo-token",
      tool_id: _request.tool_id,
      mode: _request.mode,
      created_at: new Date().toISOString(),
      expires_at: null,
      max_views: null
    };
  }

  async getShareReport(reportId: string, _token: string): Promise<ShareReportPublicResponse> {
    void reportId;
    await delay(500);
    return {} as ShareReportPublicResponse;
  }

  async listShareReports(params?: { toolId?: string; limit?: number; includePayload?: boolean }): Promise<ShareReportListItem[]> {
    void params;
    await delay(300);
    return [];
  }

  async rotateShareReport(reportId: string, params?: { expiresInDays?: number | null }): Promise<ShareReportCreateResponse> {
    void reportId; void params;
    await delay(300);
    return { id: reportId, token: "new-token", tool_id: "tool", mode: "full", created_at: "", expires_at: null, max_views: null };
  }

  async revokeShareReport(_id: string): Promise<{ status: string }> {
    await delay(300);
    return { status: "success" };
  }

  // === Tax Plan Workspace ===

  async createTaxPlan(_data: TaxPlanCreateRequest): Promise<TaxPlan> {
    await delay(300);
    return { id: "p1", user_id: "u1", name: _data.name, household_name: _data.household_name ?? null, status: "draft", approved_version_id: null, created_at: "", updated_at: "" };
  }

  async listTaxPlans(params?: { limit?: number }): Promise<TaxPlan[]> {
    void params;
    await delay(300);
    return [];
  }

  async getTaxPlan(_id: string): Promise<TaxPlan> {
    await delay(300);
    return { id: _id, user_id: "u1", name: "Plan", household_name: null, status: "draft", approved_version_id: null, created_at: "", updated_at: "" };
  }

  async updateTaxPlan(_id: string, _data: TaxPlanUpdateRequest): Promise<TaxPlan> {
    await delay(300);
    return { id: _id, user_id: "u1", name: _data.name ?? "Plan", household_name: _data.household_name ?? null, status: _data.status ?? "draft", approved_version_id: null, created_at: "", updated_at: "" };
  }

  async createTaxPlanVersion(planId: string, data: TaxPlanVersionCreateRequest): Promise<TaxPlanVersion> {
    await delay(300);
    return { id: "v1", plan_id: planId, created_by_user_id: "u1", label: data.label, inputs: data.inputs, results: data.results ?? null, source: data.source ?? "manual", is_approved: false, approved_at: null, approved_by_user_id: null, created_at: "", updated_at: "" };
  }

  async listTaxPlanVersions(planId: string, params?: { limit?: number }): Promise<TaxPlanVersion[]> {
    void params;
    await delay(300);
    return [];
  }

  async approveTaxPlanVersion(planId: string, versionId: string): Promise<TaxPlanVersion> {
    await delay(300);
    return { id: versionId, plan_id: planId, created_by_user_id: "u1", label: "Approved", inputs: {}, results: null, source: "manual", is_approved: true, approved_at: "", approved_by_user_id: "u1", created_at: "", updated_at: "" };
  }

  async createTaxPlanComment(planId: string, data: TaxPlanCommentCreateRequest): Promise<TaxPlanComment> {
    await delay(300);
    return { id: "c1", plan_id: planId, version_id: data.version_id ?? null, author_user_id: "u1", author_role: "owner", body: data.body, created_at: "", updated_at: "" };
  }

  async listTaxPlanComments(planId: string, params?: { limit?: number }): Promise<TaxPlanComment[]> {
    void params;
    await delay(300);
    return [];
  }

  async addTaxPlanCollaborator(planId: string, data: TaxPlanCollaboratorCreateRequest): Promise<TaxPlanCollaborator> {
    await delay(300);
    return { id: "col1", plan_id: planId, email: data.email, role: data.role, invited_by_user_id: "u1", accepted_at: null, revoked_at: null, created_at: "", updated_at: "" };
  }

  async listTaxPlanCollaborators(planId: string): Promise<TaxPlanCollaborator[]> {
    await delay(300);
    return [];
  }

  async revokeTaxPlanCollaborator(planId: string, collaboratorId: string): Promise<{ status: string }> {
    void planId; void collaboratorId;
    await delay(300);
    return { status: "success" };
  }

  async createTaxPlanEvent(planId: string, data: TaxPlanEventCreateRequest): Promise<TaxPlanEvent> {
    await delay(300);
    return { id: "e1", plan_id: planId, version_id: data.version_id ?? null, actor_user_id: "u1", event_type: data.event_type, event_metadata: data.event_metadata ?? {}, created_at: "", updated_at: "" };
  }

  async listTaxPlanEvents(planId: string, params?: { limit?: number }): Promise<TaxPlanEvent[]> {
    void params;
    await delay(300);
    return [];
  }

  async generateTaxOptimizationReport(planId: string, versionId: string): Promise<any> {
    await delay(600);
    return {
      summary: "Demo Tax Optimization Report",
      current_strategy: "You have $150,000 in wages and $10,000 in short term gains.",
      optimal_strategy: "Consider tax loss harvesting.",
      dollar_amounts_saved: 3500,
      yoy_comparison: "This is your first year.",
      recommendations: [
        {
          title: "Tax Loss Harvesting",
          description: "Offset short term gains.",
          potential_savings: 3500
        }
      ]
    };
  }

  // === Tax Documents ===

  async uploadTaxDocument(_file: File | Blob, _filename: string, _typeHint?: string): Promise<TaxDocumentResponse> {
    await delay(1500);
    return { id: "d1", user_id: "u1", original_filename: _filename, mime_type: "", file_size_bytes: 0, document_type: _typeHint ?? null, tax_year: null, status: "processing", provider_used: null, extracted_data: null, confidence_score: null, validation_errors: null, error_message: null, created_at: "", updated_at: "" };
  }

  async listTaxDocuments(limit?: number): Promise<TaxDocumentListResponse[]> {
    void limit;
    await delay(300);
    return [];
  }

  async getTaxDocument(_id: string): Promise<TaxDocumentResponse> {
    await delay(300);
    return { id: _id, user_id: "u1", original_filename: "", mime_type: "", file_size_bytes: 0, document_type: null, tax_year: null, status: "completed", provider_used: null, extracted_data: null, confidence_score: null, validation_errors: null, error_message: null, created_at: "", updated_at: "" };
  }

  async deleteTaxDocument(_id: string): Promise<void> {
    await delay(300);
  }

  async prefillTaxPlan(_data: PrefillTaxPlanRequest): Promise<PrefillTaxPlanResponse> {
    await delay(1500);
    return { version_id: "v1", plan_id: _data.plan_id, fields_populated: [], warnings: [] };
  }

  // === Action Intents ===

  async getActionIntents(_status?: ActionIntentStatus): Promise<ActionIntent[]> {
    await delay(300);
    return [];
  }

  async getActionIntent(_id: string): Promise<ActionIntent> {
    await delay(300);
    return { id: _id, user_id: "u1", decision_trace_id: null, intent_type: "ach_transfer", status: "draft", title: "Intent", description: null, payload: {}, impact_summary: {}, created_at: "", updated_at: "" };
  }

  async updateActionIntent(_id: string, _data: ActionIntentUpdate): Promise<ActionIntent> {
    await delay(300);
    return { id: _id, user_id: "u1", decision_trace_id: null, intent_type: "ach_transfer", status: _data.status ?? "draft", title: "Intent", description: null, payload: _data.payload ?? {}, impact_summary: _data.impact_summary ?? {}, created_at: "", updated_at: "" };
  }

  async getIntentManifest(_id: string): Promise<Blob> {
    await delay(1000);
    return new Blob([]);
  }

  // === Portability ===

  async exportFinancialPassport(): Promise<FinancialPassport> {
    await delay(1000);
    return { "@context": "", id: "p1", issuer: "", issued_at: "", claims: {}, signature: null };
  }

  // === Equity ===

  async getEquityPortfolio(): Promise<EquityPortfolioSummary> {
    await delay(300);
    const now = new Date();
    const deadline1 = new Date(now);
    deadline1.setDate(deadline1.getDate() + 15); // 15 days left
    
    const deadline2 = new Date(now);
    deadline2.setDate(deadline2.getDate() - 5); // Missed
    
    return {
      total_vested_value: 1250000,
      total_unvested_value: 3500000,
      total_value: 4750000,
      grant_valuations: [
        {
          id: "demo-grant-1",
          symbol: "STRT",
          current_price: 15.50,
          vested_quantity: 50000,
          unvested_quantity: 150000,
          vested_value: 775000,
          unvested_value: 2325000,
          total_value: 3100000,
          next_vest_date: "2026-04-15",
          next_vest_quantity: 5000,
          is_83b_elected: false,
          election_deadline: deadline1.toISOString().split('T')[0],
          is_qsbs_eligible: true,
          qsbs_progress_percent: 45.5,
        },
        {
          id: "demo-grant-2",
          symbol: "NVDA",
          current_price: 850.25,
          vested_quantity: 500,
          unvested_quantity: 1500,
          vested_value: 425125,
          unvested_value: 1275375,
          total_value: 1700500,
          next_vest_date: "2026-05-01",
          next_vest_quantity: 100,
          is_83b_elected: true,
          election_deadline: deadline2.toISOString().split('T')[0],
          is_qsbs_eligible: false,
          qsbs_progress_percent: null,
        }
      ]
    };
  }

  async getEquityProjections(): Promise<EquityProjection[]> {
    await delay(300);
    const projections: EquityProjection[] = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      projections.push({
        date: date.toISOString().split('T')[0],
        total_value: (4750000 + (i * 150000)).toString(),
        liquid_value: (1250000 + (i * 80000)).toString(),
      });
    }
    return projections;
  }

  async getEquityGrants(): Promise<EquityGrant[]> {
    await delay(300);
    return [
      {
        id: "demo-grant-1",
        user_id: "demo-user-001",
        grant_name: "Founder Stock",
        symbol: "STRT",
        grant_type: "founder_stock",
        quantity: 200000,
        strike_price: 0.0001,
        grant_date: "2024-01-01",
        is_83b_elected: false,
        election_date: null,
        is_qsbs_eligible: true,
        qsbs_holding_start: "2024-01-01",
        vesting_schedule: null,
        notes: "Initial founder grant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-grant-2",
        user_id: "demo-user-001",
        grant_name: "Side Hustle Options",
        symbol: "NVDA",
        grant_type: "iso",
        quantity: 2000,
        strike_price: 150.00,
        grant_date: "2023-06-15",
        is_83b_elected: true,
        election_date: "2023-07-01",
        is_qsbs_eligible: false,
        qsbs_holding_start: null,
        vesting_schedule: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  async createEquityGrant(_data: EquityGrantCreate): Promise<EquityGrant> {
    await delay(300);
    return { 
      id: "g1", 
      user_id: "u1", 
      symbol: _data.symbol, 
      grant_name: _data.grant_name, 
      grant_type: _data.grant_type, 
      quantity: _data.quantity, 
      strike_price: _data.strike_price ?? null, 
      grant_date: _data.grant_date, 
      is_83b_elected: _data.is_83b_elected ?? false,
      election_date: _data.election_date ?? null,
      is_qsbs_eligible: _data.is_qsbs_eligible ?? false,
      qsbs_holding_start: _data.qsbs_holding_start ?? null,
      vesting_schedule: _data.vesting_schedule ?? null, 
      notes: _data.notes ?? null, 
      created_at: "", 
      updated_at: "" 
    };
  }

  async updateEquityGrant(_id: string, _data: EquityGrantUpdate): Promise<EquityGrant> {
    await delay(300);
    return { 
      id: _id, 
      user_id: "u1", 
      symbol: _data.symbol ?? "", 
      grant_name: _data.grant_name ?? "", 
      grant_type: _data.grant_type ?? "rsu", 
      quantity: _data.quantity ?? 0, 
      strike_price: _data.strike_price ?? null, 
      grant_date: _data.grant_date ?? "", 
      is_83b_elected: _data.is_83b_elected ?? false,
      election_date: _data.election_date ?? null,
      is_qsbs_eligible: _data.is_qsbs_eligible ?? false,
      qsbs_holding_start: _data.qsbs_holding_start ?? null,
      vesting_schedule: _data.vesting_schedule ?? null, 
      notes: _data.notes ?? null, 
      created_at: "", 
      updated_at: "" 
    };
  }

  async deleteEquityGrant(_id: string): Promise<void> {
    await delay(300);
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
    return {
      wallets: [
        { id: "wallet-1", user_id: "demo-user", address: "0x1234...abcd", chain: "ethereum", label: "Main ETH Wallet", last_balance_usd: 15420.5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "wallet-2", user_id: "demo-user", address: "5Kabc...xyz", chain: "solana", label: "Solana Degen", last_balance_usd: 8500.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ],
      total_value_usd: 28920.5,
      assets: [
        { symbol: "ETH", name: "Ethereum", balance: 4.5, balance_usd: 13500.0, current_price: 3000.0, chain: "ethereum", contract_address: null, logo_url: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
        { symbol: "USDC", name: "USD Coin", balance: 1920.5, balance_usd: 1920.5, current_price: 1.0, chain: "ethereum", contract_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", logo_url: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" },
        { symbol: "SOL", name: "Solana", balance: 56.6, balance_usd: 8500.0, current_price: 150.0, chain: "solana", contract_address: null, logo_url: "https://assets.coingecko.com/coins/images/4128/small/solana.png" }
      ],
      defi_positions: [
        {
          protocol_name: "Aave V3",
          protocol_logo: "https://assets.coingecko.com/markets/images/698/small/aave.png",
          position_type: "lending",
          value_usd: 5000.0,
          assets: [
            { symbol: "USDC", name: "USD Coin", balance: 5000.0, balance_usd: 5000.0, current_price: 1.0, chain: "ethereum", contract_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", logo_url: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" }
          ]
        }
      ]
    };
  }

  // === Physical Assets ===

  async getPhysicalAssetsSummary(): Promise<PhysicalAssetsSummary> {
    await delay(300);
    return getDemoPhysicalAssetsSummary();
  }

  async searchProperties(_request: PropertySearchRequest): Promise<PropertySearchResult[]> {
    await delay(1000);
    return [];
  }

  async searchVehicles(_request: VehicleSearchRequest): Promise<VehicleSearchResult[]> {
    await delay(1000);
    return [];
  }

  async getRealEstateAssets(): Promise<RealEstateAsset[]> {
    await delay(300);
    return getDemoPhysicalAssetsSummary().real_estate;
  }

  async createRealEstateAsset(_data: RealEstateAssetCreate): Promise<RealEstateAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: "re1", user_id: "u1", name: _data.name, address: _data.address, city: _data.city ?? null, state: _data.state ?? null, zip_code: _data.zip_code ?? null, property_type: _data.property_type ?? "primary_residence", valuation_type: _data.valuation_type ?? "manual", market_value: _data.market_value ?? 0, purchase_price: _data.purchase_price ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, zillow_zpid: _data.zillow_zpid ?? null, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async updateRealEstateAsset(_id: string, _data: RealEstateAssetUpdate): Promise<RealEstateAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: _id, user_id: "u1", name: _data.name ?? "RE", address: _data.address ?? "", city: _data.city ?? null, state: _data.state ?? null, zip_code: _data.zip_code ?? null, property_type: _data.property_type ?? "primary_residence", valuation_type: _data.valuation_type ?? "manual", market_value: _data.market_value ?? 0, purchase_price: _data.purchase_price ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, zillow_zpid: _data.zillow_zpid ?? null, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async deleteRealEstateAsset(_id: string): Promise<void> {
    await delay(300);
  }

  async refreshRealEstateValuation(_id: string): Promise<ValuationRefreshResponse> {
    await delay(1500);
    return { status: "unchanged", message: "Demo mode" };
  }

  async getVehicleAssets(): Promise<VehicleAsset[]> {
    await delay(300);
    return getDemoPhysicalAssetsSummary().vehicles;
  }

  async createVehicleAsset(_data: VehicleAssetCreate): Promise<VehicleAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: "v1", user_id: "u1", name: _data.name, make: _data.make, model: _data.model, year: _data.year, vin: _data.vin ?? null, mileage: _data.mileage ?? null, vehicle_type: _data.vehicle_type ?? "car", valuation_type: _data.valuation_type ?? "manual", market_value: _data.market_value ?? 0, purchase_price: _data.purchase_price ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async updateVehicleAsset(_id: string, _data: VehicleAssetUpdate): Promise<VehicleAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: _id, user_id: "u1", name: _data.name ?? "V", make: _data.make ?? "", model: _data.model ?? "", year: _data.year ?? 2020, vin: _data.vin ?? null, mileage: _data.mileage ?? null, vehicle_type: _data.vehicle_type ?? "car", valuation_type: _data.valuation_type ?? "manual", market_value: _data.market_value ?? 0, purchase_price: _data.purchase_price ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async deleteVehicleAsset(_id: string): Promise<void> {
    await delay(300);
  }

  async refreshVehicleValuation(_id: string): Promise<ValuationRefreshResponse> {
    await delay(1500);
    return { status: "unchanged", message: "Demo mode" };
  }

  async getCollectibleAssets(): Promise<CollectibleAsset[]> {
    await delay(300);
    return getDemoPhysicalAssetsSummary().collectibles;
  }

  async createCollectibleAsset(_data: CollectibleAssetCreate): Promise<CollectibleAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: "c1", user_id: "u1", name: _data.name, item_type: _data.item_type ?? "other", valuation_type: _data.valuation_type ?? "manual", market_value: _data.market_value ?? 0, purchase_price: _data.purchase_price ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, metadata_json: _data.metadata_json ?? null, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async updateCollectibleAsset(_id: string, _data: CollectibleAssetUpdate): Promise<CollectibleAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: _id, user_id: "u1", name: _data.name ?? "C", item_type: _data.item_type ?? "other", valuation_type: _data.valuation_type ?? "manual", market_value: _data.market_value ?? 0, purchase_price: _data.purchase_price ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, metadata_json: _data.metadata_json ?? null, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async deleteCollectibleAsset(_id: string): Promise<void> {
    await delay(300);
  }

  async refreshCollectibleValuation(_id: string): Promise<ValuationRefreshResponse> {
    await delay(1500);
    return { status: "unchanged", message: "Demo mode" };
  }

  async getPreciousMetalAssets(): Promise<PreciousMetalAsset[]> {
    await delay(300);
    return getDemoPhysicalAssetsSummary().precious_metals;
  }

  async createPreciousMetalAsset(_data: PreciousMetalAssetCreate): Promise<PreciousMetalAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: "m1", user_id: "u1", name: _data.name, metal_type: _data.metal_type, weight_oz: _data.weight_oz, valuation_type: _data.valuation_type ?? "auto", market_value: _data.market_value ?? 0, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async updatePreciousMetalAsset(_id: string, _data: PreciousMetalAssetUpdate): Promise<PreciousMetalAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: _id, user_id: "u1", name: _data.name ?? "M", metal_type: _data.metal_type ?? "gold", weight_oz: _data.weight_oz ?? 0, valuation_type: _data.valuation_type ?? "auto", market_value: _data.market_value ?? 0, last_valuation_at: null, created_at: now, updated_at: now };
  }

  async deletePreciousMetalAsset(_id: string): Promise<void> {
    await delay(300);
  }

  async refreshPreciousMetalValuation(_id: string): Promise<ValuationRefreshResponse> {
    await delay(1500);
    return { status: "unchanged", message: "Demo mode" };
  }

  async getAlternativeAssets(): Promise<AlternativeAsset[]> {
    await delay(300);
    return getDemoPhysicalAssetsSummary().alternative_assets;
  }

  async createAlternativeAsset(_data: AlternativeAssetCreate): Promise<AlternativeAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: "a1", user_id: "u1", name: _data.name, asset_type: _data.asset_type ?? "other", description: _data.description ?? null, market_value: _data.market_value ?? 0, cost_basis: _data.cost_basis ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, last_valuation_at: null, metadata_json: _data.metadata_json ?? null, created_at: now, updated_at: now };
  }

  async updateAlternativeAsset(_id: string, _data: AlternativeAssetUpdate): Promise<AlternativeAsset> {
    await delay(500);
    const now = new Date().toISOString();
    return { id: _id, user_id: "u1", name: _data.name ?? "A", asset_type: _data.asset_type ?? "other", description: _data.description ?? null, market_value: _data.market_value ?? 0, cost_basis: _data.cost_basis ?? null, purchase_date: _data.purchase_date ?? null, estimated_annual_growth_rate: _data.estimated_annual_growth_rate ?? null, last_valuation_at: null, metadata_json: _data.metadata_json ?? null, created_at: now, updated_at: now };
  }

  async deleteAlternativeAsset(_id: string): Promise<void> {
    await delay(300);
  }

  async getAssetValuationHistory(_type: string, _id: string): Promise<AssetValuation[]> {
    await delay(500);
    return [];
  }

  // === Verification (SVP) ===

  async generateProofOfFunds(threshold: number): Promise<SVPAttestation> {
    void threshold;
    return { "@context": "", type: "", id: "proof-1", issuer: "", issued_at: "", expires_at: "", credential: { claim_type: "", statement: "", verification_status: "", as_of: "", data_freshness_hours: 0 }, signature: null };
  }

  async validateAttestation(attestation: SVPAttestation): Promise<{ 
    valid: boolean; 
    statement: string | null;
    issued_at: string;
    expires_at: string;
  }> {
    void attestation;
    return { valid: true, statement: "Valid", issued_at: "", expires_at: "" };
  }
}
