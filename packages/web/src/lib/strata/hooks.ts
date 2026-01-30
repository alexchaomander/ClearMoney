"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStrataClient } from "./client";
import type {
  CashAccountCreate,
  CashAccountUpdate,
  ConnectionCallbackRequest,
  DebtAccountCreate,
  DebtAccountUpdate,
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
