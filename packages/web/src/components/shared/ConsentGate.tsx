"use client";

import { ReactNode, useMemo } from "react";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { useConsents, useCreateConsent } from "@/lib/strata/hooks";
import { cn } from "@/lib/utils";

interface ConsentGateProps {
  scopes: string[];
  purpose: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ConsentGate({
  scopes,
  purpose,
  title = "Grant consent to continue",
  description = "We only use this data to generate your recommendations and decision traces. You can revoke anytime.",
  children,
  className,
}: ConsentGateProps) {
  const { data: consents, isLoading } = useConsents();
  const createConsent = useCreateConsent();

  const hasConsent = useMemo(() => {
    if (!consents?.length) return false;
    return consents.some(
      (consent) =>
        consent.status === "active" &&
        scopes.every((scope) => consent.scopes.includes(scope))
    );
  }, [consents, scopes]);

  if (hasConsent) {
    return <>{children}</>;
  }

  return (
    <div className={cn("rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-neutral-100", className)}>
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-neutral-400">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scopes.map((scope) => (
              <span
                key={scope}
                className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs uppercase tracking-wide text-neutral-300"
              >
                {scope.replace(/:/g, " ")}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                createConsent.mutate({
                  scopes,
                  purpose,
                  source: "web",
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createConsent.isPending || isLoading}
            >
              Authorize access
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Lock className="h-4 w-4" />
              You control and can revoke this consent anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
