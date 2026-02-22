import type {
  AdvisorRecommendation,
  AdvisorSession,
  AdvisorSessionSummary,
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
  FinancialMemory,
  FinancialMemoryUpdate,
  DataHealthResponse,
  HealthResponse,
  HoldingDetail,
  Institution,
  InvestmentAccount,
  InvestmentAccountCreate,
  InvestmentAccountUpdate,
  InvestmentAccountWithHoldings,
  LinkSessionRequest,
  LinkSessionResponse,
  FinancialContext,
  MemoryEvent,
  PaginatedBankTransactions,
  PlaidCallbackRequest,
  PlaidLinkRequest,
  PlaidLinkResponse,
  PortfolioHistoryPoint,
  RunwayMetrics,
  Security,
  SkillDetail,
  SkillSummary,
  PortfolioHistoryRange,
  PortfolioSummary,
  SpendingSummary,
  SubscriptionSummary,
  TaxShieldMetrics,
  Transaction,
  VulnerabilityReport,
  CreditCard,
  ConsentCreateRequest,
  ConsentResponse,
  DecisionTrace,
  ExecuteRecommendationRequest,
  ExecuteRecommendationResponse,
  PointsProgram,
  TransparencyPayload,
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
  ShareReportPublicResponse,
  ShareReportListItem,
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
  NotificationResponse,
  ActionPolicyRequest,
  ActionPolicyResponse,
  ActionIntent,
  ActionIntentStatus,
  ActionIntentUpdate,
  FinancialPassport,
  SVPAttestation,
  TaxDocumentResponse,
  TaxDocumentListResponse,
  PrefillTaxPlanRequest,
  PrefillTaxPlanResponse,
} from './types';

export interface StrataClientInterface {
  setClerkUserId(userId: string | null): void;
  setAuthToken(token: string | null): void;
  healthCheck(): Promise<HealthResponse>;
  getDataHealth(): Promise<DataHealthResponse>;
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
  getVulnerabilityReport(): Promise<VulnerabilityReport>;
  getRunwayMetrics(): Promise<RunwayMetrics>;
  getTaxShieldMetrics(): Promise<TaxShieldMetrics>;
  getHoldings(): Promise<HoldingDetail[]>;
  getTransactions(params?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]>;
  createInvestmentAccount(data: InvestmentAccountCreate): Promise<InvestmentAccount>;
  updateInvestmentAccount(id: string, data: InvestmentAccountUpdate): Promise<InvestmentAccount>;
  deleteInvestmentAccount(id: string): Promise<void>;
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
  // Notifications
  listNotifications(): Promise<NotificationResponse[]>;
  updateNotification(id: string, data: { is_read: boolean }): Promise<NotificationResponse>;
  markAllNotificationsRead(): Promise<{ status: string }>;
  // Action Policy
  getActionPolicy(): Promise<ActionPolicyResponse>;
  upsertActionPolicy(data: ActionPolicyRequest): Promise<ActionPolicyResponse>;
  // Skills
  getSkills(): Promise<SkillSummary[]>;
  getAvailableSkills(): Promise<SkillSummary[]>;
  getSkill(name: string): Promise<SkillDetail>;
  // Advisor
  createAdvisorSession(skillName?: string, vanishMode?: boolean): Promise<AdvisorSession>;
  getAdvisorSessions(): Promise<AdvisorSessionSummary[]>;
  getAdvisorSession(sessionId: string): Promise<AdvisorSession>;
  sendAdvisorMessage(sessionId: string, content: string): Promise<ReadableStream<Uint8Array>>;
  getRecommendations(): Promise<AdvisorRecommendation[]>;
  executeRecommendation(
    recommendationId: string,
    request: ExecuteRecommendationRequest
  ): Promise<ExecuteRecommendationResponse>;
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
  getTransparencyPayload(): Promise<TransparencyPayload>;
  // Banking (Plaid)
  createPlaidLinkToken(request?: PlaidLinkRequest): Promise<PlaidLinkResponse>;
  handlePlaidCallback(request: PlaidCallbackRequest): Promise<Connection>;
  getBankAccounts(): Promise<BankAccount[]>;
  getBankTransactions(params?: BankTransactionQuery): Promise<PaginatedBankTransactions>;
  getSpendingSummary(months?: number): Promise<SpendingSummary>;
  getSubscriptions(): Promise<SubscriptionSummary>;
  updateBankTransactionReimbursement(transactionId: string, data: BankTransactionReimbursementUpdate): Promise<BankTransaction>;
  // Calculators
  runRetirementMonteCarlo(params: {
    current_savings: number;
    monthly_contribution: number;
    years_to_retirement: number;
    retirement_duration_years: number;
    desired_annual_income: number;
  }): Promise<Record<string, unknown>>;
  // Share Reports (public and owner)
  createShareReport(data: ShareReportCreateRequest): Promise<ShareReportCreateResponse>;
  getShareReport(reportId: string, token: string): Promise<ShareReportPublicResponse>;
  listShareReports(params?: { toolId?: string; limit?: number; includePayload?: boolean }): Promise<ShareReportListItem[]>;
  rotateShareReport(reportId: string, params?: { expiresInDays?: number | null }): Promise<ShareReportCreateResponse>;
  revokeShareReport(reportId: string): Promise<{ status: string }>;
  // Tax Plan Workspace
  createTaxPlan(data: TaxPlanCreateRequest): Promise<TaxPlan>;
  listTaxPlans(params?: { limit?: number }): Promise<TaxPlan[]>;
  getTaxPlan(planId: string): Promise<TaxPlan>;
  updateTaxPlan(planId: string, data: TaxPlanUpdateRequest): Promise<TaxPlan>;
  createTaxPlanVersion(planId: string, data: TaxPlanVersionCreateRequest): Promise<TaxPlanVersion>;
  listTaxPlanVersions(planId: string, params?: { limit?: number }): Promise<TaxPlanVersion[]>;
  approveTaxPlanVersion(planId: string, versionId: string): Promise<TaxPlanVersion>;
  createTaxPlanComment(planId: string, data: TaxPlanCommentCreateRequest): Promise<TaxPlanComment>;
  listTaxPlanComments(planId: string, params?: { limit?: number }): Promise<TaxPlanComment[]>;
  addTaxPlanCollaborator(planId: string, data: TaxPlanCollaboratorCreateRequest): Promise<TaxPlanCollaborator>;
  listTaxPlanCollaborators(planId: string): Promise<TaxPlanCollaborator[]>;
  revokeTaxPlanCollaborator(planId: string, collaboratorId: string): Promise<{ status: string }>;
  createTaxPlanEvent(planId: string, data: TaxPlanEventCreateRequest): Promise<TaxPlanEvent>;
  listTaxPlanEvents(planId: string, params?: { limit?: number }): Promise<TaxPlanEvent[]>;
  // Tax Documents
  uploadTaxDocument(file: File | Blob, filename: string, documentTypeHint?: string): Promise<TaxDocumentResponse>;
  listTaxDocuments(limit?: number): Promise<TaxDocumentListResponse[]>;
  getTaxDocument(documentId: string): Promise<TaxDocumentResponse>;
  deleteTaxDocument(documentId: string): Promise<void>;
  prefillTaxPlan(data: PrefillTaxPlanRequest): Promise<PrefillTaxPlanResponse>;
  // Action Intents
  getActionIntents(status?: ActionIntentStatus): Promise<ActionIntent[]>;
  getActionIntent(intentId: string): Promise<ActionIntent>;
  updateActionIntent(intentId: string, data: ActionIntentUpdate): Promise<ActionIntent>;
  getIntentManifest(intentId: string): Promise<Blob>;
  // Portability
  exportFinancialPassport(): Promise<FinancialPassport>;
  // Verification (SVP)
  generateProofOfFunds(threshold: number): Promise<SVPAttestation>;
  validateAttestation(attestation: SVPAttestation): Promise<{ 
    valid: boolean; 
    statement: string | null;
    issued_at: string;
    expires_at: string;
  }>;
}

export interface StrataClientOptions {
  baseUrl: string;
  clerkUserId?: string;
  authToken?: string;
}

export class StrataApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "StrataApiError";
    this.status = status;
    this.detail = detail;
  }
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

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.clerkUserId) {
      headers['X-Clerk-User-Id'] = this.clerkUserId;
    }
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.authHeaders(),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const detail = typeof errorBody?.detail === "string" ? errorBody.detail : undefined;
      const message = detail || `Request failed: ${response.status} ${response.statusText}`;
      throw new StrataApiError(response.status, message, detail);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/v1/health');
  }

  async getDataHealth(): Promise<DataHealthResponse> {
    return this.request<DataHealthResponse>('/api/v1/data/health');
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
   * Get the commingling vulnerability report for the Founder Operating Room.
   */
  async getVulnerabilityReport(): Promise<VulnerabilityReport> {
    return this.request<VulnerabilityReport>('/api/v1/portfolio/vulnerability-report');
  }

  /**
   * Get personal and entity runway metrics for the Founder Operating Room.
   */
  async getRunwayMetrics(): Promise<RunwayMetrics> {
    return this.request<RunwayMetrics>('/api/v1/portfolio/runway');
  }

  /**
   * Get tax shield metrics for founders.
   */
  async getTaxShieldMetrics(): Promise<TaxShieldMetrics> {
    return this.request<TaxShieldMetrics>('/api/v1/portfolio/tax-shield');
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

  async updateInvestmentAccount(id: string, data: InvestmentAccountUpdate): Promise<InvestmentAccount> {
    return this.request<InvestmentAccount>(`/api/v1/accounts/investment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvestmentAccount(id: string): Promise<void> {
    await this.request<{ status: string }>(`/api/v1/accounts/investment/${id}`, {
      method: 'DELETE',
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

  // === Notifications ===

  async listNotifications(): Promise<NotificationResponse[]> {
    return this.request<NotificationResponse[]>('/api/v1/notifications');
  }

  async updateNotification(id: string, data: { is_read: boolean }): Promise<NotificationResponse> {
    return this.request<NotificationResponse>(`/api/v1/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async markAllNotificationsRead(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/v1/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  // === Action Policy ===

  async getActionPolicy(): Promise<ActionPolicyResponse> {
    return this.request<ActionPolicyResponse>('/api/v1/agent/action-policy');
  }

  async upsertActionPolicy(data: ActionPolicyRequest): Promise<ActionPolicyResponse> {
    return this.request<ActionPolicyResponse>('/api/v1/agent/action-policy', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  async createAdvisorSession(skillName?: string, vanishMode: boolean = false): Promise<AdvisorSession> {
    return this.request<AdvisorSession>('/api/v1/advisor/sessions', {
      method: 'POST',
      body: JSON.stringify({ 
        skill_name: skillName ?? null,
        vanish_mode: vanishMode
      }),
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

  async executeRecommendation(
    recommendationId: string,
    request: ExecuteRecommendationRequest
  ): Promise<ExecuteRecommendationResponse> {
    return this.request<ExecuteRecommendationResponse>(
      `/api/v1/agent/recommendations/${recommendationId}/execute`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async getDecisionTraces(params?: {
    sessionId?: string;
    recommendationId?: string;
  }): Promise<DecisionTrace[]> {
    return this.request<DecisionTrace[]>(
      this.buildUrl('/api/v1/agent/decision-traces', {
        session_id: params?.sessionId,
        recommendation_id: params?.recommendationId,
      })
    );
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

  async getTransparencyPayload(): Promise<TransparencyPayload> {
    return this.request<TransparencyPayload>('/api/v1/data/transparency');
  }

  // === Banking (Plaid) ===

  /**
   * Create a Plaid Link token for initializing Plaid Link.
   */
  async createPlaidLinkToken(request?: PlaidLinkRequest): Promise<PlaidLinkResponse> {
    return this.request<PlaidLinkResponse>('/api/v1/banking/link', {
      method: 'POST',
      body: JSON.stringify(request ?? {}),
    });
  }

  /**
   * Handle the Plaid Link callback with the public token.
   */
  async handlePlaidCallback(request: PlaidCallbackRequest): Promise<Connection> {
    return this.request<Connection>('/api/v1/banking/callback', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all bank accounts (both manual and Plaid-linked).
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    return this.request<BankAccount[]>('/api/v1/banking/accounts');
  }

  /**
   * Get bank transactions with optional filtering and pagination.
   */
  async getBankTransactions(params?: BankTransactionQuery): Promise<PaginatedBankTransactions> {
    return this.request<PaginatedBankTransactions>(
      this.buildUrl('/api/v1/banking/transactions', {
        account_id: params?.account_id,
        start_date: params?.start_date,
        end_date: params?.end_date,
        category: params?.category,
        page: params?.page,
        page_size: params?.page_size,
      })
    );
  }

  /**
   * Get spending summary by category.
   */
  async getSpendingSummary(months?: number): Promise<SpendingSummary> {
    return this.request<SpendingSummary>(
      this.buildUrl('/api/v1/banking/spending-summary', { months })
    );
  }

  async getSubscriptions(): Promise<SubscriptionSummary> {
    return this.request<SubscriptionSummary>('/api/v1/banking/subscriptions');
  }

  async updateBankTransactionReimbursement(
    transactionId: string,
    data: BankTransactionReimbursementUpdate
  ): Promise<BankTransaction> {
    return this.request<BankTransaction>(`/api/v1/banking/transactions/${transactionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // === Calculators ===

  async runRetirementMonteCarlo(params: {
    current_savings: number;
    monthly_contribution: number;
    years_to_retirement: number;
    retirement_duration_years: number;
    desired_annual_income: number;
  }): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      this.buildUrl('/api/v1/calculators/retirement-monte-carlo', params)
    );
  }

  // === Share Reports ===

  async createShareReport(data: ShareReportCreateRequest): Promise<ShareReportCreateResponse> {
    return this.request<ShareReportCreateResponse>('/api/v1/share-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getShareReport(reportId: string, token: string): Promise<ShareReportPublicResponse> {
    return this.request<ShareReportPublicResponse>(
      this.buildUrl(`/api/v1/share-reports/${reportId}`, { token })
    );
  }

  async listShareReports(params?: { toolId?: string; limit?: number; includePayload?: boolean }): Promise<ShareReportListItem[]> {
    return this.request<ShareReportListItem[]>(
      this.buildUrl('/api/v1/share-reports', {
        tool_id: params?.toolId,
        limit: params?.limit,
        include_payload: params?.includePayload ? "true" : undefined,
      })
    );
  }

  async rotateShareReport(reportId: string, params?: { expiresInDays?: number | null }): Promise<ShareReportCreateResponse> {
    return this.request<ShareReportCreateResponse>(
      this.buildUrl(`/api/v1/share-reports/${reportId}/rotate`, { expires_in_days: params?.expiresInDays ?? undefined }),
      { method: 'POST' }
    );
  }

  async revokeShareReport(reportId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/api/v1/share-reports/${reportId}`, { method: 'DELETE' });
  }

  // === Tax Plan Workspace ===

  async createTaxPlan(data: TaxPlanCreateRequest): Promise<TaxPlan> {
    return this.request<TaxPlan>('/api/v1/tax-plan-workspace/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTaxPlans(params?: { limit?: number }): Promise<TaxPlan[]> {
    return this.request<TaxPlan[]>(
      this.buildUrl('/api/v1/tax-plan-workspace/plans', { limit: params?.limit })
    );
  }

  async getTaxPlan(planId: string): Promise<TaxPlan> {
    return this.request<TaxPlan>(`/api/v1/tax-plan-workspace/plans/${planId}`);
  }

  async updateTaxPlan(planId: string, data: TaxPlanUpdateRequest): Promise<TaxPlan> {
    return this.request<TaxPlan>(`/api/v1/tax-plan-workspace/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createTaxPlanVersion(planId: string, data: TaxPlanVersionCreateRequest): Promise<TaxPlanVersion> {
    return this.request<TaxPlanVersion>(`/api/v1/tax-plan-workspace/plans/${planId}/versions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTaxPlanVersions(planId: string, params?: { limit?: number }): Promise<TaxPlanVersion[]> {
    return this.request<TaxPlanVersion[]>(
      this.buildUrl(`/api/v1/tax-plan-workspace/plans/${planId}/versions`, { limit: params?.limit })
    );
  }

  async approveTaxPlanVersion(planId: string, versionId: string): Promise<TaxPlanVersion> {
    return this.request<TaxPlanVersion>(
      `/api/v1/tax-plan-workspace/plans/${planId}/versions/${versionId}/approve`,
      { method: 'POST' }
    );
  }

  async createTaxPlanComment(planId: string, data: TaxPlanCommentCreateRequest): Promise<TaxPlanComment> {
    return this.request<TaxPlanComment>(`/api/v1/tax-plan-workspace/plans/${planId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTaxPlanComments(planId: string, params?: { limit?: number }): Promise<TaxPlanComment[]> {
    return this.request<TaxPlanComment[]>(
      this.buildUrl(`/api/v1/tax-plan-workspace/plans/${planId}/comments`, { limit: params?.limit })
    );
  }

  async addTaxPlanCollaborator(
    planId: string,
    data: TaxPlanCollaboratorCreateRequest
  ): Promise<TaxPlanCollaborator> {
    return this.request<TaxPlanCollaborator>(
      `/api/v1/tax-plan-workspace/plans/${planId}/collaborators`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listTaxPlanCollaborators(planId: string): Promise<TaxPlanCollaborator[]> {
    return this.request<TaxPlanCollaborator[]>(
      `/api/v1/tax-plan-workspace/plans/${planId}/collaborators`
    );
  }

  async revokeTaxPlanCollaborator(planId: string, collaboratorId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(
      `/api/v1/tax-plan-workspace/plans/${planId}/collaborators/${collaboratorId}`,
      { method: 'DELETE' }
    );
  }

  async createTaxPlanEvent(planId: string, data: TaxPlanEventCreateRequest): Promise<TaxPlanEvent> {
    return this.request<TaxPlanEvent>(`/api/v1/tax-plan-workspace/plans/${planId}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTaxPlanEvents(planId: string, params?: { limit?: number }): Promise<TaxPlanEvent[]> {
    return this.request<TaxPlanEvent[]>(
      this.buildUrl(`/api/v1/tax-plan-workspace/plans/${planId}/events`, { limit: params?.limit })
    );
  }

  // === Tax Documents ===

  async uploadTaxDocument(
    file: File | Blob,
    filename: string,
    documentTypeHint?: string
  ): Promise<TaxDocumentResponse> {
    const headers = this.authHeaders();

    const formData = new FormData();
    formData.append('file', file, filename);
    if (documentTypeHint) {
      formData.append('document_type_hint', documentTypeHint);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/tax-documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const detail = typeof errorBody?.detail === 'string' ? errorBody.detail : undefined;
      throw new StrataApiError(response.status, detail || `Upload failed: ${response.status}`, detail);
    }

    return response.json();
  }

  async listTaxDocuments(limit?: number): Promise<TaxDocumentListResponse[]> {
    return this.request<TaxDocumentListResponse[]>(
      this.buildUrl('/api/v1/tax-documents/', { limit })
    );
  }

  async getTaxDocument(documentId: string): Promise<TaxDocumentResponse> {
    return this.request<TaxDocumentResponse>(`/api/v1/tax-documents/${documentId}`);
  }

  async deleteTaxDocument(documentId: string): Promise<void> {
    await this.request<void>(`/api/v1/tax-documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async prefillTaxPlan(data: PrefillTaxPlanRequest): Promise<PrefillTaxPlanResponse> {
    return this.request<PrefillTaxPlanResponse>('/api/v1/tax-documents/prefill-tax-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === Action Intents ===

  async getActionIntents(status?: ActionIntentStatus): Promise<ActionIntent[]> {
    return this.request<ActionIntent[]>(
      this.buildUrl('/api/v1/action-intents', { status })
    );
  }

  async getActionIntent(intentId: string): Promise<ActionIntent> {
    return this.request<ActionIntent>(`/api/v1/action-intents/${intentId}`);
  }

  async updateActionIntent(
    intentId: string,
    data: ActionIntentUpdate
  ): Promise<ActionIntent> {
    return this.request<ActionIntent>(`/api/v1/action-intents/${intentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getIntentManifest(intentId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/action-intents/${intentId}/manifest`, {
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.blob();
  }

  // === Portability ===

  async exportFinancialPassport(): Promise<FinancialPassport> {
    return this.request<FinancialPassport>('/api/v1/portability/export');
  }

  async generateProofOfFunds(threshold: number): Promise<SVPAttestation> {
    return this.request<SVPAttestation>('/api/v1/portability/verify/proof-of-funds', {
      method: 'POST',
      body: JSON.stringify({ threshold }),
    });
  }

  async validateAttestation(attestation: SVPAttestation): Promise<{ 
    valid: boolean; 
    statement: string | null;
    issued_at: string;
    expires_at: string;
  }> {
    return this.request('/api/v1/portability/verify/validate', {
      method: 'POST',
      body: JSON.stringify(attestation),
    });
  }
}
