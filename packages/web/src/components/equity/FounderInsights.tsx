"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { useEquityPortfolio } from "@/lib/strata/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function FounderInsights() {
  const { data: summary, isLoading } = useEquityPortfolio();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-48 bg-neutral-900 rounded-2xl border border-neutral-800" />
        <div className="h-48 bg-neutral-900 rounded-2xl border border-neutral-800" />
      </div>
    );
  }

  const s83bGrants = summary.grant_valuations.filter(v => v.election_deadline);
  const imminentDeadlines = s83bGrants.filter(v => {
    if (v.is_83b_elected) return false;
    const deadline = new Date(v.election_deadline!);
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const qsbsGrants = summary.grant_valuations.filter(v => v.is_qsbs_eligible);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 83(b) Tracker */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-white">83(b) Election Status</h3>
          </div>
          {imminentDeadlines.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Action Required</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {s83bGrants.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">No grants requiring 83(b) tracking found.</p>
          ) : (
            s83bGrants.map(v => {
              const deadline = new Date(v.election_deadline!);
              const today = new Date();
              const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isPast = diffDays < 0;

              return (
                <div key={v.symbol} className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50">
                  <div>
                    <p className="text-xs font-medium text-white">{v.symbol}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-tight">
                      Deadline: {formatDate(v.election_deadline!)}
                    </p>
                  </div>
                  {v.is_83b_elected ? (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Elected</span>
                    </div>
                  ) : isPast ? (
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Missed Window</span>
                  ) : (
                    <div className="text-right">
                      <p className={`text-xs font-bold uppercase tracking-widest ${diffDays <= 7 ? 'text-rose-500' : 'text-blue-500'}`}>
                        {diffDays} Days Left
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QSBS Clock */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-white">QSBS Holding Period</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <TrendingUp className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Tax Exclusion Clock</span>
          </div>
        </div>

        <div className="space-y-6">
          {qsbsGrants.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">No QSBS eligible grants found.</p>
          ) : (
            qsbsGrants.map(v => (
              <div key={v.symbol} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white">{v.symbol}</p>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {Math.round(v.qsbs_progress_percent || 0)}% Progress
                  </span>
                </div>
                <Progress value={v.qsbs_progress_percent || 0} className="h-1.5 bg-neutral-800" />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-tight">
                    {v.qsbs_progress_percent === 100 
                      ? "100% Tax Exclusion Met" 
                      : "Section 1202 Eligibility Tracked"}
                  </p>
                  {v.qsbs_progress_percent === 100 && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  )}
                </div>
              </div>
            ))
          )}
          <p className="text-[10px] text-neutral-600 leading-relaxed italic">
            QSBS (Section 1202) requires a 5-year holding period for 100% capital gains exclusion up to $10M or 10x basis.
          </p>
        </div>
      </div>
    </div>
  );
}
