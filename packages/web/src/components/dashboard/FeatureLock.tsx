"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Database, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FeatureLockProps {
  title: string;
  description: string;
  requiredData: string[];
  className?: string;
}

export function FeatureLock({
  title,
  description,
  requiredData,
  className,
}: FeatureLockProps) {
  return (
    <div className={cn(
      "relative rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden",
      className
    )}>
      {/* Overlay Content */}
      <div className="relative z-10 p-8 flex flex-col items-center text-center">
        <div className="mb-6 relative">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-900"
          />
        </div>

        <h3 className="font-display text-xl text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 max-w-xs mb-8 leading-relaxed">
          {description}
        </p>

        <div className="w-full max-w-sm bg-slate-950/50 rounded-xl border border-slate-800 p-4 mb-8">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <Database className="w-3 h-3" />
            Data Pillars Required
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {requiredData.map((data) => (
              <span key={data} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                {data}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/connect"
          className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-white/5"
        >
          Strengthen Data Surface
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,_var(--tw-gradient-stops))] from-slate-800 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-800 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
