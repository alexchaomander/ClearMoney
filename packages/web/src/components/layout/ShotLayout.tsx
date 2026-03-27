"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShotLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ShotLayout - The "Advisor" themed wrapper for viral mini-tools.
 * Focuses on trust, approachability, and single-column focus.
 */
export function ShotLayout({ children, className }: ShotLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100", className)}>
      {/* Minimal Header */}
      <header className="h-16 flex items-center px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">ClearMoney</span>
          </Link>
          
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Math
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Trust Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-200 mt-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Our Independence Pledge</h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              ClearMoney never recommends a product because of an affiliate payout. 
              We show our math so you can verify our claims. Your trust is our only asset.
            </p>
            <Link href="/transparency" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
              Read the full Pledge <ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Security & Privacy</h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Audit data is processed ephemerally. We do not store your documents after the audit 
              is complete unless you explicitly join the waitlist.
            </p>
            <div className="flex gap-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">SOC2 Type II</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">AES-256 Encrypted</div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <p>© 2026 ClearMoney Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
