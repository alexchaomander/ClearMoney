export type FounderConnectContinuePath = "linked_accounts" | "manual_fallback";
export type FounderConnectionTone =
  | "live"
  | "partial"
  | "warning"
  | "missing"
  | "error";

export type FounderPriorityStage =
  | "baseline_gap"
  | "no_accounts"
  | "preview_mode"
  | "connection_error"
  | "connection_warning"
  | "missing_traces"
  | "ready";

export type FounderPriorityCta = "primary" | "secondary" | "manual_fallback";
export type FounderManualEntryPoint = "priority_card" | "dashboard_menu";
export type FounderManualCategory = "cash" | "debt" | "investment" | "equity";
export type FounderManualModalTab =
  | FounderManualCategory
  | "crypto"
  | "real_estate"
  | "vehicle"
  | "collectible"
  | "metal"
  | "alternative";

export interface FounderPriorityState {
  stage: FounderPriorityStage;
  eyebrow: string;
  title: string;
  summary: string;
  whyNowTitle?: string;
  whyNow?: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  penaltyTitle?: string;
  penalties?: string[];
  unlockTitle?: string;
  unlocks?: string[];
  allowManualFallback?: boolean;
  manualCategory: FounderManualCategory;
}

export interface FounderManualOption {
  category: FounderManualCategory;
  label: string;
  title: string;
  description: string;
  detail: string;
  defaultTab: FounderManualCategory;
  recommended: boolean;
}

interface FounderPriorityInput {
  usingDemoData: boolean;
  hasAccounts: boolean;
  hasFounderBaseline: boolean;
  hasDecisionTraces: boolean;
  connectionTone: FounderConnectionTone;
}

export function shouldTrackInviteCodeStarted(
  nextValue: string,
  hasTracked: boolean
): boolean {
  return !hasTracked && nextValue.trim().length > 0;
}

export function classifyFounderConnectContinuePath(
  accountsLoading: boolean,
  totalConnected: number
): FounderConnectContinuePath | null {
  if (accountsLoading) {
    return null;
  }

  return totalConnected > 0 ? "linked_accounts" : "manual_fallback";
}

export function countFounderConnectedSources(accountGroups?: {
  cash_accounts?: unknown[];
  debt_accounts?: unknown[];
  investment_accounts?: unknown[];
} | null): number {
  if (!accountGroups) {
    return 0;
  }

  return (
    (accountGroups.cash_accounts?.length ?? 0) +
    (accountGroups.debt_accounts?.length ?? 0) +
    (accountGroups.investment_accounts?.length ?? 0)
  );
}

export function getFounderPriorityState({
  usingDemoData,
  hasAccounts,
  hasFounderBaseline,
  hasDecisionTraces,
  connectionTone,
}: FounderPriorityInput): FounderPriorityState {
  if (!hasFounderBaseline) {
    return {
      stage: "baseline_gap",
      eyebrow: "Baseline gap",
      title:
        "Finish your founder baseline before the dashboard starts inferring too much.",
      summary:
        "Entity type, income, and monthly burn are the minimum inputs behind trustworthy runway and tax pressure guidance.",
      whyNowTitle: "Why this matters now",
      whyNow: [
        "Without founder baseline inputs, runway and tax pressure stay anchored to weak assumptions.",
        "Manual accounts help, but they still cannot fully tighten founder recommendations until the baseline is complete.",
      ],
      primaryHref: "/settings?tab=profile",
      primaryLabel: "Complete profile",
      secondaryHref: "/tools/founder-runway",
      secondaryLabel: "Open founder runway",
      penaltyTitle: "Blocked until the baseline is complete",
      penalties: [
        "Runway confidence stays weak because income and burn assumptions are incomplete.",
        "Founder-specific tax pressure cannot tighten without entity and cash context.",
      ],
      unlockTitle: "Complete this and you unlock",
      unlocks: [
        "A founder baseline the dashboard can defend in plain English.",
        "A cleaner handoff into account linking and auditable recommendations.",
      ],
      allowManualFallback: true,
      manualCategory: "cash",
    };
  }

  if (!hasAccounts) {
    return {
      stage: "no_accounts",
      eyebrow: "Next best move",
      title: "Connect one source so your founder plan stops guessing.",
      summary:
        "Right now the dashboard can preview the shape of your plan, but linked accounts are what tighten runway, liquidity, and tax pressure.",
      whyNowTitle: "What still works today",
      whyNow: [
        "Manual cash, debt, and founder context can orient you right away.",
        "Live sources are still required before runway, liquidity, and tax timing become decision-grade.",
      ],
      primaryHref: "/connect",
      primaryLabel: "Connect accounts",
      secondaryHref: "/data-health",
      secondaryLabel: "See what is missing",
      penaltyTitle: "Still estimated from fallback context",
      penalties: [
        "Runway is using preview balances instead of your actual operating cash.",
        "Tax pressure misses real account timing, transfers, and cash mix.",
        "Recommendations can explain their logic, but not your latest balance reality.",
      ],
      unlockTitle: "One live source unlocks immediately",
      unlocks: [
        "A tighter founder runway signal with less synthetic padding.",
        "More credible decision traces because the cited inputs are fresher.",
      ],
      allowManualFallback: true,
      manualCategory: "cash",
    };
  }

  if (usingDemoData) {
    return {
      stage: "preview_mode",
      eyebrow: "Preview mode",
      title:
        "You still need one real source before this becomes a founder control room.",
      summary:
        "Manual context helps, but live balances are what make runway, tax timing, and concentration guidance decision-grade.",
      whyNowTitle: "What preview mode means",
      whyNow: [
        "The dashboard can orient you with manual context and synthetic fixtures.",
        "You should treat recommendations as provisional until at least one real source is live.",
      ],
      primaryHref: "/connect",
      primaryLabel: "Connect real sources",
      secondaryHref: "/data-health",
      secondaryLabel: "See what is missing",
      penaltyTitle: "Still estimated from synthetic or manual context",
      penalties: [
        "The dashboard can orient you, but not validate founder liquidity with current balances.",
        "Tax and concentration views stay useful for planning, not for precise action.",
        "Any recommendation should be treated as provisional until one source is live.",
      ],
      unlockTitle: "Upgrade path",
      unlocks: [
        "Replace preview balances with current linked balances.",
        "Turn founder runway and tax pressure from orientation into operating signals.",
      ],
      allowManualFallback: true,
      manualCategory: "cash",
    };
  }

  if (connectionTone === "error") {
    return {
      stage: "connection_error",
      eyebrow: "Action required",
      title: "A revoked connection is weakening your founder view.",
      summary:
        "Re-authenticate the broken source before trusting new recommendations or historical drift signals.",
      whyNowTitle: "What is leaking trust",
      whyNow: [
        "The dashboard may still render, but a broken source can silently hollow out runway and tax signals.",
        "Manual context can bridge the gap temporarily, but recent drift is still at risk of missing reality.",
      ],
      primaryHref: "/connect",
      primaryLabel: "Repair connection",
      secondaryHref: "/data-health",
      secondaryLabel: "Open data health",
      penaltyTitle: "Current risk",
      penalties: [
        "A broken source can silently hollow out runway and tax signals.",
        "Recent drift may be missing even if the dashboard still renders.",
      ],
      allowManualFallback: true,
      manualCategory: "cash",
    };
  }

  if (connectionTone === "partial" || connectionTone === "warning") {
    return {
      stage: "connection_warning",
      eyebrow: "Trust signal",
      title: "Your dashboard is useful, but part of the picture is aging.",
      summary:
        "ClearMoney can still help, but stale or degraded sources should be fixed before you act on fine-grained tax or allocation guidance.",
      whyNowTitle: "What is still provisional",
      whyNow: [
        "Short-horizon founder decisions can drift if stale balances are standing in for fresh account data.",
        "Manual context fills narrative gaps, but it does not restore missing sync freshness.",
      ],
      primaryHref: "/data-health",
      primaryLabel: "Review freshness",
      secondaryHref: "/connect",
      secondaryLabel: "Manage links",
      penaltyTitle: "Where confidence is leaking",
      penalties: [
        "Stale balances weaken confidence in short-horizon founder decisions.",
        "Degraded links can make concentration and tax timing look cleaner than they are.",
      ],
      allowManualFallback: true,
      manualCategory: "investment",
    };
  }

  if (!hasDecisionTraces) {
    return {
      stage: "missing_traces",
      eyebrow: "Generate first value",
      title:
        "You have enough context. Now generate the first recommendation you can inspect.",
      summary:
        "Open the advisor or founder operating room to create an auditable recommendation, then review the trace before you act.",
      whyNowTitle: "What changes next",
      whyNow: [
        "Your data surface is live enough to produce a decision trace you can inspect.",
        "The next bottleneck is not data capture anymore. It is turning context into one auditable recommendation.",
      ],
      primaryHref: "/advisor",
      primaryLabel: "Generate guidance",
      secondaryHref: "/dashboard/founder-operating-room",
      secondaryLabel: "Open operating room",
      unlockTitle: "What happens next",
      unlocks: [
        "Your first recommendation gets a trace you can inspect before acting.",
        "The dashboard shifts from context surface to decision surface.",
      ],
      manualCategory: "equity",
    };
  }

  return {
    stage: "ready",
    eyebrow: "Founder baseline",
    title: "Your founder data surface is live and ready for decisions.",
    summary:
      "Use the cards below to inspect your current pressure points, then open the trace behind any recommendation that matters.",
    whyNowTitle: "Why this is decision-grade",
    whyNow: [
      "Live data is connected, founder baseline inputs are in place, and the surface is ready for trace-backed guidance.",
    ],
    primaryHref: "/dashboard/recommendation-reviews",
    primaryLabel: "Review active guidance",
    secondaryHref: "/data-health",
    secondaryLabel: "Open data health",
    manualCategory: "cash",
  };
}

export function shouldTrackFounderDashboardUpgrade(
  stage: FounderPriorityStage,
  cta: FounderPriorityCta
): boolean {
  return cta === "primary" && stage !== "ready";
}

export function shouldTrackFounderManualContext(
  stage: FounderPriorityStage
): boolean {
  return stage !== "ready";
}

export function getFounderManualOptions(
  stage: FounderPriorityStage
): FounderManualOption[] {
  const recommended = getFounderRecommendedManualCategory(stage);

  const options: FounderManualOption[] = [
    {
      category: "cash",
      label: "Cash runway",
      title: "Add operating cash and reserves",
      description:
        "Capture the balances that tighten founder runway and liquidity pressure first.",
      detail:
        "Best for preview mode, missing accounts, or failed connections when you still need a useful founder dashboard today.",
      defaultTab: "cash",
      recommended: recommended === "cash",
    },
    {
      category: "debt",
      label: "Debt pressure",
      title: "Add debt and fixed obligations",
      description:
        "Record liabilities so the dashboard can frame burn, tax pressure, and downside posture more honestly.",
      detail:
        "Best when credit cards, loans, or business obligations are distorting the founder picture.",
      defaultTab: "debt",
      recommended: recommended === "debt",
    },
    {
      category: "investment",
      label: "Accounts and holdings",
      title: "Add investment or treasury context",
      description:
        "Capture brokerage or treasury balances when connect is not available yet.",
      detail:
        "Best when you need concentration or liquidity context before a live sync is restored.",
      defaultTab: "investment",
      recommended: recommended === "investment",
    },
    {
      category: "equity",
      label: "Founder equity",
      title: "Add founder equity and company exposure",
      description:
        "Record founder stock, SAFEs, notes, or option grants that shape your real founder balance sheet.",
      detail:
        "Best when founder upside, dilution, or company concentration is missing from the current picture.",
      defaultTab: "equity",
      recommended: recommended === "equity",
    },
  ];

  return options.sort((a, b) => Number(b.recommended) - Number(a.recommended));
}

export function getFounderRecommendedManualCategory(
  stage: FounderPriorityStage
): FounderManualCategory {
  switch (stage) {
    case "connection_warning":
      return "investment";
    case "missing_traces":
      return "equity";
    case "baseline_gap":
    case "no_accounts":
    case "preview_mode":
    case "connection_error":
    case "ready":
    default:
      return "cash";
  }
}
