"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { posthog, POSTHOG_KEY, initPostHog } from "@/lib/posthog";
import { useAnalyticsConsent } from "./AnalyticsConsentBanner";

export function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { consent } = useAnalyticsConsent();

  // Initialize PostHog only when consent is granted
  useEffect(() => {
    if (consent === "granted") {
      initPostHog();
    } else if (consent === "denied") {
      posthog.opt_out_capturing();
    }
  }, [consent]);

  // Track page views on route change
  useEffect(() => {
    if (!POSTHOG_KEY || consent !== "granted") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, consent]);

  return null;
}
