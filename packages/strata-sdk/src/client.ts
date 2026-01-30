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
  HealthResponse,
  HoldingDetail,
  Institution,
  InvestmentAccount,
  InvestmentAccountWithHoldings,
  LinkSessionRequest,
  LinkSessionResponse,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  PortfolioSummary,
} from './types';

export interface StrataClientInterface {
  setClerkUserId(userId: string): void;
  healthCheck(): Promise<HealthResponse>;
  createLinkSession(request?: LinkSessionRequest): Promise<LinkSessionResponse>;
  handleConnectionCallback(request: ConnectionCallbackRequest): Promise<Connection>;
  getConnections(): Promise<Connection[]>;
  deleteConnection(connectionId: string): Promise<void>;
  syncConnection(connectionId: string): Promise<Connection>;
  getAccounts(): Promise<AllAccountsResponse>;
  getInvestmentAccounts(): Promise<InvestmentAccount[]>;
  getInvestmentAccount(accountId: string): Promise<InvestmentAccountWithHoldings>;
  searchInstitutions(query?: string, limit?: number): Promise<Institution[]>;
  getPopularInstitutions(limit?: number): Promise<Institution[]>;
  getPortfolioSummary(): Promise<PortfolioSummary>;
  getHoldings(): Promise<HoldingDetail[]>;
  createCashAccount(data: CashAccountCreate): Promise<CashAccount>;
  updateCashAccount(id: string, data: CashAccountUpdate): Promise<CashAccount>;
  deleteCashAccount(id: string): Promise<void>;
  createDebtAccount(data: DebtAccountCreate): Promise<DebtAccount>;
  updateDebtAccount(id: string, data: DebtAccountUpdate): Promise<DebtAccount>;
  deleteDebtAccount(id: string): Promise<void>;
  getPortfolioHistory(range: PortfolioHistoryRange): Promise<PortfolioHistoryPoint[]>;
}

export interface StrataClientOptions {
  baseUrl: string;
  clerkUserId?: string;
}

export class StrataClient implements StrataClientInterface {
  private baseUrl: string;
  private clerkUserId: string | null;

  constructor(options: StrataClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.clerkUserId = options.clerkUserId ?? null;
  }

  /**
   * Set the Clerk user ID for authenticated requests.
   */
  setClerkUserId(userId: string): void {
    this.clerkUserId = userId;
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
}
