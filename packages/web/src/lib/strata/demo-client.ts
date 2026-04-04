"use client";

import type {
  ActionIntent,
  ActionIntentStatus,
  ActionIntentUpdate,
  ActionPolicyRequest,
  ActionPolicyResponse,
  AllAccountsResponse,
  Budget,
  BudgetCreate,
  BudgetSummary,
  BudgetUpdate,
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
  ConsumerHome,
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
  InboxItem,
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
  Goal,
  GoalCreate,
  GoalUpdate,
  TaxShieldMetrics,
  Transaction,
  TransactionRule,
  TransactionRuleCreate,
  TransactionRuleUpdate,
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
  NarrativeResponse,
  RecurringItem,
  RecurringItemUpdate,
  ReviewItem,
  ReviewItemStatus,
  WeeklyBriefing,
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
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEMO_MEMORY_STORAGE_KEY = "clearmoney-demo-memory.v1";
const DEMO_SHARE_REPORTS_STORAGE_KEY = "clearmoney-demo-share-reports.v1";
const DEMO_TAX_DOCS_STORAGE_KEY = "clearmoney-demo-tax-docs.v1";
const DEMO_TAX_PLANS_STORAGE_KEY = "clearmoney-demo-tax-plans.v1";
const DEMO_BANK_TX_REIMBURSEMENTS_STORAGE_KEY = "clearmoney-demo-bank-tx-reimbursements.v1";
const DEMO_BUDGETS_STORAGE_KEY = "clearmoney-demo-budgets.v1";
const DEMO_GOALS_STORAGE_KEY = "clearmoney-demo-goals.v1";
const DEMO_RECURRING_STORAGE_KEY = "clearmoney-demo-recurring.v1";
const DEMO_TRANSACTION_RULES_STORAGE_KEY = "clearmoney-demo-transaction-rules.v1";
const DEMO_INBOX_STORAGE_KEY = "clearmoney-demo-inbox.v1";
const DEMO_REVIEW_STORAGE_KEY = "clearmoney-demo-review.v1";
const DEMO_SYNC_CHANNEL_NAME = "clearmoney-demo-sync.v1";

type DemoShareReportRecord = ShareReportListItem & {
  token: string;
  payload: unknown;
  tool_id: string;
  expires_at: string | null;
  last_viewed_at: string | null;
  max_views: number | null;
  view_count: number;
  revoked_at: string | null;
};

type DemoSyncMessage = {
  key: string;
  value: unknown;
};

let demoSyncChannel: BroadcastChannel | null = null;
let demoSyncListenerAttached = false;

function getDemoSyncChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!demoSyncChannel) {
    demoSyncChannel = new BroadcastChannel(DEMO_SYNC_CHANNEL_NAME);
  }
  return demoSyncChannel;
}

function ensureDemoSyncListener(): void {
  const channel = getDemoSyncChannel();
  if (!channel || demoSyncListenerAttached) {
    return;
  }
  channel.addEventListener("message", (event: MessageEvent<DemoSyncMessage>) => {
    const { key, value } = event.data ?? {};
    if (typeof window === "undefined" || typeof key !== "string") {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore demo sync failures
    }
  });
  demoSyncListenerAttached = true;
}

function readStorageJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  ensureDemoSyncListener();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorageJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  ensureDemoSyncListener();
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    getDemoSyncChannel()?.postMessage({ key, value } satisfies DemoSyncMessage);
  } catch {
    // ignore demo persistence failures
  }
}

function buildDefaultFounderSnapshotInputs(): CalculatorInputs {
  return {
    annualNetIncome: 240000,
    ownersCount: 1,
    employeesCount: 3,
    legalEntityType: "llc",
    fundingPlan: "bootstrapped",
    ownerRole: "operator",
    marketSalary: 180000,
    plannedSalary: 120000,
    payrollAdminCosts: 2400,
    statePayrollTaxRate: 0.034,
    ssWageBase: 168600,
    stateCode: "CA",
    filingStatus: "single",
    priorYearTax: 52000,
    projectedCurrentTax: 56000,
    federalWithholding: 18000,
    estimatedPayments: 8000,
    currentQuarter: 2,
    entityStartDate: "2024-01-15",
    taxYearStartDate: "2026-01-01",
    taxElection: "s_corp",
    payrollCadence: "monthly",
    businessAccounts: 2,
    personalAccounts: 2,
    mixedTransactionsPerMonth: 6,
    reimbursementPolicy: "accountable",
    hasEquityGrants: true,
    equityGrantType: "options",
    daysSinceGrant: 45,
    vestingYears: 4,
    cliffMonths: 12,
    strikePrice: 1.25,
    fairMarketValue: 4.5,
    sharesGranted: 80000,
    exerciseWindowMonths: 90,
    isQualifiedBusiness: true,
    assetsAtIssuance: 850000,
    expectedHoldingYears: 6,
  };
}

function buildDefaultDemoMemory(): FinancialMemory {
  const now = new Date().toISOString();
  const snapshotId = "demo-founder-snapshot-001";
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
    notes: {
      founderCoveragePlanner: {
        version: 2,
        latestSnapshotId: snapshotId,
        snapshots: [
          {
            id: snapshotId,
            savedAt: now,
            inputs: buildDefaultFounderSnapshotInputs(),
            checklist: {
              entity: true,
              payroll: true,
              estimatedTaxes: true,
              reimbursement: true,
              equity: true,
            },
            insights: {
              commingling90d: {
                startDate: "2025-11-01",
                endDate: "2026-01-30",
                rate: 0.22,
                comminglingCount: 6,
                eligibleCount: 27,
                topMerchants: ["Uber", "Lyft", "Target"],
              },
            },
          },
        ],
      },
    },
    employer_name: "Demo Employer INC",
    employer_industry: "Technology",
    life_insurance_benefit: 1000000,
    disability_insurance_benefit: 7000,
    umbrella_policy_limit: null,
    has_will: true,
    has_trust: false,
    has_poa: true,
    entity_type: "s_corp",
    created_at: now,
    updated_at: now,
  };
}

function readDemoMemory(): FinancialMemory {
  return readStorageJson<FinancialMemory>(DEMO_MEMORY_STORAGE_KEY, buildDefaultDemoMemory());
}

function writeDemoMemory(memory: FinancialMemory): void {
  writeStorageJson(DEMO_MEMORY_STORAGE_KEY, memory);
}

function readDemoShareReports(): DemoShareReportRecord[] {
  return readStorageJson<DemoShareReportRecord[]>(DEMO_SHARE_REPORTS_STORAGE_KEY, []);
}

function writeDemoShareReports(reports: DemoShareReportRecord[]): void {
  writeStorageJson(DEMO_SHARE_REPORTS_STORAGE_KEY, reports);
}

function readDemoTaxDocuments(): TaxDocumentResponse[] {
  return readStorageJson<TaxDocumentResponse[]>(DEMO_TAX_DOCS_STORAGE_KEY, []);
}

function writeDemoTaxDocuments(documents: TaxDocumentResponse[]): void {
  writeStorageJson(DEMO_TAX_DOCS_STORAGE_KEY, documents);
}

function readDemoTaxPlans(): TaxPlan[] {
  return readStorageJson<TaxPlan[]>(DEMO_TAX_PLANS_STORAGE_KEY, []);
}

function writeDemoTaxPlans(plans: TaxPlan[]): void {
  writeStorageJson(DEMO_TAX_PLANS_STORAGE_KEY, plans);
}

function inferDemoTaxDocumentType(filename: string, hint?: string | null): string | null {
  if (hint) return hint;
  const normalized = filename.toLowerCase();
  if (normalized.includes("w2")) return "w2";
  if (normalized.includes("1099")) return "1099";
  if (normalized.includes("k1") || normalized.includes("k-1")) return "k1";
  return null;
}

function buildDemoExtractedData(documentType: string | null): Record<string, unknown> {
  if (documentType === "1099") {
    return {
      payer_name: "Stripe Atlas Bank",
      nonemployee_compensation: 18500,
      federal_income_tax_withheld: 2500,
    };
  }
  if (documentType === "k1") {
    return {
      entity_name: "Demo Ventures LLC",
      ordinary_business_income: 42000,
      guaranteed_payments: 6000,
    };
  }
  return {
    employer_name: "Acme Corp",
    wages_tips_compensation: 125000,
    federal_income_tax_withheld: 22000,
  };
}

function buildDemoBankAccounts(): BankAccount[] {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-bank-personal-001",
      user_id: "demo-user-001",
      connection_id: "conn-demo-1",
      name: "Chase Personal Checking",
      account_type: "checking",
      balance: 22000,
      available_balance: 22000,
      institution_name: "Chase",
      mask: "1234",
      is_manual: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-bank-business-001",
      user_id: "demo-user-001",
      connection_id: "conn-demo-2",
      name: "Mercury Business Checking",
      account_type: "checking",
      balance: 94500,
      available_balance: 94500,
      institution_name: "Mercury",
      mask: "5678",
      is_manual: false,
      created_at: now,
      updated_at: now,
    },
  ];
}

function buildDemoBankTransactions(now: Date = new Date()): BankTransaction[] {
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };
  const businessId = "demo-bank-business-001";
  const base = [
    ["tx-1", -1200, "STRIPE ATLAS ANNUAL", "TRANSFER_OUT", "Stripe Atlas", 83],
    ["tx-2", -64, "UBER", "TRANSPORTATION", "Uber", 78],
    ["tx-3", -42, "UBER EATS", "FOOD_AND_DRINK", "Uber Eats", 74],
    ["tx-4", -260, "AWS", "TRANSFER_OUT", "Amazon Web Services", 71],
    ["tx-5", -58, "LYFT", "TRANSPORTATION", "Lyft", 66],
    ["tx-6", -89, "TARGET", "SHOPPING", "Target", 61],
    ["tx-7", -31, "CVS", "PERSONAL_CARE", "CVS", 57],
    ["tx-8", -180, "GOOGLE WORKSPACE", "TRANSFER_OUT", "Google Workspace", 51],
    ["tx-9", -24, "STARBUCKS", "FOOD_AND_DRINK", "Starbucks", 46],
    ["tx-10", -73, "AMAZON", "SHOPPING", "Amazon", 40],
    ["tx-11", -315, "GUSTO PAYROLL", "TRANSFER_OUT", "Gusto", 33],
    ["tx-12", -48, "WALGREENS", "PERSONAL_CARE", "Walgreens", 28],
  ] as const;

  return base.map(([id, amount, name, primaryCategory, merchant, days]) => ({
    id,
    cash_account_id: businessId,
    provider_transaction_id: `provider-${id}`,
    amount,
    transaction_date: daysAgo(days),
    posted_date: null,
    name,
    primary_category: primaryCategory,
    detailed_category: null,
    user_primary_category: null,
    merchant_name: merchant,
    user_merchant_name: null,
    payment_channel: null,
    pending: false,
    iso_currency_code: "USD",
    excluded_from_budget: false,
    excluded_from_goals: false,
    transaction_kind: "standard",
    reimbursed_at: null,
    reimbursement_memo: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }));
}

function readDemoBankReimbursements(): Record<string, { reimbursed_at: string; reimbursement_memo: string | null }> {
  return readStorageJson<Record<string, { reimbursed_at: string; reimbursement_memo: string | null }>>(
    DEMO_BANK_TX_REIMBURSEMENTS_STORAGE_KEY,
    {}
  );
}

function writeDemoBankReimbursements(
  reimbursements: Record<string, { reimbursed_at: string; reimbursement_memo: string | null }>
): void {
  writeStorageJson(DEMO_BANK_TX_REIMBURSEMENTS_STORAGE_KEY, reimbursements);
}

function currentMonthStartIso(now: Date = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function readDemoBudgets(now: Date = new Date()): Budget[] {
  return readStorageJson<Budget[]>(DEMO_BUDGETS_STORAGE_KEY, [
    {
      id: "demo-budget-001",
      user_id: "demo-user-001",
      name: "April plan",
      month_start: currentMonthStartIso(now),
      notes: "Keep fixed costs tight and protect runway.",
      categories: [
        {
          id: "demo-budget-cat-1",
          budget_id: "demo-budget-001",
          name: "FOOD_AND_DRINK",
          planned_amount: 500,
          category_type: "flexible",
          rollover_enabled: false,
          rollover_amount: 0,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "demo-budget-cat-2",
          budget_id: "demo-budget-001",
          name: "SHOPPING",
          planned_amount: 350,
          category_type: "flexible",
          rollover_enabled: false,
          rollover_amount: 0,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "demo-budget-cat-3",
          budget_id: "demo-budget-001",
          name: "TRANSFER_OUT",
          planned_amount: 1200,
          category_type: "fixed",
          rollover_enabled: false,
          rollover_amount: 0,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ]);
}

function writeDemoBudgets(budgets: Budget[]): void {
  writeStorageJson(DEMO_BUDGETS_STORAGE_KEY, budgets);
}

function readDemoGoals(now: Date = new Date()): Goal[] {
  return readStorageJson<Goal[]>(DEMO_GOALS_STORAGE_KEY, [
    {
      id: "demo-goal-001",
      user_id: "demo-user-001",
      name: "Emergency fund",
      goal_type: "emergency_fund",
      target_amount: 30000,
      current_amount: 18000,
      monthly_contribution: 1500,
      target_date: new Date(now.getFullYear(), now.getMonth() + 8, 1).toISOString().slice(0, 10),
      linked_account_ids: ["demo-bank-business-001"],
      status: "active",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ]);
}

function writeDemoGoals(goals: Goal[]): void {
  writeStorageJson(DEMO_GOALS_STORAGE_KEY, goals);
}

function readDemoRecurring(now: Date = new Date()): RecurringItem[] {
  return readStorageJson<RecurringItem[]>(DEMO_RECURRING_STORAGE_KEY, [
    {
      id: "demo-recurring-001",
      user_id: "demo-user-001",
      name: "Google Workspace",
      merchant_name: "Google Workspace",
      category: "TRANSFER_OUT",
      cadence: "monthly",
      expected_amount: 180,
      amount_tolerance: 27,
      next_due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9).toISOString().slice(0, 10),
      last_seen_at: now.toISOString(),
      confidence: 0.94,
      state: "active",
      metadata_json: { source: "demo" },
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: "demo-recurring-002",
      user_id: "demo-user-001",
      name: "Stripe Atlas",
      merchant_name: "Stripe Atlas",
      category: "TRANSFER_OUT",
      cadence: "quarterly",
      expected_amount: 1200,
      amount_tolerance: 180,
      next_due_date: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().slice(0, 10),
      last_seen_at: now.toISOString(),
      confidence: 0.82,
      state: "review",
      metadata_json: { source: "demo" },
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ]);
}

function writeDemoRecurring(items: RecurringItem[]): void {
  writeStorageJson(DEMO_RECURRING_STORAGE_KEY, items);
}

function readDemoTransactionRules(now: Date = new Date()): TransactionRule[] {
  return readStorageJson<TransactionRule[]>(DEMO_TRANSACTION_RULES_STORAGE_KEY, [
    {
      id: "demo-rule-001",
      user_id: "demo-user-001",
      name: "Stripe always business transfer",
      match_text: "stripe",
      match_mode: "contains",
      merchant_name_override: "Stripe",
      primary_category_override: "TRANSFER_OUT",
      transaction_kind_override: "business",
      exclude_from_budget: false,
      exclude_from_goals: false,
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ]);
}

function writeDemoTransactionRules(rules: TransactionRule[]): void {
  writeStorageJson(DEMO_TRANSACTION_RULES_STORAGE_KEY, rules);
}

function readDemoInbox(now: Date = new Date()): InboxItem[] {
  return readStorageJson<InboxItem[]>(DEMO_INBOX_STORAGE_KEY, [
    {
      id: "demo-inbox-001",
      user_id: "demo-user-001",
      item_type: "review",
      severity: "info",
      title: "2 items need review",
      message: "Confirm recurring charges and categorize stale transactions.",
      due_at: null,
      is_resolved: false,
      action_url: "/dashboard/everyday",
      metadata_json: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ]);
}

function writeDemoInbox(items: InboxItem[]): void {
  writeStorageJson(DEMO_INBOX_STORAGE_KEY, items);
}

function readDemoReview(now: Date = new Date()): ReviewItem[] {
  return readStorageJson<ReviewItem[]>(DEMO_REVIEW_STORAGE_KEY, [
    {
      id: "demo-review-001",
      user_id: "demo-user-001",
      review_type: "recurring",
      title: "Confirm recurring charge: Stripe Atlas",
      message: "We detected a quarterly recurring pattern. Confirm the amount and cadence.",
      status: "open",
      confidence: 0.82,
      source_type: "recurring_item",
      source_id: "demo-recurring-002",
      due_at: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ]);
}

function writeDemoReview(items: ReviewItem[]): void {
  writeStorageJson(DEMO_REVIEW_STORAGE_KEY, items);
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

  async listBudgets(): Promise<Budget[]> {
    await delay(200);
    return readDemoBudgets();
  }

  async createBudget(data: BudgetCreate): Promise<Budget> {
    await delay(250);
    const now = new Date().toISOString();
    const budgets = readDemoBudgets();
    const budget: Budget = {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      name: data.name ?? "Monthly plan",
      month_start: data.month_start,
      notes: data.notes ?? null,
      categories: (data.categories ?? []).map((category) => ({
        id: crypto.randomUUID(),
        budget_id: "",
        name: category.name,
        planned_amount: category.planned_amount,
        category_type: category.category_type ?? "flexible",
        rollover_enabled: category.rollover_enabled ?? false,
        rollover_amount: category.rollover_amount ?? 0,
        created_at: now,
        updated_at: now,
      })),
      created_at: now,
      updated_at: now,
    };
    budget.categories = budget.categories.map((category) => ({ ...category, budget_id: budget.id }));
    writeDemoBudgets([budget, ...budgets]);
    return budget;
  }

  async updateBudget(budgetId: string, data: BudgetUpdate): Promise<Budget> {
    await delay(250);
    const budgets = readDemoBudgets();
    const current = budgets.find((budget) => budget.id === budgetId);
    if (!current) throw new Error("budget-not-found");
    const updated: Budget = {
      ...current,
      ...data,
      categories: data.categories
        ? data.categories.map((category) => ({
            id: crypto.randomUUID(),
            budget_id: budgetId,
            name: category.name,
            planned_amount: category.planned_amount,
            category_type: category.category_type ?? "flexible",
            rollover_enabled: category.rollover_enabled ?? false,
            rollover_amount: category.rollover_amount ?? 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        : current.categories,
      updated_at: new Date().toISOString(),
    };
    writeDemoBudgets(budgets.map((budget) => (budget.id === budgetId ? updated : budget)));
    return updated;
  }

  async deleteBudget(budgetId: string): Promise<{ status: string }> {
    await delay(200);
    writeDemoBudgets(readDemoBudgets().filter((budget) => budget.id !== budgetId));
    return { status: "deleted" };
  }

  async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    await delay(200);
    const budget = readDemoBudgets().find((item) => item.id === budgetId);
    if (!budget) throw new Error("budget-not-found");
    const txs = buildDemoBankTransactions();
    const totals = new Map<string, number>();
    for (const tx of txs) {
      totals.set(tx.primary_category ?? "Uncategorized", (totals.get(tx.primary_category ?? "Uncategorized") ?? 0) + Math.abs(tx.amount));
    }
	    const categories = budget.categories.map((category) => {
	      const actual = totals.get(category.name) ?? 0;
	      const plannedAmount = category.planned_amount ?? 0;
	      const rolloverEnabled = category.rollover_enabled ?? false;
	      const rolloverAmount = category.rollover_amount ?? 0;
	      return {
	        id: category.id,
	        name: category.name,
	        planned_amount: plannedAmount + (rolloverEnabled ? rolloverAmount : 0),
	        actual_amount: actual,
	        remaining_amount: plannedAmount + (rolloverEnabled ? rolloverAmount : 0) - actual,
	        category_type: category.category_type ?? "flexible",
	        rollover_enabled: rolloverEnabled,
	        rollover_amount: rolloverAmount,
	      };
	    });
    const totalPlanned = categories.reduce((sum, category) => sum + category.planned_amount, 0);
    const totalActual = categories.reduce((sum, category) => sum + category.actual_amount, 0);
    return {
      budget_id: budget.id,
      month_start: budget.month_start,
      month_end: budget.month_start,
      total_planned: totalPlanned,
      total_actual: totalActual,
      total_remaining: totalPlanned - totalActual,
      safe_to_spend: Math.max(totalPlanned - totalActual, 0),
      categories,
    };
  }

  async listGoals(): Promise<Goal[]> {
    await delay(200);
    return readDemoGoals();
  }

  async createGoal(data: GoalCreate): Promise<Goal> {
    await delay(250);
    const now = new Date().toISOString();
    const goal: Goal = {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      name: data.name,
      goal_type: data.goal_type ?? "general_savings",
      target_amount: data.target_amount,
      current_amount: data.current_amount ?? 0,
      monthly_contribution: data.monthly_contribution ?? null,
      target_date: data.target_date ?? null,
      linked_account_ids: data.linked_account_ids ?? null,
      status: data.status ?? "active",
      created_at: now,
      updated_at: now,
    };
    writeDemoGoals([goal, ...readDemoGoals()]);
    return goal;
  }

  async updateGoal(goalId: string, data: GoalUpdate): Promise<Goal> {
    await delay(250);
    const goals = readDemoGoals();
    const current = goals.find((goal) => goal.id === goalId);
    if (!current) throw new Error("goal-not-found");
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    writeDemoGoals(goals.map((goal) => (goal.id === goalId ? updated : goal)));
    return updated;
  }

  async deleteGoal(goalId: string): Promise<{ status: string }> {
    await delay(200);
    writeDemoGoals(readDemoGoals().filter((goal) => goal.id !== goalId));
    return { status: "deleted" };
  }

  async listRecurringItems(): Promise<RecurringItem[]> {
    await delay(200);
    return readDemoRecurring();
  }

  async updateRecurringItem(itemId: string, data: RecurringItemUpdate): Promise<RecurringItem> {
    await delay(250);
    const items = readDemoRecurring();
    const current = items.find((item) => item.id === itemId);
    if (!current) throw new Error("recurring-not-found");
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    writeDemoRecurring(items.map((item) => (item.id === itemId ? updated : item)));
    return updated;
  }

  async listTransactionRules(): Promise<TransactionRule[]> {
    await delay(200);
    return readDemoTransactionRules();
  }

  async createTransactionRule(data: TransactionRuleCreate): Promise<TransactionRule> {
    await delay(250);
    const rule: TransactionRule = {
      id: crypto.randomUUID(),
      user_id: "demo-user-001",
      name: data.name,
      match_text: data.match_text,
      match_mode: data.match_mode ?? "contains",
      merchant_name_override: data.merchant_name_override ?? null,
      primary_category_override: data.primary_category_override ?? null,
      transaction_kind_override: data.transaction_kind_override ?? null,
      exclude_from_budget: data.exclude_from_budget ?? false,
      exclude_from_goals: data.exclude_from_goals ?? false,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeDemoTransactionRules([rule, ...readDemoTransactionRules()]);
    return rule;
  }

  async updateTransactionRule(ruleId: string, data: TransactionRuleUpdate): Promise<TransactionRule> {
    await delay(250);
    const rules = readDemoTransactionRules();
    const current = rules.find((rule) => rule.id === ruleId);
    if (!current) throw new Error("rule-not-found");
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    writeDemoTransactionRules(rules.map((rule) => (rule.id === ruleId ? updated : rule)));
    return updated;
  }

  async deleteTransactionRule(ruleId: string): Promise<{ status: string }> {
    await delay(200);
    writeDemoTransactionRules(readDemoTransactionRules().filter((rule) => rule.id !== ruleId));
    return { status: "deleted" };
  }

  async listInboxItems(): Promise<InboxItem[]> {
    await delay(200);
    return readDemoInbox();
  }

  async updateInboxItem(itemId: string, data: { is_resolved: boolean }): Promise<InboxItem> {
    await delay(200);
    const items = readDemoInbox();
    const current = items.find((item) => item.id === itemId);
    if (!current) throw new Error("inbox-item-not-found");
    const updated = { ...current, is_resolved: data.is_resolved, updated_at: new Date().toISOString() };
    writeDemoInbox(items.map((item) => (item.id === itemId ? updated : item)));
    return updated;
  }

  async listReviewItems(): Promise<ReviewItem[]> {
    await delay(200);
    return readDemoReview();
  }

  async updateReviewItem(itemId: string, status: ReviewItemStatus): Promise<ReviewItem> {
    await delay(200);
    const items = readDemoReview();
    const current = items.find((item) => item.id === itemId);
    if (!current) throw new Error("review-item-not-found");
    const updated = { ...current, status, updated_at: new Date().toISOString() };
    writeDemoReview(items.map((item) => (item.id === itemId ? updated : item)));
    return updated;
  }

  async getWeeklyBriefing(): Promise<WeeklyBriefing> {
    await delay(200);
    return {
      period_start: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
      spending_total: 2847,
      net_worth_change: 4200,
      goal_risk_count: 1,
      recurring_review_count: 1,
      headline: "You spent $2,847 in the last 7 days and gained $4,200 in net worth.",
    };
  }

  async getConsumerHome(_monthStart?: string): Promise<ConsumerHome> {
    await delay(250);
    const budgets = readDemoBudgets();
    const budgetSummary = budgets[0] ? await this.getBudgetSummary(budgets[0].id) : null;
    const goals = readDemoGoals().map((goal) => ({
      id: goal.id,
      name: goal.name,
      goal_type: goal.goal_type,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      progress_percent: goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 1000) / 10 : 0,
      monthly_contribution: goal.monthly_contribution,
      target_date: goal.target_date,
      required_monthly_contribution: goal.monthly_contribution,
      status: goal.status,
    }));
    return {
      budget_summary: budgetSummary,
      goals,
      recurring_items: readDemoRecurring(),
      inbox_items: readDemoInbox(),
      review_items: readDemoReview(),
      weekly_briefing: await this.getWeeklyBriefing(),
    };
  }

  // === Financial Memory ===

  async getFinancialMemory(): Promise<FinancialMemory> {
    await delay(300);
    return readDemoMemory();
  }

  async updateFinancialMemory(data: FinancialMemoryUpdate): Promise<FinancialMemory> {
    await delay(500);
    const current = await this.getFinancialMemory();
    const next = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    } as FinancialMemory;
    writeDemoMemory(next);
    return next;
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

  async getBriefingNarrative(): Promise<NarrativeResponse> {
    await delay(1200);
    return {
      text: "Your organic savings rate remains strong at 18%, putting you right on track for your runway goals. However, your Cash Drag is increasing. Consider moving $12,000 from Chase Checking to your Wealthfront HYSA to capture an additional $540 in risk-free yield this year.",
      provider: "openrouter",
      model: "claude-3-5-sonnet-20241022"
    };
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
    return buildDemoBankAccounts();
  }

  async getBankTransactions(_query: BankTransactionQuery): Promise<PaginatedBankTransactions> {
    await delay(300);
    const reimbursements = readDemoBankReimbursements();
    const filtered = buildDemoBankTransactions()
      .map((transaction) => {
        const reimbursement = reimbursements[transaction.id];
        if (!reimbursement) return transaction;
        return {
          ...transaction,
          reimbursed_at: reimbursement.reimbursed_at,
          reimbursement_memo: reimbursement.reimbursement_memo,
          updated_at: reimbursement.reimbursed_at,
        };
      })
      .filter((transaction) => {
        const afterStart = _query.start_date
          ? transaction.transaction_date >= _query.start_date
          : true;
        const beforeEnd = _query.end_date
          ? transaction.transaction_date <= _query.end_date
          : true;
        return afterStart && beforeEnd;
      })
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

    const page = _query.page ?? 1;
    const pageSize = _query.page_size ?? 20;
    const start = (page - 1) * pageSize;
    const transactions = filtered.slice(start, start + pageSize);

    return {
      transactions,
      total: filtered.length,
      page,
      page_size: pageSize,
      total_pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
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
    const reimbursements = readDemoBankReimbursements();
    if (_data.reimbursed) {
      reimbursements[_id] = {
        reimbursed_at: new Date().toISOString(),
        reimbursement_memo: _data.memo ?? null,
      };
    } else if (_data.reimbursed === false) {
      delete reimbursements[_id];
    }
    writeDemoBankReimbursements(reimbursements);

    const updated = buildDemoBankTransactions().find((transaction) => transaction.id === _id);
    if (!updated) {
      throw new Error("bank-transaction-not-found");
    }
    const reimbursement = reimbursements[_id];
    return {
      ...updated,
      user_primary_category: _data.primary_category ?? updated.user_primary_category,
      user_merchant_name: _data.merchant_name ?? updated.user_merchant_name,
      excluded_from_budget: _data.exclude_from_budget ?? updated.excluded_from_budget,
      excluded_from_goals: _data.exclude_from_goals ?? updated.excluded_from_goals,
      transaction_kind: _data.transaction_kind ?? updated.transaction_kind,
      reimbursed_at: reimbursement?.reimbursed_at ?? null,
      reimbursement_memo: reimbursement?.reimbursement_memo ?? null,
      updated_at: reimbursement?.reimbursed_at ?? updated.updated_at,
    };
  }

  // === Share Reports ===

  async createShareReport(_request: ShareReportCreateRequest): Promise<ShareReportCreateResponse> {
    await delay(500);
    const now = new Date();
    const expiresAt =
      typeof _request.expires_in_days === "number"
        ? new Date(now.getTime() + _request.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;
    const report: DemoShareReportRecord = {
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      tool_id: _request.tool_id,
      mode: _request.mode,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      last_viewed_at: null,
      max_views: _request.max_views ?? null,
      view_count: 0,
      revoked_at: null,
      payload: _request.payload,
    };
    writeDemoShareReports([report, ...readDemoShareReports()].slice(0, 25));
    return {
      id: report.id,
      token: report.token,
      tool_id: report.tool_id,
      mode: report.mode,
      created_at: report.created_at,
      expires_at: report.expires_at,
      max_views: report.max_views,
    };
  }

  async getShareReport(reportId: string, _token: string): Promise<ShareReportPublicResponse> {
    await delay(500);
    const reports = readDemoShareReports();
    const idx = reports.findIndex((report) => report.id === reportId && report.token === _token);
    if (idx === -1) {
      throw new Error("share-report-not-found");
    }

    const report = reports[idx];
    const now = Date.now();
    const isExpired = report.expires_at ? new Date(report.expires_at).getTime() <= now : false;
    const maxViewsReached =
      typeof report.max_views === "number" && report.view_count >= report.max_views;

    if (report.revoked_at || isExpired || maxViewsReached) {
      throw new Error("share-report-not-found");
    }

    const viewedAt = new Date().toISOString();
    const updated = {
      ...report,
      view_count: report.view_count + 1,
      last_viewed_at: viewedAt,
    };
    reports[idx] = updated;
    writeDemoShareReports(reports);

    return {
      id: updated.id,
      tool_id: updated.tool_id,
      mode: updated.mode,
      payload: updated.payload,
      created_at: updated.created_at,
      expires_at: updated.expires_at,
      last_viewed_at: updated.last_viewed_at,
      max_views: updated.max_views,
      view_count: updated.view_count,
    } as ShareReportPublicResponse;
  }

  async listShareReports(params?: { toolId?: string; limit?: number; includePayload?: boolean }): Promise<ShareReportListItem[]> {
    await delay(300);
    const reports = readDemoShareReports()
      .filter((report) => (params?.toolId ? report.tool_id === params.toolId : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const limited = typeof params?.limit === "number" ? reports.slice(0, params.limit) : reports;
    return limited.map(({ token, payload, ...report }) =>
      params?.includePayload ? ({ ...report, payload } as ShareReportListItem) : report
    );
  }

  async rotateShareReport(reportId: string, params?: { expiresInDays?: number | null }): Promise<ShareReportCreateResponse> {
    await delay(300);
    const reports = readDemoShareReports();
    const idx = reports.findIndex((report) => report.id === reportId);
    if (idx === -1) throw new Error("share-report-not-found");

    const current = reports[idx];
    const expiresAt =
      typeof params?.expiresInDays === "number"
        ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : current.expires_at;
    const updated = {
      ...current,
      token: crypto.randomUUID(),
      expires_at: expiresAt,
      view_count: 0,
    };
    reports[idx] = updated;
    writeDemoShareReports(reports);

    return {
      id: updated.id,
      token: updated.token,
      tool_id: updated.tool_id,
      mode: updated.mode,
      created_at: updated.created_at,
      expires_at: updated.expires_at,
      max_views: updated.max_views,
    };
  }

  async revokeShareReport(_id: string): Promise<{ status: string }> {
    await delay(300);
    const reports = readDemoShareReports();
    const idx = reports.findIndex((report) => report.id === _id);
    if (idx !== -1) {
      reports[idx] = { ...reports[idx], revoked_at: new Date().toISOString() };
      writeDemoShareReports(reports);
    }
    return { status: "success" };
  }

  // === Tax Plan Workspace ===

  async createTaxPlan(_data: TaxPlanCreateRequest): Promise<TaxPlan> {
    await delay(300);
    const now = new Date().toISOString();
    const plan: TaxPlan = {
      id: crypto.randomUUID(),
      user_id: "u1",
      name: _data.name,
      household_name: _data.household_name ?? null,
      status: "draft",
      approved_version_id: null,
      created_at: now,
      updated_at: now,
    };
    writeDemoTaxPlans([plan, ...readDemoTaxPlans()]);
    return plan;
  }

  async listTaxPlans(params?: { limit?: number }): Promise<TaxPlan[]> {
    await delay(300);
    const plans = readDemoTaxPlans().sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    return typeof params?.limit === "number" ? plans.slice(0, params.limit) : plans;
  }

  async getTaxPlan(_id: string): Promise<TaxPlan> {
    await delay(300);
    const plan = readDemoTaxPlans().find((item) => item.id === _id);
    if (!plan) throw new Error("tax-plan-not-found");
    return plan;
  }

  async updateTaxPlan(_id: string, _data: TaxPlanUpdateRequest): Promise<TaxPlan> {
    await delay(300);
    const plans = readDemoTaxPlans();
    const idx = plans.findIndex((plan) => plan.id === _id);
    if (idx === -1) throw new Error("tax-plan-not-found");
    const updated = {
      ...plans[idx],
      ..._data,
      updated_at: new Date().toISOString(),
    };
    plans[idx] = updated;
    writeDemoTaxPlans(plans);
    return updated;
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
    const now = new Date().toISOString();
    const documentType = inferDemoTaxDocumentType(_filename, _typeHint);
    const mimeType =
      _file instanceof File && typeof _file.type === "string" && _file.type.length > 0
        ? _file.type
        : "application/octet-stream";
    const fileSize =
      typeof (_file as Blob).size === "number" ? (_file as Blob).size : 0;
    const document: TaxDocumentResponse = {
      id: crypto.randomUUID(),
      user_id: "u1",
      original_filename: _filename,
      mime_type: mimeType,
      file_size_bytes: fileSize,
      document_type: documentType,
      tax_year: 2025,
      status: "completed",
      provider_used: "demo",
      extracted_data: buildDemoExtractedData(documentType),
      confidence_score: 0.92,
      validation_errors: null,
      error_message: null,
      created_at: now,
      updated_at: now,
    };
    writeDemoTaxDocuments([document, ...readDemoTaxDocuments()]);
    return document;
  }

  async listTaxDocuments(limit?: number): Promise<TaxDocumentListResponse[]> {
    await delay(300);
    const documents = readDemoTaxDocuments().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return typeof limit === "number" ? documents.slice(0, limit) : documents;
  }

  async getTaxDocument(_id: string): Promise<TaxDocumentResponse> {
    await delay(300);
    const document = readDemoTaxDocuments().find((item) => item.id === _id);
    if (!document) throw new Error("tax-document-not-found");
    return document;
  }

  async deleteTaxDocument(_id: string): Promise<void> {
    await delay(300);
    writeDemoTaxDocuments(readDemoTaxDocuments().filter((document) => document.id !== _id));
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

  async uploadPublicAuditDocument(
    _file: File | Blob,
    _filename: string
  ): Promise<{ session_id: string; message: string }> {
    void _file;
    void _filename;
    await delay(300);
    return {
      session_id: "demo-public-audit-session",
      message: "Demo audit started",
    };
  }

  async getPublicAuditStatus(_sessionId: string): Promise<{
    session_id: string;
    status: "pending" | "processing" | "success" | "error";
    progress: number;
    error_message?: string;
    trace_payload?: DecisionTrace["trace_payload"];
  }> {
    void _sessionId;
    await delay(600);
    return {
      session_id: "demo-public-audit-session",
      status: "success",
      progress: 100,
      trace_payload: {
        trace_version: "v2",
        trace_kind: "public_tax_audit",
        title: "Demo Tax Shield Audit",
        summary: "We identified $2,100 in potential missing tax shields.",
        recommendation_status: "actionable",
        rules_applied: [
          {
            name: "Home Office Deduction",
            passed: false,
            value: 0,
            threshold: 2100,
            message: "Based on your income level, you may qualify for a home office deduction.",
          },
        ],
        insights: [],
        assumptions: [],
        confidence_score: 0.92,
        confidence_factors: [],
        determinism_class: "deterministic",
        source_tier: "demo",
        continuity_status: "healthy",
        recommendation_readiness: "ready",
        coverage_status: "full",
        policy_version: "context-policy-v1",
        freshness: {
          is_fresh: true,
          age_hours: null,
          max_age_hours: 24,
          last_sync: null,
          warning: null,
        },
        context_quality: {
          continuity_status: "healthy",
          recommendation_readiness: "ready",
          confidence_score: 0.92,
          freshness: {
            is_fresh: true,
            age_hours: null,
            max_age_hours: 24,
            last_sync: null,
            warning: null,
          },
          coverage_ratio: 1,
          active_connection_count: 0,
          total_connection_count: 0,
          stale_connection_count: 0,
          errored_connection_count: 0,
          warnings: [],
          confidence_factors: [],
        },
        warnings: [],
        remediation_actions: [],
        correction_targets: [],
        review_summary: null,
        deterministic: {
          total_impact: 2100,
          wages_detected: 120000,
          withholding_detected: 18000,
        },
      },
    };
  }

  async runPublicManualAudit(_data: Record<string, any>): Promise<{
    session_id: string;
    status: "success";
    progress: number;
  }> {
    void _data;
    await delay(300);
    return {
      session_id: "demo-public-manual-audit-session",
      status: "success",
      progress: 100,
    };
  }
}
