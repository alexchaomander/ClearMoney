"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { AnimatedAmount } from "@/components/shared/AnimatedAmount";

interface Alert {
  ticker: string | null;
  name: string;
  percentage: number;
  message: string;
}

interface ConcentrationAlertProps {
  alerts: Alert[];
}

export function ConcentrationAlert({ alerts }: ConcentrationAlertProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-900/40 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800/50 shadow-sm"
    >
      <div className="flex items-start gap-4 text-left">
        <div className="p-3 rounded-xl bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300/50 dark:border-amber-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-serif text-xl text-amber-900 dark:text-amber-200 mb-1">
            Concentration Alert
          </h4>
          <p className="text-sm text-amber-800/80 dark:text-amber-300/70 mb-4">
            Some positions represent a large portion of your portfolio.
            Consider diversifying to reduce risk.
          </p>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-transparent hover:border-amber-400 dark:hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">
                    {alert.ticker || alert.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                  <AnimatedAmount value={alert.percentage} showCurrency={false} prefix="" className="text-sm" />
                  <span className="text-xs uppercase tracking-widest opacity-70">% of portfolio</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
