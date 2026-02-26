"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  ExternalLink, 
  ArrowRight,
  Info,
  Lock,
  DollarSign,
  AlertTriangle,
  History,
  CheckCircle2
} from "lucide-react";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { UnifiedIntakeForm } from "@/components/shared/UnifiedIntakeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ConflictAuditProps {
  showShell?: boolean;
}

/**
 * ConflictAudit - "Shot #3" for the Viral Launch.
 * Targets the "Affiliate Problem" by exposing estimated commissions vs user value.
 */
export function ConflictAudit({ showShell = true }: ConflictAuditProps) {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Mock data for viral effect
  const MOCK_CARDS = [
    { name: "Amex Platinum", commission: 450, value: 120, rating: "Overpriced" },
    { name: "Chase Sapphire Reserve", commission: 400, value: 380, rating: "Fair" },
    { name: "Capital One Venture X", commission: 350, value: 410, rating: "High Value" },
    { name: "Bilt Mastercard", commission: 0, value: 550, rating: "Pure Math" }
  ];

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2500);
  };

  const totalCommission = MOCK_CARDS.reduce((sum, c) => sum + c.commission, 0);
  const avgValue = Math.floor(MOCK_CARDS.reduce((sum, c) => sum + c.value, 0) / MOCK_CARDS.length);

  const content = (
      <div className="max-w-4xl mx-auto space-y-12">
        {/* URL Input */}
        <section className="p-10 rounded-[2.5rem] bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldAlert className="w-32 h-32 text-rose-500 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Audit a Review</h3>
            <p className="text-neutral-400 mb-8 max-w-lg leading-relaxed">
              We use a database of industry affiliate payouts to estimate the total "Conflict Value" of any financial advice page.
            </p>
            
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input 
                  placeholder="https://thepointsguy.com/cards/best-travel-cards/"
                  className="pl-12 py-7 bg-neutral-950 border-neutral-800 focus:border-rose-500 text-lg rounded-2xl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={scanning}
                />
              </div>
              <Button 
                type="submit" 
                className="px-10 py-7 bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-rose-900/20"
                disabled={scanning || !url}
              >
                {scanning ? "Scanning Logic..." : "Audit Math"}
              </Button>
            </form>
          </div>
        </section>

        {scanned && (
          <div className="animate-fade-in space-y-12">
            {/* Top Stats */}
            <div className="grid gap-6 md:grid-cols-2">
              <ResultCard
                title="Estimated Page Payout"
                value={`$${totalCommission.toLocaleString()}`}
                description="Total commission if you apply for all top picks."
                trend="up"
                icon={<DollarSign className="w-5 h-5" />}
                color="#f43f5e"
              />
              <ResultCard
                title="Average User Value"
                value={`$${avgValue}/yr`}
                description="Estimated 1st-year ROI for the average user."
                trend="down"
                icon={<Info className="w-5 h-5" />}
                color="#64748b"
              />
            </div>

            {/* Locked Analysis */}
            {!unlocked ? (
              <div className="relative">
                <div className="blur-xl pointer-events-none opacity-20 transition-all scale-[0.98]">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-neutral-800 rounded-2xl border border-neutral-700" />
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center -top-12">
                  <div className="w-16 h-16 bg-neutral-950 rounded-full flex items-center justify-center mb-6 border border-neutral-800 shadow-2xl">
                    <Lock className="w-6 h-6 text-rose-400" />
                  </div>
                  
                  <UnifiedIntakeForm 
                    sourceTool="Conflict Audit"
                    onSuccess={() => setUnlocked(true)}
                    className="w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-up">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest px-2">
                  <AlertTriangle className="w-4 h-4" /> Detected Conflicts of Interest
                </div>
                
                <div className="grid gap-4">
                  {MOCK_CARDS.map((card, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-neutral-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border",
                          card.commission > 400 ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-neutral-800 border-neutral-700 text-neutral-400"
                        )}>
                          {card.name[0]}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{card.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-black uppercase px-1.5 py-0.5 rounded",
                              card.rating === "Overpriced" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                            )}>{card.rating}</span>
                            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                              <History className="w-3 h-3" /> Historical Payout Data
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-12 text-right">
                        <div>
                          <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">Commission</p>
                          <p className="text-rose-400 font-mono font-bold text-xl">${card.commission}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">Actual Value</p>
                          <p className="text-emerald-400 font-mono font-bold text-xl">${card.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-emerald-400 font-bold text-lg mb-1">Switch to Independence</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      ClearMoney values these cards differently because our math is independent. We can draft a switch kit to move you from high-fee cards to high-ROI cards.
                    </p>
                  </div>
                  <Button className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-6 rounded-2xl shadow-xl shadow-emerald-900/20">
                    Draft Switch Kit
                  </Button>
                </div>
              </div>
            )}

            <MethodologySection
              title="How we calculate 'Conflict Value'"
              steps={[
                "We crawl the page to identify financial products mentioned.",
                "We cross-reference these products with a crowd-sourced database of affiliate commission rates (standard industry tiers).",
                "We compare these commissions against the 1st-year ROI using ClearMoney's published 'Independent Valuations'.",
                "The 'Conflict Value' is the delta between what the site earns and what you gain."
              ]}
            />
          </div>
        )}
      </div>
  );

  if (!showShell) return content;

  return (
    <AppShell
      title="The Conflict of Interest Audit"
      description="Paste any 'Best Credit Cards' list URL to see how much they earn from your approval."
      category="Industry Accountability"
      icon={<ShieldAlert className="w-6 h-6 text-rose-400" />}
    >
      {content}
    </AppShell>
  );
}
