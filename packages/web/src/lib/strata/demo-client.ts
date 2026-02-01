import type {
  AllAccountsResponse,
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
  FinancialContext,
  FinancialMemory,
  SkillDetail,
  SkillSummary,
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
} from "./demo-data";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DemoStrataClient implements StrataClientInterface {
  setClerkUserId(): void {
    // no-op in demo mode
  }

  async healthCheck(): Promise<HealthResponse> {
    await delay(100);
    return { status: "ok", database: "ok" };
  }

  async createLinkSession(
    _request?: LinkSessionRequest
  ): Promise<LinkSessionResponse> {
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
    await delay(1500);
    return DEMO_CONNECTIONS[0];
  }

  async getConnections(): Promise<Connection[]> {
    await delay(300);
    return DEMO_CONNECTIONS;
  }

  async deleteConnection(_connectionId: string): Promise<void> {
    await delay(300);
    // no-op in demo mode
  }

  async syncConnection(_connectionId: string): Promise<Connection> {
    await delay(300);
    return DEMO_CONNECTIONS[0];
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
    emergency_fund_target_months: 6,
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
    await delay(300);
    return [];
  }
}
