"use client";

import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShotHeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
}

/**
 * ShotHero - Brand-first hero component for viral mini-tools.
 * Implements the "Advisor" aesthetic: Approachable, Trustworthy, Soft.
 */
export function ShotHero({
  title,
  subtitle,
  description,
  ctaLabel = "Start the Math",
  onCtaClick,
  className
}: ShotHeroProps) {
  return (
    <section className={cn("text-center space-y-6 mb-16 px-4", className)}>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-500 uppercase tracking-widest animate-fade-in">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        {title}
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] max-w-3xl mx-auto">
        {subtitle}
      </h1>
      
      <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
      
      {onCtaClick && (
        <div className="pt-4 animate-fade-up">
          <button 
            onClick={onCtaClick}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            {ctaLabel}
            <div className="absolute inset-0 rounded-2xl ring-4 ring-emerald-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
          
          <div className="mt-6 flex justify-center items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified Deterministic Core
            </div>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <div>No Auth Required</div>
          </div>
        </div>
      )}
    </section>
  );
}
