"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStrataClient } from "./client";
import type {
  BankTransactionQuery,
  CashAccountCreate,
  CashAccountUpdate,
  ConnectionCallbackRequest,
  DebtAccountCreate,
  DebtAccountUpdate,
  FinancialMemoryUpdate,
  ExecuteRecommendationRequest,
  InvestmentAccountCreate,
  InvestmentAccountUpdate,
  LinkSessionRequest,
  PlaidCallbackRequest,
  PlaidLinkRequest,
  PortfolioHistoryRange,
} from "@clearmoney/strata-sdk";

export const queryKeys = {
  portfolioSummary: ["portfolio", "summary"] as const,
  investmentAccounts: ["accounts", "investment"] as const,
  vulnerabilityReport: ["portfolio", "vulnerabilityReport"] as const,
  runwayMetrics: ["portfolio", "runwayMetrics"] as const,
  taxShieldMetrics: ["portfolio", "taxShieldMetrics"] as const,
  monteCarloRetirement: (params: any) => ["calculators", "monteCarlo", params] as const,
  investmentAccount: (id: string) => ["accounts", "investment", id] as const,
  holdings: ["portfolio", "holdings"] as const,
  transactions: (params?: { accountId?: string; startDate?: string; endDate?: string }) =>
    ["portfolio", "transactions", params?.accountId ?? "", params?.startDate ?? "", params?.endDate ?? ""] as const,
  connections: ["connections"] as const,
  accounts: ["accounts", "all"] as const,
  searchInstitutions: (query?: string) =>
    ["institutions", "search", query ?? ""] as const,
  popularInstitutions: ["institutions", "popular"] as const,
  portfolioHistory: (range: PortfolioHistoryRange) =>
    ["portfolio", "history", range] as const,
  financialMemory: ["memory"] as const,
  memoryEvents: ["memory", "events"] as const,
  notifications: ["notifications"] as const,
  financialContext: (format: 'json' | 'markdown') =>
    ["memory", "context", format] as const,
  skills: ["skills"] as const,
  availableSkills: ["skills", "available"] as const,
  actionPolicy: ["agent", "actionPolicy"] as const,
  advisorSessions: ["advisor", "sessions"] as const,
  advisorSession: (id: string) => ["advisor", "sessions", id] as const,
  recommendations: ["advisor", "recommendations"] as const,
  creditCards: ["creditCards"] as const,
  creditCard: (id: string) => ["creditCards", id] as const,
  pointsPrograms: ["data", "pointsPrograms"] as const,
  creditCardData: ["data", "creditCards"] as const,
  liquidAssets: ["data", "liquidAssets"] as const,
  investments: ["data", "investments"] as const,
  realAssets: ["data", "realAssets"] as const,
  liabilities: ["data", "liabilities"] as const,
  income: ["data", "income"] as const,
  credit: ["data", "credit"] as const,
  protection: ["data", "protection"] as const,
  dataHealth: ["data", "health"] as const,
  transparencyPayload: ["data", "transparency"] as const,
  toolPresets: ["data", "toolPresets"] as const,
  consents: ["consents"] as const,
  decisionTraces: (filters?: { sessionId?: string; recommendationId?: string }) =>
    ["decisionTraces", filters?.sessionId ?? "", filters?.recommendationId ?? ""] as const,
  // Banking (Plaid)
  bankAccounts: ["banking", "accounts"] as const,
  bankTransactions: (params?: BankTransactionQuery) =>
    ["banking", "transactions", params ?? {}] as const,
  spendingSummary: (months?: number) => ["banking", "spending-summary", months ?? 3] as const,
};

export function usePortfolioSummary(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.portfolioSummary,
    queryFn: () => client.getPortfolioSummary(),
    enabled: options?.enabled ?? true,
  });
}

export function useInvestmentAccounts(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.investmentAccounts,
    queryFn: () => client.getInvestmentAccounts(),
    enabled: options?.enabled ?? true,
  });
}

export function useVulnerabilityReport(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.vulnerabilityReport,
    queryFn: () => client.getVulnerabilityReport(),
    enabled: options?.enabled ?? true,
  });
}

export function useRunwayMetrics(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.runwayMetrics,
    queryFn: () => client.getRunwayMetrics(),
    enabled: options?.enabled ?? true,
  });
}

export function useTaxShieldMetrics(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.taxShieldMetrics,
    queryFn: () => client.getTaxShieldMetrics(),
    enabled: options?.enabled ?? true,
  });
}

export function useRetirementMonteCarlo(
  params: Parameters<ReturnType<typeof useStrataClient>["runRetirementMonteCarlo"]>[0],
  options?: { enabled?: boolean }
) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.monteCarloRetirement(params),
    queryFn: () => client.runRetirementMonteCarlo(params),
    enabled: (options?.enabled ?? true) && !!params.desired_annual_income,
  });
}

export function useInvestmentAccount(id: string, options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.investmentAccount(id),
    queryFn: () => client.getInvestmentAccount(id),
    enabled: (options?.enabled ?? true) && !!id,
  });
}

export function useHoldings(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.holdings,
    queryFn: () => client.getHoldings(),
    enabled: options?.enabled ?? true,
  });
}

export function useTransactions(
  params?: { accountId?: string; startDate?: string; endDate?: string },
  options?: { enabled?: boolean }
) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => client.getTransactions(params),
    enabled: options?.enabled ?? true,
  });
}

export function useConnections(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.connections,
    queryFn: () => client.getConnections(),
    enabled: options?.enabled ?? true,
  });
}

export function useAccounts(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => client.getAccounts(),
    enabled: options?.enabled ?? true,
  });
}

export function useSearchInstitutions(query?: string, options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.searchInstitutions(query),
    queryFn: () => client.searchInstitutions(query),
    enabled: (options?.enabled ?? true) && !!query,
  });
}

export function usePopularInstitutions(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.popularInstitutions,
    queryFn: () => client.getPopularInstitutions(),
    enabled: options?.enabled ?? true,
  });
}

// === Shared Data ===

export function usePointsPrograms() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.pointsPrograms,
    queryFn: () => client.getPointsPrograms(),
  });
}

export function useCreditCardData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.creditCardData,
    queryFn: () => client.getCreditCardData(),
  });
}

export function useLiquidAssets() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.liquidAssets,
    queryFn: () => client.getLiquidAssets(),
  });
}

export function useInvestmentData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.investments,
    queryFn: () => client.getInvestments(),
  });
}

export function useRealAssetData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.realAssets,
    queryFn: () => client.getRealAssets(),
  });
}

export function useLiabilityData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.liabilities,
    queryFn: () => client.getLiabilities(),
  });
}

export function useIncomeData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.income,
    queryFn: () => client.getIncome(),
  });
}

export function useCreditData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.credit,
    queryFn: () => client.getCredit(),
  });
}

export function useProtectionData() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.protection,
    queryFn: () => client.getProtection(),
  });
}

export function useDataHealth() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.dataHealth,
    queryFn: () => client.getDataHealth(),
  });
}

export function useTransparencyPayload() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.transparencyPayload,
    queryFn: () => client.getTransparencyPayload(),
  });
}

export function useToolPresets() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.toolPresets,
    queryFn: () => client.getToolPresets(),
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

export function useSyncAllConnections() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.syncAllConnections(),
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

export function usePortfolioHistory(range: PortfolioHistoryRange, options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.portfolioHistory(range),
    queryFn: () => client.getPortfolioHistory(range),
    enabled: options?.enabled ?? true,
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

// === Consent ===

export function useConsents() {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.consents,
    queryFn: () => client.listConsents(),
  });
}

export function useConsentStatus(scopes: string[]) {
  const { data, isLoading } = useConsents();
  const hasConsent =
    data?.some(
      (consent) =>
        consent.status === "active" &&
        scopes.every((scope) => consent.scopes.includes(scope))
    ) ?? false;
  return { hasConsent, isLoading };
}

export function useCreateConsent() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof client.createConsent>[0]) =>
      client.createConsent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.consents }),
  });
}

export function useRevokeConsent() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consentId: string) => client.revokeConsent(consentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.consents }),
  });
}

// === Decision Traces ===

export function useDecisionTraces(
  filters?: { sessionId?: string; recommendationId?: string },
  options?: { enabled?: boolean }
) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.decisionTraces(filters),
    queryFn: () => client.getDecisionTraces(filters),
    enabled: options?.enabled ?? true,
  });
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

export function useInvestmentAccountMutations() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const onSuccess = () => invalidateAllPortfolioData(queryClient);

  const create = useMutation({
    mutationFn: (data: InvestmentAccountCreate) => client.createInvestmentAccount(data),
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvestmentAccountUpdate }) =>
      client.updateInvestmentAccount(id, data),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (id: string) => client.deleteInvestmentAccount(id),
    onSuccess,
  });

  return { create, update, remove };
}

// === Financial Memory ===

export function useFinancialMemory(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.financialMemory,
    queryFn: () => client.getFinancialMemory(),
    enabled: options?.enabled ?? true,
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

export function useMemoryEvents(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.memoryEvents,
    queryFn: () => client.getMemoryEvents(),
    enabled: options?.enabled ?? true,
  });
}

// === Notifications ===

export function useNotifications(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => client.listNotifications(),
    enabled: options?.enabled ?? true,
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useUpdateNotification() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { is_read: boolean } }) =>
      client.updateNotification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
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

// === Action Policy ===

export function useActionPolicy(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.actionPolicy,
    queryFn: () => client.getActionPolicy(),
    enabled: options?.enabled ?? true,
    retry: false, // Don't retry 404s
  });
}

export function useUpsertActionPolicy() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof client.upsertActionPolicy>[0]) =>
      client.upsertActionPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionPolicy });
    },
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
    mutationFn: ({ skillName, vanishMode }: { skillName?: string; vanishMode?: boolean } = {}) => 
      client.createAdvisorSession(skillName, vanishMode),
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

export function useExecuteRecommendation() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recommendationId,
      request,
    }: {
      recommendationId: string;
      request: ExecuteRecommendationRequest;
    }) => client.executeRecommendation(recommendationId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      queryClient.invalidateQueries({ queryKey: ["decisionTraces"] });
    },
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

// === Banking (Plaid) ===

/** Invalidate all banking-related queries after a connection change. */
function invalidateBankingQueries(queryClient: ReturnType<typeof useQueryClient>): void {
  const keys = [
    queryKeys.bankAccounts,
    ["banking", "transactions"],
    ["banking", "spending-summary"],
    queryKeys.accounts,
    queryKeys.financialMemory,
  ];
  for (const queryKey of keys) {
    queryClient.invalidateQueries({ queryKey });
  }
}

export function useCreatePlaidLinkToken() {
  const client = useStrataClient();
  return useMutation({
    mutationFn: (request?: PlaidLinkRequest) => client.createPlaidLinkToken(request),
  });
}

export function useHandlePlaidCallback() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PlaidCallbackRequest) => client.handlePlaidCallback(request),
    onSuccess: () => invalidateBankingQueries(queryClient),
  });
}

export function useBankAccounts(options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.bankAccounts,
    queryFn: () => client.getBankAccounts(),
    enabled: options?.enabled ?? true,
  });
}

export function useBankTransactions(
  params?: BankTransactionQuery,
  options?: { enabled?: boolean }
) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.bankTransactions(params),
    queryFn: () => client.getBankTransactions(params),
    enabled: options?.enabled ?? true,
  });
}

export function useSpendingSummary(months?: number, options?: { enabled?: boolean }) {
  const client = useStrataClient();
  return useQuery({
    queryKey: queryKeys.spendingSummary(months),
    queryFn: () => client.getSpendingSummary(months),
    enabled: options?.enabled ?? true,
  });
}
