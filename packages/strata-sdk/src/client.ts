import type {
  AdvisorRecommendation,
  AdvisorSession,
  AdvisorSessionSummary,
  AllAccountsResponse,
  CashAccount,
  CashAccountCreate,
  CashAccountUpdate,
  Connection,
  ConnectionCallbackRequest,
  DebtAccount,
  DebtAccountCreate,
  DebtAccountUpdate,
  FinancialMemory,
  FinancialMemoryUpdate,
  HealthResponse,
  HoldingDetail,
  Institution,
  InvestmentAccount,
  InvestmentAccountCreate,
  InvestmentAccountWithHoldings,
  LinkSessionRequest,
  LinkSessionResponse,
  FinancialContext,
  MemoryEvent,
  PortfolioHistoryPoint,
  SkillDetail,
  SkillSummary,
  PortfolioHistoryRange,
  PortfolioSummary,
  Transaction,
  CreditCard,
  ConsentCreateRequest,
  ConsentResponse,
  DecisionTrace,
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
} from './types';

export interface StrataClientInterface {
  setClerkUserId(userId: string | null): void;
  setAuthToken(token: string | null): void;
  healthCheck(): Promise<HealthResponse>;
  createLinkSession(request?: LinkSessionRequest): Promise<LinkSessionResponse>;
  handleConnectionCallback(request: ConnectionCallbackRequest): Promise<Connection>;
  getConnections(): Promise<Connection[]>;
  deleteConnection(connectionId: string): Promise<void>;
  syncConnection(connectionId: string): Promise<Connection>;
  syncAllConnections(): Promise<Connection[]>;
  getAccounts(): Promise<AllAccountsResponse>;
  getInvestmentAccounts(): Promise<InvestmentAccount[]>;
  getInvestmentAccount(accountId: string): Promise<InvestmentAccountWithHoldings>;
  searchInstitutions(query?: string, limit?: number): Promise<Institution[]>;
  getPopularInstitutions(limit?: number): Promise<Institution[]>;
  getPortfolioSummary(): Promise<PortfolioSummary>;
  getHoldings(): Promise<HoldingDetail[]>;
  getTransactions(params?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]>;
  createInvestmentAccount(data: InvestmentAccountCreate): Promise<InvestmentAccount>;
  createCashAccount(data: CashAccountCreate): Promise<CashAccount>;
  updateCashAccount(id: string, data: CashAccountUpdate): Promise<CashAccount>;
  deleteCashAccount(id: string): Promise<void>;
  createDebtAccount(data: DebtAccountCreate): Promise<DebtAccount>;
  updateDebtAccount(id: string, data: DebtAccountUpdate): Promise<DebtAccount>;
  deleteDebtAccount(id: string): Promise<void>;
  getPortfolioHistory(range: PortfolioHistoryRange): Promise<PortfolioHistoryPoint[]>;
  // Financial Memory
  getFinancialMemory(): Promise<FinancialMemory>;
  updateFinancialMemory(data: FinancialMemoryUpdate): Promise<FinancialMemory>;
  getMemoryEvents(): Promise<MemoryEvent[]>;
  deriveMemory(): Promise<FinancialMemory>;
  getFinancialContext(format?: 'json' | 'markdown'): Promise<FinancialContext | string>;
  // Skills
  getSkills(): Promise<SkillSummary[]>;
  getAvailableSkills(): Promise<SkillSummary[]>;
  getSkill(name: string): Promise<SkillDetail>;
  // Advisor
  createAdvisorSession(skillName?: string): Promise<AdvisorSession>;
  getAdvisorSessions(): Promise<AdvisorSessionSummary[]>;
  getAdvisorSession(sessionId: string): Promise<AdvisorSession>;
  sendAdvisorMessage(sessionId: string, content: string): Promise<ReadableStream<Uint8Array>>;
  getRecommendations(): Promise<AdvisorRecommendation[]>;
  getDecisionTraces(params?: {
    sessionId?: string;
    recommendationId?: string;
  }): Promise<DecisionTrace[]>;
  // Consent
  listConsents(): Promise<ConsentResponse[]>;
  createConsent(data: ConsentCreateRequest): Promise<ConsentResponse>;
  revokeConsent(consentId: string): Promise<ConsentResponse>;
  // Credit Cards
  getCreditCards(): Promise<CreditCard[]>;
  getCreditCard(id: string): Promise<CreditCard>;
  seedAmexPlatinum(): Promise<CreditCard>;
  // Shared data
  getPointsPrograms(): Promise<PointsProgram[]>;
  getCreditCardData(): Promise<CreditCardData[]>;
  getLiquidAssets(): Promise<SavingsProduct[]>;
  getInvestments(): Promise<InvestmentData>;
  getRealAssets(): Promise<RealAssetData>;
  getLiabilities(): Promise<LiabilityData>;
  getIncome(): Promise<IncomeData>;
  getCredit(): Promise<CreditData>;
  getProtection(): Promise<ProtectionData>;
  getToolPresets(): Promise<ToolPresetBundle>;
}

export interface StrataClientOptions {
  baseUrl: string;
  clerkUserId?: string;
  authToken?: string;
}

export class StrataClient implements StrataClientInterface {
  private baseUrl: string;
  private clerkUserId: string | null;
  private authToken: string | null;

  constructor(options: StrataClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.clerkUserId = options.clerkUserId ?? null;
    this.authToken = options.authToken ?? null;
  }

  /**
   * Set the Clerk user ID for authenticated requests.
   */
  setClerkUserId(userId: string | null): void {
    this.clerkUserId = userId ?? null;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.clerkUserId) {
      headers['X-Clerk-User-Id'] = this.clerkUserId;
    }
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || `Request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/v1/health');
  }

  // === Connections ===

  /**
   * Create a link session to connect a new investment account.
   * Returns a URL to redirect the user to for authentication.
   */
  async createLinkSession(
    request?: LinkSessionRequest
  ): Promise<LinkSessionResponse> {
    return this.request<LinkSessionResponse>('/api/v1/connections/link', {
      method: 'POST',
      body: JSON.stringify(request ?? {}),
    });
  }

  /**
   * Handle the OAuth callback from the brokerage.
   */
  async handleConnectionCallback(
    request: ConnectionCallbackRequest
  ): Promise<Connection> {
    return this.request<Connection>('/api/v1/connections/callback', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all connections for the current user.
   */
  async getConnections(): Promise<Connection[]> {
    return this.request<Connection[]>('/api/v1/connections');
  }

  /**
   * Delete a connection and all associated accounts/holdings.
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await this.request<{ status: string }>(
      `/api/v1/connections/${connectionId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Manually trigger a sync for a connection.
   */
  async syncConnection(connectionId: string): Promise<Connection> {
    return this.request<Connection>(
      `/api/v1/connections/${connectionId}/sync`,
      { method: 'POST' }
    );
  }

  /**
   * Sync all connections for the current user.
   */
  async syncAllConnections(): Promise<Connection[]> {
    return this.request<Connection[]>('/api/v1/connections/sync-all', {
      method: 'POST',
    });
  }

  // === Accounts ===

  /**
   * Get all accounts (cash, debt, investment) for the current user.
   */
  async getAccounts(): Promise<AllAccountsResponse> {
    return this.request<AllAccountsResponse>('/api/v1/accounts');
  }

  /**
   * Get all investment accounts for the current user.
   */
  async getInvestmentAccounts(): Promise<InvestmentAccount[]> {
    return this.request<InvestmentAccount[]>('/api/v1/accounts/investment');
  }

  /**
   * Get a specific investment account with its holdings.
   */
  async getInvestmentAccount(
    accountId: string
  ): Promise<InvestmentAccountWithHoldings> {
    return this.request<InvestmentAccountWithHoldings>(
      `/api/v1/accounts/investment/${accountId}`
    );
  }

  // === Institutions ===

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    if (!params) return path;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  /**
   * Search for supported institutions.
   */
  async searchInstitutions(
    query?: string,
    limit?: number
  ): Promise<Institution[]> {
    return this.request<Institution[]>(
      this.buildUrl('/api/v1/institutions', { q: query, limit })
    );
  }

  /**
   * Get popular institutions for quick selection.
   */
  async getPopularInstitutions(limit?: number): Promise<Institution[]> {
    return this.request<Institution[]>(
      this.buildUrl('/api/v1/institutions/popular', { limit })
    );
  }

  // === Portfolio ===

  /**
   * Get a summary of the user's entire portfolio.
   */
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    return this.request<PortfolioSummary>('/api/v1/portfolio/summary');
  }

  /**
   * Get all holdings across all investment accounts.
   */
  async getHoldings(): Promise<HoldingDetail[]> {
    return this.request<HoldingDetail[]>('/api/v1/portfolio/holdings');
  }

  /**
   * Get transactions for the current user.
   */
  async getTransactions(params?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    return this.request<Transaction[]>(
      this.buildUrl('/api/v1/transactions', {
        account_id: params?.accountId,
        start_date: params?.startDate,
        end_date: params?.endDate,
      })
    );
  }

  // === Investment Account CRUD ===

  async createInvestmentAccount(data: InvestmentAccountCreate): Promise<InvestmentAccount> {
    return this.request<InvestmentAccount>('/api/v1/accounts/investment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === Cash Account CRUD ===

  async createCashAccount(data: CashAccountCreate): Promise<CashAccount> {
    return this.request<CashAccount>('/api/v1/accounts/cash', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCashAccount(id: string, data: CashAccountUpdate): Promise<CashAccount> {
    return this.request<CashAccount>(`/api/v1/accounts/cash/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCashAccount(id: string): Promise<void> {
    await this.request<{ status: string }>(`/api/v1/accounts/cash/${id}`, {
      method: 'DELETE',
    });
  }

  // === Debt Account CRUD ===

  async createDebtAccount(data: DebtAccountCreate): Promise<DebtAccount> {
    return this.request<DebtAccount>('/api/v1/accounts/debt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDebtAccount(id: string, data: DebtAccountUpdate): Promise<DebtAccount> {
    return this.request<DebtAccount>(`/api/v1/accounts/debt/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDebtAccount(id: string): Promise<void> {
    await this.request<{ status: string }>(`/api/v1/accounts/debt/${id}`, {
      method: 'DELETE',
    });
  }

  // === Portfolio History ===

  async getPortfolioHistory(range: PortfolioHistoryRange): Promise<PortfolioHistoryPoint[]> {
    return this.request<PortfolioHistoryPoint[]>(
      this.buildUrl('/api/v1/portfolio/history', { range })
    );
  }

  // === Financial Memory ===

  async getFinancialMemory(): Promise<FinancialMemory> {
    return this.request<FinancialMemory>('/api/v1/memory');
  }

  async updateFinancialMemory(data: FinancialMemoryUpdate): Promise<FinancialMemory> {
    return this.request<FinancialMemory>('/api/v1/memory', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getMemoryEvents(): Promise<MemoryEvent[]> {
    return this.request<MemoryEvent[]>('/api/v1/memory/events');
  }

  async deriveMemory(): Promise<FinancialMemory> {
    return this.request<FinancialMemory>('/api/v1/memory/derive', {
      method: 'POST',
    });
  }

  async getFinancialContext(format: 'json' | 'markdown' = 'json'): Promise<FinancialContext | string> {
    if (format === 'markdown') {
      const response = await fetch(
        `${this.baseUrl}/api/v1/memory/context?format=markdown`,
        {
          headers: {
            ...(this.clerkUserId ? { 'X-Clerk-User-Id': this.clerkUserId } : {}),
          },
        }
      );
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return response.text();
    }
    return this.request<FinancialContext>('/api/v1/memory/context');
  }

  // === Skills ===

  async getSkills(): Promise<SkillSummary[]> {
    return this.request<SkillSummary[]>('/api/v1/skills');
  }

  async getAvailableSkills(): Promise<SkillSummary[]> {
    return this.request<SkillSummary[]>('/api/v1/skills/available');
  }

  async getSkill(name: string): Promise<SkillDetail> {
    return this.request<SkillDetail>(`/api/v1/skills/${name}`);
  }

  // === Advisor ===

  async createAdvisorSession(skillName?: string): Promise<AdvisorSession> {
    return this.request<AdvisorSession>('/api/v1/advisor/sessions', {
      method: 'POST',
      body: JSON.stringify({ skill_name: skillName ?? null }),
    });
  }

  async getAdvisorSessions(): Promise<AdvisorSessionSummary[]> {
    return this.request<AdvisorSessionSummary[]>('/api/v1/advisor/sessions');
  }

  async getAdvisorSession(sessionId: string): Promise<AdvisorSession> {
    return this.request<AdvisorSession>(`/api/v1/advisor/sessions/${sessionId}`);
  }

  async sendAdvisorMessage(sessionId: string, content: string): Promise<ReadableStream<Uint8Array>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.clerkUserId) {
      headers['X-Clerk-User-Id'] = this.clerkUserId;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/advisor/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return response.body;
  }

  async getRecommendations(): Promise<AdvisorRecommendation[]> {
    return this.request<AdvisorRecommendation[]>('/api/v1/advisor/recommendations');
  }

  async getDecisionTraces(params?: {
    sessionId?: string;
    recommendationId?: string;
  }): Promise<DecisionTrace[]> {
    const query = new URLSearchParams();
    if (params?.sessionId) query.set('session_id', params.sessionId);
    if (params?.recommendationId) query.set('recommendation_id', params.recommendationId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.request<DecisionTrace[]>(`/api/v1/agent/decision-traces${suffix}`);
  }

  // === Consent ===

  async listConsents(): Promise<ConsentResponse[]> {
    return this.request<ConsentResponse[]>('/api/v1/consents');
  }

  async createConsent(data: ConsentCreateRequest): Promise<ConsentResponse> {
    return this.request<ConsentResponse>('/api/v1/consents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeConsent(consentId: string): Promise<ConsentResponse> {
    return this.request<ConsentResponse>(`/api/v1/consents/${consentId}/revoke`, {
      method: 'POST',
    });
  }

  // === Credit Cards ===

  async getCreditCards(): Promise<CreditCard[]> {
    return this.request<CreditCard[]>('/api/v1/credit-cards');
  }

  async getCreditCard(id: string): Promise<CreditCard> {
    return this.request<CreditCard>(`/api/v1/credit-cards/${id}`);
  }

  async seedAmexPlatinum(): Promise<CreditCard> {
    return this.request<CreditCard>('/api/v1/credit-cards/seed', {
      method: 'POST',
    });
  }

  // === Shared Data ===

  async getPointsPrograms(): Promise<PointsProgram[]> {
    return this.request<PointsProgram[]>('/api/v1/data/points-programs');
  }

  async getCreditCardData(): Promise<CreditCardData[]> {
    return this.request<CreditCardData[]>('/api/v1/data/credit-cards');
  }

  async getLiquidAssets(): Promise<SavingsProduct[]> {
    return this.request<SavingsProduct[]>('/api/v1/data/liquid-assets');
  }

  async getInvestments(): Promise<InvestmentData> {
    return this.request<InvestmentData>('/api/v1/data/investments');
  }

  async getRealAssets(): Promise<RealAssetData> {
    return this.request<RealAssetData>('/api/v1/data/real-assets');
  }

  async getLiabilities(): Promise<LiabilityData> {
    return this.request<LiabilityData>('/api/v1/data/liabilities');
  }

  async getIncome(): Promise<IncomeData> {
    return this.request<IncomeData>('/api/v1/data/income');
  }

  async getCredit(): Promise<CreditData> {
    return this.request<CreditData>('/api/v1/data/credit');
  }

  async getProtection(): Promise<ProtectionData> {
    return this.request<ProtectionData>('/api/v1/data/protection');
  }

  async getToolPresets(): Promise<ToolPresetBundle> {
    return this.request<ToolPresetBundle>('/api/v1/data/tool-presets');
  }
}
