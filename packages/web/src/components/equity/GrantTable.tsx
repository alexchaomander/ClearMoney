"use client";

import React from "react";
import { useEquityGrants, useEquityPortfolio } from "@/lib/strata/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function GrantTable() {
  const { data: grants, isLoading: loadingGrants } = useEquityGrants();
  const { data: summary, isLoading: loadingSummary } = useEquityPortfolio();

  if (loadingGrants || loadingSummary) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-800" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-neutral-900 rounded-lg border border-neutral-800" />
        ))}
      </div>
    );
  }

  if (!grants || grants.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 text-center">
        <p className="text-neutral-500 mb-2">No equity grants found.</p>
        <p className="text-sm text-neutral-600">
          Add your RSUs, Options, or Founder Stock to see your wealth projection.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/80">
            <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Grant Name</th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Type</th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Quantity</th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Vested / Unvested</th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Total Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {grants.map((grant) => {
            const valuation = summary?.grant_valuations.find(v => v.symbol === (grant.symbol || grant.company_name || "Private"));
            
            return (
              <tr key={grant.id} className="hover:bg-neutral-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{grant.grant_name}</p>
                    <p className="text-xs text-neutral-500">{grant.symbol || grant.company_name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <Badge variant="outline" className="uppercase text-[10px] bg-neutral-800 w-fit">
                      {grant.grant_type.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex gap-1">
                      {grant.is_83b_elected && (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] uppercase px-1 py-0">
                          83(b)
                        </Badge>
                      )}
                      {grant.is_qsbs_eligible && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] uppercase px-1 py-0">
                          QSBS
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-300">
                  {Number(grant.quantity).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 w-24 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ 
                          width: valuation ? `${(Number(valuation.vested_quantity) / Number(grant.quantity)) * 100}%` : "0%" 
                        }} 
                      />
                    </div>
                    <span className="text-xs text-neutral-500">
                      {valuation ? `${Math.round((Number(valuation.vested_quantity) / Number(grant.quantity)) * 100)}%` : "0%"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">
                    {valuation ? formatCurrency(valuation.total_value) : "$0.00"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {valuation ? `${formatCurrency(valuation.current_price)} / share` : "Price pending"}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
