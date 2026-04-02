import { describe, expect, test } from "vitest";

import {
  classifyFounderConnectContinuePath,
  getFounderPriorityState,
  shouldTrackInviteCodeStarted,
} from "./founder-activation";

describe("founder activation helpers", () => {
  test("tracks invite-code start on first non-empty input", () => {
    expect(shouldTrackInviteCodeStarted("", false)).toBe(false);
    expect(shouldTrackInviteCodeStarted("A", false)).toBe(true);
    expect(shouldTrackInviteCodeStarted("CLEARMONEY2026", false)).toBe(true);
    expect(shouldTrackInviteCodeStarted("A", true)).toBe(false);
  });

  test("classifies connect continuation only after account state resolves", () => {
    expect(classifyFounderConnectContinuePath(true, 2)).toBeNull();
    expect(classifyFounderConnectContinuePath(false, 2)).toBe("linked_accounts");
    expect(classifyFounderConnectContinuePath(false, 0)).toBe("manual_fallback");
  });

  test("prioritizes live-source upgrade when dashboard is still in preview mode", () => {
    const state = getFounderPriorityState({
      usingDemoData: true,
      hasAccounts: true,
      hasFounderBaseline: true,
      hasDecisionTraces: false,
      connectionTone: "warning",
    });

    expect(state.stage).toBe("preview_mode");
    expect(state.primaryHref).toBe("/connect");
    expect(state.penalties).toContain(
      "Any recommendation should be treated as provisional until one source is live."
    );
    expect(state.allowManualFallback).toBe(true);
  });

  test("promotes trace generation once the founder surface is live", () => {
    const state = getFounderPriorityState({
      usingDemoData: false,
      hasAccounts: true,
      hasFounderBaseline: true,
      hasDecisionTraces: false,
      connectionTone: "live",
    });

    expect(state.stage).toBe("missing_traces");
    expect(state.primaryHref).toBe("/advisor");
  });
});
