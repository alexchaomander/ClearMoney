"use client";

import { ScrollText, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useTransparencyPayload } from "@/lib/strata/hooks";
import { Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });

export function CorrectionsLogTable() {
  const { data: transparency, isLoading } = useTransparencyPayload();

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Corrections log</p>
          <h1 className={`${display.className} mt-4 text-5xl font-semibold leading-tight`}>
            We publish every change.
          </h1>
          <p className="mt-6 text-lg text-white/70">
            When assumptions shift or we discover an error, we log it publicly. This is how we keep ourselves honest.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <ScrollText className="h-5 w-5 text-emerald-300" />
            Correction standards
          </div>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Public timestamp</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Clear impact summary</li>
            <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" />Flagged in affected tools</li>
          </ul>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between">
          <h2 className={`${display.className} text-3xl font-semibold`}>Recent corrections</h2>
          {isLoading && <RefreshCw className="h-5 w-5 text-emerald-300 animate-spin" />}
        </div>
        <div className="mt-6 space-y-4">
          {transparency?.corrections.map((item) => (
            <div key={item.date} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.date}</p>
                  <p className="text-lg font-semibold">{item.summary}</p>
                  <p className="text-sm text-white/60">{item.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Impact</p>
                  <p className="text-lg text-emerald-300">{item.impact}</p>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && transparency?.corrections.length === 0 && (
            <div className="py-12 text-center text-white/30 italic">
              No corrections logged at this time.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
