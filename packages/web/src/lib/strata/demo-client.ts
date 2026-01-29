import type {
  AllAccountsResponse,
  Connection,
  ConnectionCallbackRequest,
  HealthResponse,
  HoldingDetail,
  Institution,
  InvestmentAccount,
  InvestmentAccountWithHoldings,
  LinkSessionRequest,
  LinkSessionResponse,
  PortfolioSummary,
  StrataClientInterface,
} from "@clearmoney/strata-sdk";

import {
  DEMO_CONNECTIONS,
  DEMO_INSTITUTIONS,
  DEMO_INVESTMENT_ACCOUNTS,
  getDemoAccountsResponse,
  getDemoHoldings,
  getDemoInvestmentAccountWithHoldings,
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
}
