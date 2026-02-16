"use client";

import { Receipt, Scale, RefreshCw } from "lucide-react";
import { useTransparencyPayload } from "@/lib/strata/hooks";
import { Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });

export function PayoutDisclosureTable() {
  const { data: transparency, isLoading } = useTransparencyPayload();

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Payout disclosure</p>
          <h1 className={`${display.className} mt-4 text-5xl font-semibold leading-tight`}>
            See every payout, next to every recommendation.
          </h1>
          <p className="mt-6 text-lg text-white/70">
            We publish estimated affiliate payouts and how they compare to our ranking. If a payout is high
            and the recommendation is low, you will see why.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Receipt className="h-5 w-5 text-emerald-300" />
            What this means
          </div>
          <p className="mt-4 text-sm text-white/70">
            Payouts are estimates based on public reports and affiliate network ranges. We update monthly.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
            Last update: {transparency?.last_updated || "---"}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between">
          <h2 className={`${display.className} text-3xl font-semibold`}>Disclosure table</h2>
          {isLoading ? (
            <RefreshCw className="h-5 w-5 text-emerald-300 animate-spin" />
          ) : (
            <Scale className="h-5 w-5 text-emerald-300" />
          )}
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/40">
          {isLoading ? "Fetching live affiliate ingestion data..." : "Live affiliate data active from Strata"}
        </p>
        
        <div className="mt-6 space-y-4">
          {transparency?.payout_disclosure.map((row) => (
            <div key={row.card} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{row.card}</p>
                  <p className="text-sm text-white/60">{row.reason}</p>
                  <p className="mt-1 text-xs text-white/40">Source: {row.source}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Payout</p>
                  <p className="text-lg">${row.payout_usd}</p>
                  <p className="text-xs text-white/50">Rank: {row.recommendation_rank}</p>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && transparency?.payout_disclosure.length === 0 && (
            <div className="py-12 text-center text-white/30 italic">
              No disclosure data available at this time.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
