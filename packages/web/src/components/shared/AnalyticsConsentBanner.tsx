"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

type ConsentState = "pending" | "granted" | "denied";

const STORAGE_KEY = "cm_analytics_consent";

interface AnalyticsConsentContextType {
  consent: ConsentState;
  grant: () => void;
  deny: () => void;
}

const AnalyticsConsentContext = createContext<AnalyticsConsentContextType>({
  consent: "pending",
  grant: () => {},
  deny: () => {},
});

export function useAnalyticsConsent() {
  return useContext(AnalyticsConsentContext);
}

export function AnalyticsConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>("pending");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
    }
    setMounted(true);
  }, []);

  const grant = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "granted");
    setConsent("granted");
  }, []);

  const deny = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "denied");
    setConsent("denied");
  }, []);

  return (
    <AnalyticsConsentContext.Provider value={{ consent, grant, deny }}>
      {children}
      {mounted && consent === "pending" && <ConsentBanner onAccept={grant} onDecline={deny} />}
    </AnalyticsConsentContext.Provider>
  );
}

function ConsentBanner({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 sm:left-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            We use analytics to improve ClearMoney
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
            We use PostHog to understand how people use the site. No data is sold or shared with
            advertisers.{" "}
            <a href="/privacy" className="underline hover:text-slate-700 dark:hover:text-neutral-300">
              Privacy policy
            </a>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Decline
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDecline}
          aria-label="Dismiss analytics consent"
          className="rounded-lg p-1 text-slate-400 transition hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
