"use client";

import React, { useState } from "react";
import { Plus, Info, ShieldCheck, Download, LineChart, PieChart, Landmark } from "lucide-react";
import { EquitySummaryCards } from "./EquitySummaryCards";
import { EquityProjectionChart } from "./EquityProjectionChart";
import { GrantTable } from "./GrantTable";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";

export function EquityDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-10 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
                  <Landmark className="w-5 h-5 text-brand-400" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Equity Compensation</h1>
              </div>
              <p className="text-neutral-400 max-w-2xl text-lg">
                Your complete economic digital twin for equity. We automatically 
                project your future wealth based on real-time stock prices.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white">
                <Download className="w-4 h-4" />
                Financial Passport
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="gap-2 bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20"
              >
                <Plus className="w-4 h-4" />
                Add Stock Grant
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <EquitySummaryCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Chart & Table */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <LineChart className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500">Wealth Vesting Schedule (24mo)</h3>
                </div>
                <EquityProjectionChart />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500">Active Stock Grants</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                    Auto-updating Prices
                  </span>
                </div>
                <GrantTable />
              </div>
            </div>

            {/* Right: Insights & Optimization */}
            <div className="space-y-6">
              <div className="p-8 rounded-3xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm space-y-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                  <Info className="w-32 h-32" />
                </div>
                
                <div className="flex items-center gap-2 text-brand-400 relative z-10">
                  <Info className="w-5 h-5" />
                  <h4 className="font-bold uppercase tracking-widest text-xs">Advisor Insights</h4>
                </div>
                
                <ul className="space-y-6 relative z-10">
                  <li className="text-sm text-neutral-300 flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <p className="leading-relaxed">
                      Your <strong>concentration risk</strong> in NVDA is high (42% of liquid wealth). Consider a diversification strategy.
                    </p>
                  </li>
                  <li className="text-sm text-neutral-300 flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <p className="leading-relaxed">
                      You have <strong>ISO options</strong> expiring in 90 days. Check your tax-optimized exercise plan.
                    </p>
                  </li>
                  <li className="text-sm text-neutral-300 flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <p className="leading-relaxed">
                      Estimated <strong>tax liability</strong> for your Q3 vest is $12,450. We've updated your tax shield projection.
                    </p>
                  </li>
                </ul>
                
                <Button variant="link" className="text-brand-400 p-0 h-auto text-sm font-bold uppercase tracking-widest hover:text-brand-300 relative z-10">
                  View all 5 insights
                </Button>
              </div>

              <div className="p-8 rounded-3xl border border-brand-500/20 bg-brand-500/5 space-y-4 relative overflow-hidden">
                <div className="flex items-center gap-2 text-brand-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-bold text-white text-[10px] uppercase tracking-[0.25em]">Strata Verified</h4>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Generate a <strong>Proof of Equity</strong> credential to verify your unvested 
                  wealth for loans or leases without exposing your entire brokerage account.
                </p>
                <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white py-6 rounded-2xl">
                  Generate Credential
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddAccountModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
