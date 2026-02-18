"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  DollarSign 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface Policy {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  severity: "critical" | "high" | "medium";
  category: "transfer" | "execution" | "privacy";
}

const DEFAULT_POLICIES: Policy[] = [
  {
    id: "require_approval",
    name: "Require Manual Approval",
    description: "All agent-drafted actions must be explicitly approved by you before execution.",
    isEnabled: true,
    severity: "critical",
    category: "execution"
  },
  {
    id: "max_transfer_limit",
    name: "Transfer Limit ($5,000)",
    description: "Block any single transfer exceeding $5,000 regardless of approval status.",
    isEnabled: true,
    severity: "high",
    category: "transfer"
  },
  {
    id: "pII_redaction",
    name: "Strict PII Redaction",
    description: "Strip all personally identifiable information from agent context windows.",
    isEnabled: false,
    severity: "medium",
    category: "privacy"
  },
  {
    id: "two_factor_auth",
    name: "Biometric 2FA",
    description: "Require FaceID/TouchID for all asset movements.",
    isEnabled: true,
    severity: "critical",
    category: "execution"
  }
];

export function GuardrailDashboard() {
  const [policies, setPolicies] = useState<Policy[]>(DEFAULT_POLICIES);

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl text-white">Agent Guardrails</h2>
            <p className="text-xs text-slate-400">Define the autonomous boundaries for your financial agent.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-900/50">
          <Activity className="w-3 h-3" />
          Policy Engine Active
        </div>
      </div>

      <div className="grid gap-4">
        {policies.map((policy) => (
          <motion.div
            key={policy.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-5 rounded-xl border transition-all",
              policy.isEnabled 
                ? "bg-slate-900 border-slate-700 shadow-lg" 
                : "bg-slate-950 border-slate-800 opacity-75"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2.5 rounded-lg shrink-0",
                  policy.isEnabled 
                    ? "bg-emerald-950/30 text-emerald-400" 
                    : "bg-slate-800 text-slate-500"
                )}>
                  {policy.category === "execution" && <Lock className="w-5 h-5" />}
                  {policy.category === "transfer" && <DollarSign className="w-5 h-5" />}
                  {policy.category === "privacy" && <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-medium",
                      policy.isEnabled ? "text-white" : "text-slate-400"
                    )}>
                      {policy.name}
                    </h3>
                    {policy.severity === "critical" && (
                      <span className="px-1.5 py-0.5 rounded bg-error-950/30 text-error-400 border border-error-900/50 text-[9px] font-bold uppercase tracking-wider">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                    {policy.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  policy.isEnabled ? "text-emerald-400" : "text-slate-600"
                )}>
                  {policy.isEnabled ? "Enforced" : "Disabled"}
                </span>
                <Switch 
                  checked={policy.isEnabled} 
                  onCheckedChange={() => togglePolicy(policy.id)} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p>
          Changes to critical policies (Transfer Limits, 2FA) require a 24-hour cooling-off period before taking effect.
        </p>
      </div>
    </div>
  );
}
