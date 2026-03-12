"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { TraceModal } from "./TraceModal";
import { METRIC_METHODOLOGY } from "@/lib/strata/metrics-methodology";
import { useMetricTrace } from "@/lib/strata/hooks";
import { cn } from "@/lib/utils";

interface MetricTraceProps {
  metricId: string;
  className?: string;
}

function formatPointValue(metricId: string, label: string, value: string | number) {
  if (typeof value !== "number") {
    return value;
  }

  if (metricId === "savingsRate" && label === "Savings Rate") {
    return `${value}%`;
  }

  if (metricId === "personalRunway" && label === "Runway Months") {
    return `${value} mo`;
  }

  if (label.toLowerCase().includes("rate")) {
    return `${value}%`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function MetricTrace({ metricId, className }: MetricTraceProps) {
  const [open, setOpen] = useState(false);
  const { data: liveTrace } = useMetricTrace(metricId, { enabled: open });
  const fallback = METRIC_METHODOLOGY[metricId];
  const data = liveTrace
    ? {
        metricId: liveTrace.metric_id,
        label: liveTrace.label,
        formula: liveTrace.formula,
        description: liveTrace.description,
        dataPoints: liveTrace.data_points.map((point) => ({
          label: point.label,
          value: formatPointValue(liveTrace.metric_id, point.label, point.value),
          source: point.source ?? undefined,
        })),
        confidenceScore: liveTrace.confidence_score,
        methodologyVersion: liveTrace.methodology_version,
        asOf: liveTrace.as_of,
        warnings: liveTrace.warnings,
      }
    : fallback;

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
