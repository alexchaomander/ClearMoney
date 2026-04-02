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

export interface FounderPriorityState {
  stage: FounderPriorityStage;
  eyebrow: string;
  title: string;
  summary: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  penaltyTitle?: string;
  penalties?: string[];
  unlockTitle?: string;
  unlocks?: string[];
  allowManualFallback?: boolean;
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
    };
  }

  if (!hasAccounts) {
    return {
      stage: "no_accounts",
      eyebrow: "Next best move",
      title: "Connect one source so your founder plan stops guessing.",
      summary:
        "Right now the dashboard can preview the shape of your plan, but linked accounts are what tighten runway, liquidity, and tax pressure.",
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
    };
  }

  if (usingDemoData) {
    return {
      stage: "preview_mode",
      eyebrow: "Preview mode",
      title: "You still need one real source before this becomes a founder control room.",
      summary:
        "Manual context helps, but live balances are what make runway, tax timing, and concentration guidance decision-grade.",
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
    };
  }

  if (connectionTone === "error") {
    return {
      stage: "connection_error",
      eyebrow: "Action required",
      title: "A revoked connection is weakening your founder view.",
      summary:
        "Re-authenticate the broken source before trusting new recommendations or historical drift signals.",
      primaryHref: "/connect",
      primaryLabel: "Repair connection",
      secondaryHref: "/data-health",
      secondaryLabel: "Open data health",
      penaltyTitle: "Current risk",
      penalties: [
        "A broken source can silently hollow out runway and tax signals.",
        "Recent drift may be missing even if the dashboard still renders.",
      ],
    };
  }

  if (connectionTone === "partial" || connectionTone === "warning") {
    return {
      stage: "connection_warning",
      eyebrow: "Trust signal",
      title: "Your dashboard is useful, but part of the picture is aging.",
      summary:
        "ClearMoney can still help, but stale or degraded sources should be fixed before you act on fine-grained tax or allocation guidance.",
      primaryHref: "/data-health",
      primaryLabel: "Review freshness",
      secondaryHref: "/connect",
      secondaryLabel: "Manage links",
      penaltyTitle: "Where confidence is leaking",
      penalties: [
        "Stale balances weaken confidence in short-horizon founder decisions.",
        "Degraded links can make concentration and tax timing look cleaner than they are.",
      ],
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
      primaryHref: "/advisor",
      primaryLabel: "Generate guidance",
      secondaryHref: "/dashboard/founder-operating-room",
      secondaryLabel: "Open operating room",
      unlockTitle: "What happens next",
      unlocks: [
        "Your first recommendation gets a trace you can inspect before acting.",
        "The dashboard shifts from context surface to decision surface.",
      ],
    };
  }

  return {
    stage: "ready",
    eyebrow: "Founder baseline",
    title: "Your founder data surface is live and ready for decisions.",
    summary:
      "Use the cards below to inspect your current pressure points, then open the trace behind any recommendation that matters.",
    primaryHref: "/dashboard/recommendation-reviews",
    primaryLabel: "Review active guidance",
    secondaryHref: "/data-health",
    secondaryLabel: "Open data health",
  };
}
