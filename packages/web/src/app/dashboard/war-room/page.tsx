"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  ArrowLeft, 
  History, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Search,
  Activity
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ActionIntentCard, type ActionStatus } from "@/components/dashboard/ActionIntentCard";
import { TraceModal } from "@/components/dashboard/TraceModal";
import { BiometricOverlay } from "@/components/dashboard/BiometricOverlay";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { 
  useActionIntents, 
  useUpdateActionIntent, 
  useDownloadIntentManifest,
  useDecisionTraces
} from "@/lib/strata/hooks";
import { METRIC_METHODOLOGY } from "@/lib/strata/metrics-methodology";
import { toast } from "@/components/shared/toast";
import type { ActionIntentStatus } from "@clearmoney/strata-sdk";

// Helper to map backend status to frontend display status
function getStatusLabel(status: ActionIntentStatus): ActionStatus {
  switch (status) {
    case "draft": return "draft";
    case "pending_approval": return "ready";
    case "processing": return "executing";
    case "executed": return "completed";
    case "failed": return "failed";
    case "cancelled": return "failed"; // map cancelled to failed visual state or add new state
    default: return "draft";
  }
}

export default function WarRoomPage() {
  const [filter, setFilter] = useState<ActionStatus | "all">("all");
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [executingIntentId, setExecutingIntentId] = useState<string | null>(null);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);

  // Data fetching
  const { data: intents, isLoading, refetch } = useActionIntents();
  const updateIntent = useUpdateActionIntent();
  const downloadManifest = useDownloadIntentManifest();
  
  // We fetch decision traces to support the modal
  const { data: traces } = useDecisionTraces(undefined, { enabled: !!intents });

  const filteredIntents = useMemo(() => {
    if (!intents) return [];
    if (filter === "all") return intents;
    return intents.filter(i => getStatusLabel(i.status) === filter);
  }, [intents, filter]);

  const stats = useMemo(() => {
    if (!intents) return { pending: 0, completed: 0 };
    return {
      pending: intents.filter(i => getStatusLabel(i.status) === "draft" || getStatusLabel(i.status) === "ready").length,
      completed: intents.filter(i => getStatusLabel(i.status) === "completed").length
    };
  }, [intents]);

  const handleReview = (traceId?: string) => {
    if (traceId) {
      setSelectedTraceId(traceId);
      setIsTraceOpen(true);
    } else {
      toast.error("No logic trace associated with this intent.");
    }
  };

  const handleExecuteRequest = (id: string) => {
    setExecutingIntentId(id);
    setIsBiometricOpen(true);
  };

  const handleBiometricSuccess = async () => {
    if (!executingIntentId) return;
    
    try {
      await updateIntent.mutateAsync({
        id: executingIntentId,
        data: { status: "executed" as any }
      });
      toast.success("Maneuver authorized and processing.");
      setIsBiometricOpen(false);
      setExecutingIntentId(null);
      refetch();
    } catch (err) {
      toast.error("Failed to authorize maneuver.");
    }
  };

  const handleDownload = (id: string) => {
    downloadManifest.mutate(id);
  };

  // Find the selected trace data for the modal
  const selectedTraceData = useMemo(() => {
    if (!selectedTraceId) return null;
    
    // Check static methodology first
    const staticMethodology = METRIC_METHODOLOGY[selectedTraceId];
    if (staticMethodology) return staticMethodology;

    // Search real traces
    const realTrace = traces?.find(t => t.id === selectedTraceId);
    if (realTrace) {
      return {
        metricId: realTrace.id,
        label: realTrace.title,
        description: realTrace.summary,
        formula: (realTrace.details as any)?.formula || "Custom AI Logic",
        dataPoints: (realTrace.details as any)?.inputs || [],
        confidenceScore: realTrace.confidence_score
      };
    }
    
    return null;
  }, [selectedTraceId, traces]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Action Approval Queue</span>
            </div>
            <h1 className="font-display text-4xl text-white mb-2">The War Room</h1>
            <p className="text-slate-400 max-w-xl">
              Authorize high-fidelity financial maneuvers drafted by your Advisor. 
              Review the logic, verify the math, and execute with one-touch security.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[120px]">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pending</p>
              <p className="text-xl font-mono font-bold text-amber-400">{stats.pending}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[120px]">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Executed</p>
              <p className="text-xl font-mono font-bold text-emerald-400">{stats.completed}</p>
            </div>
          </div>
        </div>

        <ConsentGate
          scopes={["agent:read", "decision_traces:read"]}
          purpose="Access your action queue and authorize financial intents."
        >
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              {[
                { id: "all" as const, label: "All Intents" },
                { id: "ready" as ActionStatus, label: "Ready" },
                { id: "draft" as ActionStatus, label: "Drafts" },
                { id: "completed" as ActionStatus, label: "History" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                    filter === t.id 
                      ? "bg-slate-800 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button 
              onClick={() => refetch()}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              Refresh Queue
            </button>
          </div>

          {/* Intent Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredIntents.length === 0 ? (
            <div className="py-24 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 text-slate-600">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-white font-medium mb-1">No maneuvers found</h3>
              <p className="text-sm text-slate-500">
                Your queue is empty. Ask the Advisor to help optimize your portfolio.
              </p>
              <Link 
                href="/advisor"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Go to Advisor
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredIntents.map((intent) => (
                  <ActionIntentCard
                    key={intent.id}
                    id={intent.id}
                    title={intent.title}
                    description={intent.description || ""}
                    status={getStatusLabel(intent.status)}
                    type={intent.intent_type}
                    impact={Object.values(intent.impact_summary)[0]?.toString()}
                    onReview={() => handleReview(intent.decision_trace_id)}
                    onExecute={() => handleExecuteRequest(intent.id)}
                    onDownload={() => handleDownload(intent.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ConsentGate>
      </main>

      {/* Logic Trace Modal */}
      {selectedTraceData && (
        <TraceModal
          open={isTraceOpen}
          onOpenChange={setIsTraceOpen}
          data={selectedTraceData}
        />
      )}

      {/* Biometric Confirmation */}
      <BiometricOverlay
        isOpen={isBiometricOpen}
        onCancel={() => setIsBiometricOpen(false)}
        onSuccess={handleBiometricSuccess}
        title="Authorize Maneuver"
        amount={
          executingIntentId 
            ? intents?.find(i => i.id === executingIntentId)?.payload?.amount?.toLocaleString("en-US", { style: 'currency', currency: 'USD' })
            : undefined
        }
      />
    </div>
  );
}
