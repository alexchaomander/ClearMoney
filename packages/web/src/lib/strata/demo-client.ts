import type {
  AllAccountsResponse,
  BankAccount,
  BankTransactionQuery,
  CashAccount,
  CashAccountCreate,
  CashAccountUpdate,
  Connection,
  ConnectionCallbackRequest,
  DebtAccount,
  DebtAccountCreate,
  DebtAccountUpdate,
  AdvisorRecommendation,
  AdvisorSession,
  AdvisorSessionSummary,
  ConsentCreateRequest,
  ConsentResponse,
  DecisionTrace,
  FinancialContext,
  FinancialMemory,
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
  SkillDetail,
  SkillSummary,
  SpendingSummary,
  FinancialMemoryUpdate,
  HealthResponse,
  HoldingDetail,
  Institution,
  InvestmentAccount,
  InvestmentAccountCreate,
  InvestmentAccountWithHoldings,
  LinkSessionRequest,
  LinkSessionResponse,
  MemoryEvent,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  PortfolioSummary,
  StrataClientInterface,
  Transaction,
  CreditCard,
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
} from "./demo-data";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DemoStrataClient implements StrataClientInterface {
  setClerkUserId(_userId: string | null): void {
    // no-op in demo mode
  }

  setAuthToken(): void {
    // no-op in demo mode
  }

  async healthCheck(): Promise<HealthResponse> {
    await delay(100);
    return { status: "ok", database: "ok" };
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
      created_at: now,
      updated_at: now,
    };
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
    void _id;
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
    void _id;
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
    notes: {
      founderCoveragePlanner: {
        version: 1,
        savedAt: "2026-02-01T00:00:00.000Z",
        inputs: {
          annualNetIncome: 240000,
          ownersCount: 1,
          employeesCount: 0,
          legalEntityType: "llc",
          fundingPlan: "bootstrapped",
          ownerRole: "operator",
          marketSalary: 160000,
          plannedSalary: 120000,
          payrollAdminCosts: 3200,
          statePayrollTaxRate: 2.5,
          ssWageBase: 174000,
          filingStatus: "single",
          priorYearTax: 52000,
          projectedCurrentTax: 61000,
          federalWithholding: 12000,
          estimatedPayments: 9000,
          currentQuarter: 1,
          entityStartDate: "2025-04-01",
          taxYearStartDate: "2026-01-01",
          taxElection: "s_corp",
          payrollCadence: "biweekly",
          businessAccounts: 1,
          personalAccounts: 2,
          mixedTransactionsPerMonth: 6,
          reimbursementPolicy: "manual",
          hasEquityGrants: false,
          equityGrantType: "options",
          daysSinceGrant: 0,
          vestingYears: 4,
          cliffMonths: 12,
          strikePrice: 1.25,
          fairMarketValue: 5,
          sharesGranted: 100000,
          exerciseWindowMonths: 90,
          isQualifiedBusiness: true,
          assetsAtIssuance: 12000000,
          expectedHoldingYears: 5,
        },
      },
    },
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

  // === Skills ===

  private static readonly DEMO_SKILLS: SkillSummary[] = [
    { name: "retirement_planning", display_name: "Retirement Planning", description: "Analyze retirement readiness and create savings strategies", required_context: ["profile.age", "profile.retirement_age", "profile.current_retirement_savings"], output_format: "recommendation" },
    { name: "tax_optimization", display_name: "Tax Optimization", description: "Tax-loss harvesting strategies and account type optimization", required_context: ["profile.filing_status", "profile.annual_income"], output_format: "recommendation" },
    { name: "debt_payoff", display_name: "Debt Payoff Strategy", description: "Debt snowball and avalanche strategies with payoff timelines", required_context: ["accounts.debt"], output_format: "recommendation" },
    { name: "emergency_fund", display_name: "Emergency Fund Check", description: "Analyze emergency fund adequacy based on personal risk factors", required_context: ["profile.monthly_income"], output_format: "recommendation" },
    { name: "investment_review", display_name: "Investment Portfolio Review", description: "Comprehensive portfolio allocation analysis", required_context: ["accounts.investment", "holdings"], output_format: "recommendation" },
    { name: "savings_goals", display_name: "Savings Goal Planning", description: "Goal-based savings planning with timelines", required_context: ["profile.monthly_income"], output_format: "recommendation" },
    { name: "home_buying", display_name: "Home Buying Analysis", description: "Rent vs buy analysis and mortgage affordability", required_context: ["profile.monthly_income"], output_format: "recommendation" },
    { name: "financial_checkup", display_name: "Financial Health Checkup", description: "Comprehensive financial health assessment", required_context: [], output_format: "recommendation" },
  ];

  async getSkills(): Promise<SkillSummary[]> {
    await delay(300);
    return [...DemoStrataClient.DEMO_SKILLS];
  }

  async getAvailableSkills(): Promise<SkillSummary[]> {
    await delay(300);
    return [...DemoStrataClient.DEMO_SKILLS];
  }

  async getSkill(name: string): Promise<SkillDetail> {
    await delay(300);
    const summary = DemoStrataClient.DEMO_SKILLS.find(s => s.name === name);
    if (!summary) throw new Error(`Skill '${name}' not found`);
    return {
      ...summary,
      optional_context: [],
      tools: [],
      content: `## System Prompt\n\nYou are a ${summary.display_name.toLowerCase()} specialist.`,
    };
  }

  // === Advisor ===

  private demoSessions: AdvisorSession[] = [];

  async createAdvisorSession(skillName?: string): Promise<AdvisorSession> {
    await delay(300);
    const session: AdvisorSession = {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      skill_name: skillName ?? null,
      status: "active",
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.demoSessions.unshift(session);
    return { ...session };
  }

  async getAdvisorSessions(): Promise<AdvisorSessionSummary[]> {
    await delay(300);
    return this.demoSessions.map(s => ({
      id: s.id,
      skill_name: s.skill_name,
      status: s.status,
      message_count: s.messages.length,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  }

  async getAdvisorSession(sessionId: string): Promise<AdvisorSession> {
    await delay(300);
    const session = this.demoSessions.find(s => s.id === sessionId);
    if (!session) throw new Error("Session not found");
    return { ...session };
  }

  async sendAdvisorMessage(sessionId: string, content: string): Promise<ReadableStream<Uint8Array>> {
    const session = this.demoSessions.find(s => s.id === sessionId);
    if (session) {
      session.messages.push({ role: "user", content });
    }

    const skillName = session?.skill_name;
    const responseText = skillName
      ? `Based on your financial profile, here's my ${skillName.replace(/_/g, " ")} analysis:\n\nYour current savings rate and investment trajectory look solid. With your annual income of $125,000 and current retirement savings of $85,000, you're on a good path.\n\n**Key Recommendations:**\n1. Consider increasing your monthly retirement contribution by $200\n2. Review your asset allocation to ensure it matches your moderate risk tolerance\n3. Take advantage of your employer's 4% match — you may have room to optimize\n\nWould you like me to dive deeper into any of these areas?`
      : `I'd be happy to help with your finances! I can see your profile shows an annual income of $125,000 with $85,000 in retirement savings. What would you like to explore today?\n\nI can help with:\n- Retirement planning\n- Tax optimization\n- Investment review\n- Emergency fund check\n- And more`;

    if (session) {
      session.messages.push({ role: "assistant", content: responseText });
    }

    // Simulate streaming with a ReadableStream
    const encoder = new TextEncoder();
    const chunks = responseText.match(/.{1,20}/g) ?? [responseText];

    return new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          await new Promise(r => setTimeout(r, 30));
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
  }

  async getRecommendations(): Promise<AdvisorRecommendation[]> {
    return [
      {
        id: "rec-1",
        user_id: "user-1",
        session_id: "session-1",
        skill_name: "tax_optimization",
        title: "Maximize Roth IRA",
        summary: "You should contribute $6,500 to your Roth IRA.",
        details: {},
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async getDecisionTraces(): Promise<DecisionTrace[]> {
    await delay(200);
    return [];
  }

  async listConsents(): Promise<ConsentResponse[]> {
    await delay(200);
    const scopes = [
      "connections:read",
      "connections:write",
      "accounts:read",
      "accounts:write",
      "portfolio:read",
      "holdings:read",
      "transactions:read",
      "memory:read",
      "memory:write",
      "decision_traces:read",
      "agent:read",
    ];
    return [
      {
        id: "demo-consent-001",
        user_id: "demo-user-001",
        scopes,
        purpose: "Demo consent",
        status: "active",
        source: "demo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async createConsent(data: ConsentCreateRequest): Promise<ConsentResponse> {
    await delay(200);
    return {
      id: "demo-consent-001",
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
    await delay(200);
    return {
      id: consentId,
      user_id: "demo-user-001",
      scopes: [],
      purpose: "Demo consent",
      status: "revoked",
      source: "demo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // === Credit Cards ===

  async getCreditCards(): Promise<CreditCard[]> {
    return [];
  }

  async getCreditCard(id: string): Promise<CreditCard> {
    void id;
    throw new Error("Card not found");
  }

  async seedAmexPlatinum(): Promise<CreditCard> {
    throw new Error("Not implemented in demo mode");
  }

  async getPointsPrograms(): Promise<PointsProgram[]> {
    await delay(200);
    return DEMO_POINTS_PROGRAMS;
  }

  async getCreditCardData(): Promise<CreditCardData[]> {
    await delay(200);
    return DEMO_CREDIT_CARD_DATA;
  }

  async getLiquidAssets(): Promise<SavingsProduct[]> {
    await delay(200);
    return DEMO_LIQUID_ASSETS;
  }

  async getInvestments(): Promise<InvestmentData> {
    await delay(200);
    return DEMO_INVESTMENT_DATA;
  }

  async getRealAssets(): Promise<RealAssetData> {
    await delay(200);
    return DEMO_REAL_ASSET_DATA;
  }

  async getLiabilities(): Promise<LiabilityData> {
    await delay(200);
    return DEMO_LIABILITY_DATA;
  }

  async getIncome(): Promise<IncomeData> {
    await delay(200);
    return DEMO_INCOME_DATA;
  }

  async getCredit(): Promise<CreditData> {
    await delay(200);
    return DEMO_CREDIT_DATA;
  }

  async getProtection(): Promise<ProtectionData> {
    await delay(200);
    return DEMO_PROTECTION_DATA;
  }

  async getToolPresets(): Promise<ToolPresetBundle> {
    await delay(200);
    return DEMO_TOOL_PRESETS;
  }

  // === Banking (Plaid) ===

  async createPlaidLinkToken(_request?: PlaidLinkRequest): Promise<PlaidLinkResponse> {
    void _request;
    await delay(500);
    return {
      link_token: "demo-link-token-" + Date.now(),
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async handlePlaidCallback(request: PlaidCallbackRequest): Promise<Connection> {
    await delay(1500);
    return {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      institution_id: request.institution_id ?? null,
      provider: "plaid",
      provider_user_id: "demo-plaid-user",
      status: "active",
      last_synced_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    await delay(300);
    return [
      {
        id: "demo-bank-001",
        user_id: "demo-user-001",
        connection_id: "demo-conn-plaid-001",
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
        id: "demo-bank-002",
        user_id: "demo-user-001",
        connection_id: "demo-conn-plaid-001",
        name: "Chase Savings",
        account_type: "savings",
        balance: 25000,
        available_balance: 25000,
        institution_name: "Chase",
        mask: "5678",
        is_manual: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-bank-003",
        user_id: "demo-user-001",
        connection_id: "demo-conn-plaid-001",
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
  }

  async getBankTransactions(_params?: BankTransactionQuery): Promise<PaginatedBankTransactions> {
    void _params;
    await delay(300);
    return {
      transactions: [
        {
          id: "demo-tx-001",
          cash_account_id: "demo-bank-001",
          provider_transaction_id: "plaid-tx-001",
          amount: -45.67,
          transaction_date: new Date().toISOString().split("T")[0],
          posted_date: new Date().toISOString().split("T")[0],
          name: "UBER EATS",
          primary_category: "FOOD_AND_DRINK",
          detailed_category: "FOOD_AND_DRINK_RESTAURANTS",
          merchant_name: "Uber Eats",
          payment_channel: "online",
          pending: false,
          iso_currency_code: "USD",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-tx-002",
          cash_account_id: "demo-bank-001",
          provider_transaction_id: "plaid-tx-002",
          amount: -125.00,
          transaction_date: new Date().toISOString().split("T")[0],
          posted_date: new Date().toISOString().split("T")[0],
          name: "TRADER JOE'S",
          primary_category: "FOOD_AND_DRINK",
          detailed_category: "FOOD_AND_DRINK_GROCERIES",
          merchant_name: "Trader Joe's",
          payment_channel: "in_store",
          pending: false,
          iso_currency_code: "USD",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-tx-003",
          cash_account_id: "demo-bank-003",
          provider_transaction_id: "plaid-tx-003",
          amount: -299.0,
          transaction_date: new Date().toISOString().split("T")[0],
          posted_date: new Date().toISOString().split("T")[0],
          name: "AMAZON WEB SERVICES",
          primary_category: "GENERAL_SERVICES",
          detailed_category: "GENERAL_SERVICES_CLOUD_SERVICES",
          merchant_name: "Amazon Web Services",
          payment_channel: "online",
          pending: false,
          iso_currency_code: "USD",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-tx-004",
          cash_account_id: "demo-bank-003",
          provider_transaction_id: "plaid-tx-004",
          amount: -89.0,
          transaction_date: new Date().toISOString().split("T")[0],
          posted_date: new Date().toISOString().split("T")[0],
          name: "DOORDASH",
          primary_category: "FOOD_AND_DRINK",
          detailed_category: "FOOD_AND_DRINK_RESTAURANTS",
          merchant_name: "DoorDash",
          payment_channel: "online",
          pending: false,
          iso_currency_code: "USD",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-tx-005",
          cash_account_id: "demo-bank-003",
          provider_transaction_id: "plaid-tx-005",
          amount: -312.45,
          transaction_date: new Date().toISOString().split("T")[0],
          posted_date: new Date().toISOString().split("T")[0],
          name: "DELTA AIR LINES",
          primary_category: "TRAVEL",
          detailed_category: "TRAVEL_AIRLINES_AND_AVIATION_SERVICES",
          merchant_name: "Delta",
          payment_channel: "online",
          pending: false,
          iso_currency_code: "USD",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-tx-006",
          cash_account_id: "demo-bank-003",
          provider_transaction_id: "plaid-tx-006",
          amount: -63.21,
          transaction_date: new Date().toISOString().split("T")[0],
          posted_date: new Date().toISOString().split("T")[0],
          name: "TARGET",
          primary_category: "SHOPPING",
          detailed_category: "GENERAL_MERCHANDISE_DISCOUNT_STORES",
          merchant_name: "Target",
          payment_channel: "in_store",
          pending: false,
          iso_currency_code: "USD",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      total: 6,
      page: 1,
      page_size: 50,
      total_pages: 1,
    };
  }

  async getSpendingSummary(_months?: number): Promise<SpendingSummary> {
    void _months;
    await delay(300);
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    return {
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
      start_date: threeMonthsAgo.toISOString().split("T")[0],
      end_date: today.toISOString().split("T")[0],
      months_analyzed: 3,
    };
  }
}
