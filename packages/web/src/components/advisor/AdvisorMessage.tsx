"use client";

import React from "react";
import { useMetricHighlight } from "@/lib/strata/highlight-context";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface AdvisorMessageProps {
  content: string;
}

export function AdvisorMessage({ content }: AdvisorMessageProps) {
  const { setHighlightedMetric } = useMetricHighlight();

  // Pattern: [[metricId|Label]]
  const parts = content.split(/(\[\[[a-zA-Z0-9_| ]+\]\])/g);

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const inner = part.slice(2, -2);
          const [metricId, label] = inner.split("|");
          
          return (
            <button
              key={i}
              onMouseEnter={() => setHighlightedMetric(metricId)}
              onMouseLeave={() => setHighlightedMetric(null)}
              onClick={() => {
                // Future: Open TraceModal directly?
                // For now, highlighting is good.
              }}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-800/50 transition-all font-medium cursor-help mx-0.5"
              )}
            >
              {label || metricId}
              <Info className="w-2.5 h-2.5" />
            </button>
          );
        }
        return part;
      })}
    </div>
  );
}
