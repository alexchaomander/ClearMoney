"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { TraceModal } from "./TraceModal";
import { METRIC_METHODOLOGY } from "@/lib/strata/metrics-methodology";
import { cn } from "@/lib/utils";

interface MetricTraceProps {
  metricId: string;
  className?: string;
}

export function MetricTrace({ metricId, className }: MetricTraceProps) {
  const [open, setOpen] = useState(false);
  const data = METRIC_METHODOLOGY[metricId];

  if (!data) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center justify-center p-1 rounded-md text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all",
          className
        )}
        title="Show the math"
      >
        <Info className="w-3 h-3" />
      </button>
      <TraceModal 
        data={data} 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}
