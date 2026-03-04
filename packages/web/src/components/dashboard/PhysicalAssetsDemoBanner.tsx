"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Home, 
  Watch, 
  ChevronRight, 
  X, 
  ArrowRight,
  TrendingUp,
  Zap,
  Globe
} from "lucide-react";

interface PhysicalAssetsDemoBannerProps {
  onStartDemo: () => void;
}

export function PhysicalAssetsDemoBanner({ onStartDemo }: PhysicalAssetsDemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl group"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full" 
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
        <div className="flex-1 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">New Feature Spotlight</span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-[1.1] tracking-tight">
            Track your <span className="text-emerald-400 italic">tangible</span> wealth in real-time.
          </h2>
          
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Mint only saw your bank accounts. ClearMoney sees your whole life. 
            Connect your property, vehicles, and luxury assets to Zillow, Marketcheck, and Chrono24 for a truly holistic net worth.
          </p>

          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <button
              onClick={onStartDemo}
              className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-black text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
            >
              Start Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-8 py-4 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700"
            >
              Dismiss
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
          <DemoAssetCard 
            icon={<Home className="w-6 h-6 text-emerald-400" />}
            label="Real Estate"
            value="$1.2M"
            sub="Zillow Sync"
            delay={0.1}
          />
          <DemoAssetCard 
            icon={<Watch className="w-6 h-6 text-blue-400" />}
            label="Watches"
            value="$42k"
            sub="Market Data"
            delay={0.2}
          />
          <DemoAssetCard 
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            label="Vehicles"
            value="$85k"
            sub="KBB Verified"
            delay={0.3}
          />
          <DemoAssetCard 
            icon={<Globe className="w-6 h-6 text-indigo-400" />}
            label="Commodities"
            value="$12k"
            sub="Live Spot"
            delay={0.4}
          />
        </div>
      </div>
    </motion.div>
  );
}

function DemoAssetCard({ icon, label, value, sub, delay }: { icon: React.ReactNode, label: string, value: string, sub: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all group/item"
    >
      <div className="mb-4 bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-700 group-hover/item:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-black text-white tracking-tight mb-1">{value}</div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{sub}</span>
      </div>
    </motion.div>
  );
}
