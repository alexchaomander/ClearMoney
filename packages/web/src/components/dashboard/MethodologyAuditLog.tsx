"use client";

import React from "react";
import { GitCommit, FileText, ArrowRight } from "lucide-react";

interface AuditEntry {
  id: string;
  date: string;
  change: string;
  reason: string;
  author: string;
}

const SAMPLE_AUDIT: AuditEntry[] = [
  {
    id: "adc-992",
    date: "Feb 14, 2026",
    change: "Updated 'Runway' formula to exclude illiquid real estate equity.",
    reason: "Conservative posture update. Real estate liquidity timelines exceed 6 months.",
    author: "Protocol Governance"
  },
  {
    id: "adc-991",
    date: "Feb 02, 2026",
    change: "Adjusted tax-shield estimates for 2026 brackets.",
    reason: "IRS annual inflation adjustment integration.",
    author: "Tax Engine V2"
  }
];

export function MethodologyAuditLog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
          <GitCommit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display text-xl text-white">Methodology Ledger</h3>
          <p className="text-xs text-slate-400">A living record of how ClearMoney calculates your truth.</p>
        </div>
      </div>

      <div className="relative border-l border-slate-800 ml-3 space-y-8">
        {SAMPLE_AUDIT.map((entry) => (
          <div key={entry.id} className="relative pl-8 group">
            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors" />
            
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-slate-500">{entry.date}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono border border-slate-700">
                {entry.id}
              </span>
            </div>
            
            <h4 className="text-sm font-medium text-white mb-1">{entry.change}</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{entry.reason}</p>
            
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5" />
              </span>
              <span>Committed by {entry.author}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 rounded-xl border border-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2">
        View Full Git History
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
