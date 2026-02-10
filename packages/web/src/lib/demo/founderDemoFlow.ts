"use client";

export type FounderDemoStep =
  | "preset_applied"
  | "snapshot_saved"
  | "report_opened"
  | "one_time_link_created"
  | "calendar_downloaded"
  | "reimbursement_marked";

export type FounderDemoFlowState = {
  version: 1;
  updatedAt: string;
  steps: Record<FounderDemoStep, boolean>;
};

export const FOUNDER_DEMO_FLOW_STORAGE_KEY = "clearmoney-demo-founder-flow.v1";

function blankState(now: Date): FounderDemoFlowState {
  return {
    version: 1,
    updatedAt: now.toISOString(),
    steps: {
      preset_applied: false,
      snapshot_saved: false,
      report_opened: false,
      one_time_link_created: false,
      calendar_downloaded: false,
      reimbursement_marked: false,
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readFounderDemoFlowState(now: Date = new Date()): FounderDemoFlowState {
  if (typeof window === "undefined") return blankState(now);
  try {
    const raw = window.localStorage.getItem(FOUNDER_DEMO_FLOW_STORAGE_KEY);
    if (!raw) return blankState(now);
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) return blankState(now);
    if (parsed["version"] !== 1) return blankState(now);
    const steps = parsed["steps"];
    if (!isPlainObject(steps)) return blankState(now);

    const state = blankState(now);
    for (const key of Object.keys(state.steps) as FounderDemoStep[]) {
      state.steps[key] = steps[key] === true;
    }
    state.updatedAt = typeof parsed["updatedAt"] === "string" ? String(parsed["updatedAt"]) : state.updatedAt;
    return state;
  } catch {
    return blankState(now);
  }
}

export function writeFounderDemoFlowState(state: FounderDemoFlowState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FOUNDER_DEMO_FLOW_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function markFounderDemoStep(step: FounderDemoStep, now: Date = new Date()): void {
  const state = readFounderDemoFlowState(now);
  if (state.steps[step]) return;
  state.steps[step] = true;
  state.updatedAt = now.toISOString();
  writeFounderDemoFlowState(state);
}

export function resetFounderDemoFlow(now: Date = new Date()): void {
  writeFounderDemoFlowState(blankState(now));
}

