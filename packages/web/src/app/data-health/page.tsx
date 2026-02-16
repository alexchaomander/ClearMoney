"use client";

import Link from "next/link";
import { Fraunces, Work_Sans } from "next/font/google";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useDataHealth } from "@/lib/strata/hooks";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });
const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function DataHealthPage() {
  const { data: health, isLoading, isError, refetch } = useDataHealth();

  return (
    <div className={`${body.className} min-h-screen bg-[#0e0f13] text-white pb-20`}>
      <header className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <span className={`${display.className} font-semibold`}>System Health</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-8">
        <div className="mb-12">
          <h1 className={`${display.className} text-4xl font-bold mb-4`}>Data Health & Freshness</h1>
          <p className="text-white/60 text-lg">
            Monitor the status of your financial data graph and underlying Strata services.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
            <p className="text-white/40">Loading health metrics...</p>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error loading health data</h2>
            <p className="text-white/60 mb-6">We couldn't reach the Strata health service. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Overall Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    health?.status === "ok" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {health?.status || "Unknown"}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Core Database</span>
                    <span className="flex items-center gap-2 text-sm">
                      {health?.database === "ok" ? (
                        <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Operational</>
                      ) : (
                        <><AlertTriangle className="h-4 w-4 text-amber-400" /> Degraded</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Data Catalog</span>
                    <span className="flex items-center gap-2 text-sm">
                      {health?.catalog === "ok" ? (
                        <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Synchronized</>
                      ) : (
                        <><Clock className="h-4 w-4 text-amber-400" /> Reindexing</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-5 w-5 text-sky-400" />
                  <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Last Update</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {health?.last_updated ? new Date(health.last_updated).toLocaleDateString() : "---"}
                </div>
                <p className="text-white/40 text-sm">
                  {health?.last_updated 
                    ? `System-wide sync completed ${new Date(health.last_updated).toLocaleTimeString()}`
                    : "No sync history available"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Data Source Integrity</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {health?.details ? Object.entries(health.details).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-white/80 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-300 border border-emerald-500/20">
                      {value}
                    </span>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-8 text-white/30">
                    No detailed integrity metrics available.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
              <h3 className={`${display.className} text-xl font-semibold mb-3`}>Automatic Health Monitoring</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                ClearMoney continuously monitors the health of your financial data graph. If we detect a discrepancy 
                between your linked accounts and our internal projections, we will automatically trigger a 
                resync or notify you of the divergence.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
