"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Share2, 
  Lock, 
  Globe 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { MetricCard } from "@/components/dashboard/MetricCard";

interface ShareSheetPreviewProps {
  data: {
    netWorth: number;
    liquidAssets: number;
    monthlyBurn: number;
    runwayMonths: number;
  };
  className?: string;
}

export function ShareSheetPreview({ data, className }: ShareSheetPreviewProps) {
  const [settings, setSettings] = useState({
    redactBalances: false,
    hideInstitutions: true,
    stripPII: true,
    ephemeral: true
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatValue = (val: number) => {
    if (settings.redactBalances) {
      // Obfuscate to nearest magnitude
      if (val > 1000000) return "$1M+";
      if (val > 100000) return "$100k+";
      if (val > 10000) return "$10k+";
      return "****";
    }
    return val.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  };

  return (
    <div className={cn("grid lg:grid-cols-2 gap-8", className)}>
      {/* Controls */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            Privacy Controls
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Redact Exact Balances</p>
                <p className="text-xs text-slate-500">Show ranges ($10k+) instead of $12,450.</p>
              </div>
              <Switch 
                checked={settings.redactBalances}
                onCheckedChange={(v) => setSettings(s => ({ ...s, redactBalances: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Hide Institution Names</p>
                <p className="text-xs text-slate-500">&quot;Major US Bank&quot; instead of &quot;Chase&quot;.</p>
              </div>
              <Switch 
                checked={settings.hideInstitutions}
                onCheckedChange={(v) => setSettings(s => ({ ...s, hideInstitutions: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Strip PII</p>
                <p className="text-xs text-slate-500">Remove name, email, and addresses.</p>
              </div>
              <Switch 
                checked={settings.stripPII}
                onCheckedChange={(v) => setSettings(s => ({ ...s, stripPII: v }))}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-200">Ephemeral Link</p>
                <p className="text-xs text-slate-500">Link expires in 24 hours.</p>
              </div>
              <Switch 
                checked={settings.ephemeral}
                onCheckedChange={(v) => setSettings(s => ({ ...s, ephemeral: v }))}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link Copied" : "Generate Secure Link"}
        </button>
      </div>

      {/* Live Preview */}
      <div className="relative">
        <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400 z-20 flex items-center gap-2">
          {settings.redactBalances ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          Recipient View
        </div>
        
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 pt-8 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                {settings.stripPII ? <Lock className="w-5 h-5" /> : "JD"}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {settings.stripPII ? "Verified User" : "John Doe"}
                </p>
                <p className="text-xs text-slate-500">
                  {settings.ephemeral ? "Expires in 24h" : "Permanent Link"}
                </p>
              </div>
            </div>
            <div className="px-2 py-1 rounded bg-emerald-950/30 text-emerald-400 text-[10px] font-bold border border-emerald-900/50">
              STRATA VERIFIED
            </div>
          </div>

          <div className="grid gap-4">
            <MetricCard 
              label="Net Worth"
              value={formatValue(data.netWorth)}
              intent="neutral"
              className="bg-slate-900/50"
            />
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="Liquid Assets"
                value={formatValue(data.liquidAssets)}
                intent="neutral"
                className="bg-slate-900/50"
              />
              <MetricCard 
                label="Runway"
                value={settings.redactBalances ? "> 12 mo" : `${data.runwayMonths} mo`}
                intent="emerald"
                className="bg-emerald-950/10 border-emerald-900/30"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400 mb-3 font-medium">Source Attribution</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Primary Bank</span>
                <span className="text-slate-300 font-mono">
                  {settings.hideInstitutions ? "Major US Bank (***4291)" : "Chase (***4291)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Brokerage</span>
                <span className="text-slate-300 font-mono">
                  {settings.hideInstitutions ? "SIPC Member (***9921)" : "Fidelity (***9921)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
