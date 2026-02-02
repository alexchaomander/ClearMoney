"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStrataClient } from "./client";
import type {
  CashAccountCreate,
  CashAccountUpdate,
  ConnectionCallbackRequest,
  DebtAccountCreate,
  DebtAccountUpdate,
  FinancialMemoryUpdate,
  InvestmentAccountCreate,
  LinkSessionRequest,
  PortfolioHistoryRange,
} from "@clearmoney/strata-sdk";

export const queryKeys = {
  portfolioSummary: ["portfolio", "summary"] as const,
  investmentAccounts: ["accounts", "investment"] as const,
  investmentAccount: (id: string) => ["accounts", "investment", id] as const,
  holdings: ["portfolio", "holdings"] as const,
  connections: ["connections"] as const,
  accounts: ["accounts", "all"] as const,
  searchInstitutions: (query?: string) =>
    ["institutions", "search", query ?? ""] as const,
  popularInstitutions: ["institutions", "popular"] as const,
  portfolioHistory: (range: PortfolioHistoryRange) =>
    ["portfolio", "history", range] as const,
  financialMemory: ["memory"] as const,
  memoryEvents: ["memory", "events"] as const,
  financialContext: (format: 'json' | 'markdown') =>
    ["memory", "context", format] as const,
  skills: ["skills"] as const,
  availableSkills: ["skills", "available"] as const,
  advisorSessions: ["advisor", "sessions"] as const,
  advisorSession: (id: string) => ["advisor", "sessions", id] as const,
  recommendations: ["advisor", "recommendations"] as const,
  creditCards: ["creditCards"] as const,
  creditCard: (id: string) => ["creditCards", id] as const,
};

export function usePortfolioSummary() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.portfolioSummary,
    queryFn: () => client.getPortfolioSummary(),
  });
}

export function useInvestmentAccounts() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.investmentAccounts,
    queryFn: () => client.getInvestmentAccounts(),
  });
}

export function useInvestmentAccount(id: string) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.investmentAccount(id),
    queryFn: () => client.getInvestmentAccount(id),
    enabled: !!id,
  });
}

export function useHoldings() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.holdings,
    queryFn: () => client.getHoldings(),
  });
}

export function useConnections() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.connections,
    queryFn: () => client.getConnections(),
  });
}

export function useAccounts() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => client.getAccounts(),
  });
}

export function useSearchInstitutions(query?: string) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.searchInstitutions(query),
    queryFn: () => client.searchInstitutions(query),
    enabled: !!query,
  });
}

export function usePopularInstitutions() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.popularInstitutions,
    queryFn: () => client.getPopularInstitutions(),
  });
}

// === Mutation hooks ===

/** Invalidate all portfolio-related queries after a connection change. */
function invalidatePortfolioQueries(queryClient: ReturnType<typeof useQueryClient>): void {
  const keys = [
    queryKeys.connections,
    queryKeys.accounts,
    queryKeys.investmentAccounts,
    queryKeys.portfolioSummary,
    queryKeys.holdings,
  ];
  for (const queryKey of keys) {
    queryClient.invalidateQueries({ queryKey });
  }
}

/** Invalidate portfolio queries and history after account data changes. */
function invalidateAllPortfolioData(queryClient: ReturnType<typeof useQueryClient>): void {
  invalidatePortfolioQueries(queryClient);
  queryClient.invalidateQueries({ queryKey: ["portfolio", "history"] });
}

export function useCreateLinkSession() {
  const client = useStrataClient();
  return useMutation({
    mutationFn: (request?: LinkSessionRequest) =>
      client.createLinkSession(request),
  });
}

export function useHandleConnectionCallback() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ConnectionCallbackRequest) =>
      client.handleConnectionCallback(request),
    onSuccess: () => invalidatePortfolioQueries(queryClient),
  });
}

export function useSyncConnection() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => client.syncConnection(connectionId),
    onSuccess: () => invalidatePortfolioQueries(queryClient),
  });
}

export function useDeleteConnection() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => client.deleteConnection(connectionId),
    onSuccess: () => invalidatePortfolioQueries(queryClient),
  });
}

// === Portfolio History ===

export function usePortfolioHistory(range: PortfolioHistoryRange) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.portfolioHistory(range),
    queryFn: () => client.getPortfolioHistory(range),
  });
}

// === Cash/Debt Account Mutations ===

export function useCashAccountMutations() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const onSuccess = () => invalidateAllPortfolioData(queryClient);

  const create = useMutation({
    mutationFn: (data: CashAccountCreate) => client.createCashAccount(data),
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CashAccountUpdate }) =>
      client.updateCashAccount(id, data),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (id: string) => client.deleteCashAccount(id),
    onSuccess,
  });

  return { create, update, remove };
}

export function useDebtAccountMutations() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const onSuccess = () => invalidateAllPortfolioData(queryClient);

  const create = useMutation({
    mutationFn: (data: DebtAccountCreate) => client.createDebtAccount(data),
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DebtAccountUpdate }) =>
      client.updateDebtAccount(id, data),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (id: string) => client.deleteDebtAccount(id),
    onSuccess,
  });

  return { create, update, remove };
}

export function useCreateInvestmentAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvestmentAccountCreate) =>
      client.createInvestmentAccount(data),
    onSuccess: () => invalidateAllPortfolioData(queryClient),
  });
}

// === Financial Memory ===

export function useFinancialMemory() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.financialMemory,
    queryFn: () => client.getFinancialMemory(),
  });
}

export function useUpdateMemory() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FinancialMemoryUpdate) =>
      client.updateFinancialMemory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financialMemory });
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryEvents });
    },
  });
}

export function useDeriveMemory() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.deriveMemory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financialMemory });
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryEvents });
    },
  });
}

export function useMemoryEvents() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.memoryEvents,
    queryFn: () => client.getMemoryEvents(),
  });
}

export function useFinancialContext(format: 'json' | 'markdown' = 'json') {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.financialContext(format),
    queryFn: () => client.getFinancialContext(format),
  });
}

// === Skills ===

export function useSkills() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: () => client.getSkills(),
  });
}

export function useAvailableSkills() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.availableSkills,
    queryFn: () => client.getAvailableSkills(),
  });
}

// === Advisor ===

export function useAdvisorSessions() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.advisorSessions,
    queryFn: () => client.getAdvisorSessions(),
  });
}

export function useAdvisorSession(id: string) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.advisorSession(id),
    queryFn: () => client.getAdvisorSession(id),
    enabled: !!id,
  });
}

export function useCreateAdvisorSession() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillName?: string) => client.createAdvisorSession(skillName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advisorSessions });
    },
  });
}

export function useSendAdvisorMessage() {
  const client = useStrataClient();
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      client.sendAdvisorMessage(sessionId, content),
  });
}

export function useRecommendations() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: () => client.getRecommendations(),
  });
}

// === Credit Cards ===

export function useCreditCards() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.creditCards,
    queryFn: () => client.getCreditCards(),
  });
}

export function useCreditCard(id: string) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.creditCard(id),
    queryFn: () => client.getCreditCard(id),
    enabled: !!id,
  });
}

export function useSeedAmexPlatinum() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => client.seedAmexPlatinum(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });
}
