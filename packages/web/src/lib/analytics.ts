"use client";

import { POSTHOG_KEY, posthog } from "@/lib/posthog";

const FOUNDER_FUNNEL_SOURCE_KEY = "cm_founder_funnel_source";

type AnalyticsProperty = string | number | boolean | null | undefined;

export function captureAnalyticsEvent(
  event: string,
  properties: Record<string, AnalyticsProperty> = {}
) {
  if (typeof window === "undefined" || !POSTHOG_KEY) {
    return;
  }

  if (typeof posthog.has_opted_out_capturing === "function" && posthog.has_opted_out_capturing()) {
    return;
  }

  posthog.capture(event, properties);
}

export function rememberFounderFunnelSource(source: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(FOUNDER_FUNNEL_SOURCE_KEY, source);
}

export function readFounderFunnelSource(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(FOUNDER_FUNNEL_SOURCE_KEY);
}
