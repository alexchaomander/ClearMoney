"use client";

import React from "react";
import { DollarSign, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayoutItem {
  product: string;
  category: string;
  ourPayout: number;
  marketMaxPayout: number;
  recommendationLogic: string;
  isRecommended: boolean;
}

const SAMPLE_PAYOUTS: PayoutItem[] = [
  {
    product: "Chase Sapphire Reserve",
    category: "Credit Cards",
    ourPayout: 250,
    marketMaxPayout: 400,
    recommendationLogic: "Strong travel multiplier (3x) fits user spend profile ($4k/mo travel).",
    isRecommended: true
  },
  {
    product: "Amex Platinum",
    category: "Credit Cards",
    ourPayout: 350,
    marketMaxPayout: 550,
    recommendationLogic: "Annual fee ($695) exceeds value of benefits for this user's lifestyle.",
    isRecommended: false
  },
  {
    product: "Vanguard VTI",
    category: "Investments",
    ourPayout: 0,
    marketMaxPayout: 0,
    recommendationLogic: "Best-in-class expense ratio (0.03%). No affiliate program exists.",
    isRecommended: true
  }
];

export function PayoutDisclosure() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg text-white">Affiliate Transparency</h3>
            <p className="text-xs text-slate-400">We disclose potential revenue alongside our recommendation logic.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-900/50">
          <ShieldCheck className="w-3 h-3" />
          Audited Independent
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-500 font-medium uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Our Payout</th>
              <th className="px-6 py-4">Recommendation Logic</th>
              <th className="px-6 py-4 text-right">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {SAMPLE_PAYOUTS.map((item) => (
              <tr key={item.product} className="group hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{item.product}</div>
                  <div className="text-xs text-slate-500">{item.category}</div>
                </td>
                <td className="px-6 py-4 font-mono text-slate-300">
                  {item.ourPayout > 0 ? `$${item.ourPayout}` : "None"}
                  {item.ourPayout > 0 && item.ourPayout < item.marketMaxPayout && (
                    <div className="text-[9px] text-slate-500 mt-1">
                      (Market Max: ${item.marketMaxPayout})
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400 max-w-xs leading-relaxed">
                  {item.recommendationLogic}
                </td>
                <td className="px-6 py-4 text-right">
                  {item.isRecommended ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Recommended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
