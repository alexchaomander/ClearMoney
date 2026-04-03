import { describe, expect, test } from "vitest";

import {
  classifyFounderConnectContinuePath,
  getFounderManualOptions,
  getFounderPriorityState,
  shouldTrackFounderDashboardUpgrade,
  shouldTrackFounderManualContext,
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
    expect(state.manualCategory).toBe("cash");
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

  test("chooses a founder-oriented manual option order by stage", () => {
    const warningOptions = getFounderManualOptions("connection_warning");
    const previewOptions = getFounderManualOptions("preview_mode");

    expect(warningOptions[0]?.category).toBe("investment");
    expect(warningOptions[0]?.recommended).toBe(true);
    expect(previewOptions[0]?.category).toBe("cash");
    expect(previewOptions[0]?.recommended).toBe(true);
  });

  test("tracks dashboard upgrade clicks only for the primary CTA on non-ready states", () => {
    expect(shouldTrackFounderDashboardUpgrade("preview_mode", "primary")).toBe(
      true
    );
    expect(
      shouldTrackFounderDashboardUpgrade("preview_mode", "secondary")
    ).toBe(false);
    expect(
      shouldTrackFounderDashboardUpgrade("preview_mode", "manual_fallback")
    ).toBe(false);
    expect(shouldTrackFounderDashboardUpgrade("ready", "primary")).toBe(false);
  });

  test("tracks founder manual context only for non-ready states", () => {
    expect(shouldTrackFounderManualContext("preview_mode")).toBe(true);
    expect(shouldTrackFounderManualContext("missing_traces")).toBe(true);
    expect(shouldTrackFounderManualContext("ready")).toBe(false);
  });
});
