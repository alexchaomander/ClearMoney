import posthog from "posthog-js";
import { env } from "@/lib/env";

export const POSTHOG_KEY = env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = env.NEXT_PUBLIC_POSTHOG_HOST;

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || !POSTHOG_KEY || initialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  initialized = true;
}

export { posthog };
