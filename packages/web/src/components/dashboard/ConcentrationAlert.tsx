"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";

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
      className="p-4 rounded-xl bg-amber-900/20 border border-amber-800/50"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-200 mb-1">
            Concentration Alert
          </h4>
          <p className="text-sm text-amber-300/70 mb-3">
            Some positions represent a large portion of your portfolio.
            Consider diversifying to reduce risk.
          </p>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-900/30"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-100">
                    {alert.ticker || alert.name}
                  </span>
                </div>
                <span className="text-sm text-amber-300">
                  {alert.percentage.toFixed(1)}% of portfolio
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
