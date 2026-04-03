import { beforeEach, describe, expect, test, vi } from "vitest";

const { captureSpy, optOutSpy } = vi.hoisted(() => {
  return {
    captureSpy: vi.fn(),
    optOutSpy: vi.fn(() => false),
  };
});

vi.mock("@/lib/posthog", () => {
  return {
    POSTHOG_KEY: "ph_test_key",
    posthog: {
      capture: captureSpy,
      has_opted_out_capturing: optOutSpy,
    },
  };
});

import {
  captureAnalyticsEvent,
  normalizeFounderFunnelSource,
  readFounderFunnelSource,
  rememberFounderFunnelSource,
} from "./analytics";

describe("analytics helpers", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    captureSpy.mockClear();
    optOutSpy.mockReset();
    optOutSpy.mockReturnValue(false);
  });

  test("normalizes founder funnel sources before persisting", () => {
    expect(normalizeFounderFunnelSource(" Hero Founder Beta ")).toBe(
      "hero_founder_beta"
    );

    rememberFounderFunnelSource(" Founder Beta / Nav ");

    expect(readFounderFunnelSource()).toBe("founder_beta_nav");
  });

  test("captures analytics when posthog is enabled and opted in", () => {
    captureAnalyticsEvent("founder_manual_context_opened", {
      source: "hero_founder_beta",
      stage: "preview_mode",
      entry_point: "priority_card",
    });

    expect(captureSpy).toHaveBeenCalledWith("founder_manual_context_opened", {
      source: "hero_founder_beta",
      stage: "preview_mode",
      entry_point: "priority_card",
    });
  });

  test("skips capture when the user has opted out", () => {
    optOutSpy.mockReturnValue(true);

    captureAnalyticsEvent("founder_manual_context_opened", {
      source: "hero_founder_beta",
    });

    expect(captureSpy).not.toHaveBeenCalled();
  });
});
