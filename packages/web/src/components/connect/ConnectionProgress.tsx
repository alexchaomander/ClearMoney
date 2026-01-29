"use client";

import { motion } from "framer-motion";

interface ConnectionProgressProps {
  connected: number;
  total: number;
}

export function ConnectionProgress({ connected, total }: ConnectionProgressProps) {
  const percentage = total > 0 ? (connected / total) * 100 : 0;

  return (
    <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-emerald-200">
          Connection Progress
        </span>
        <span className="text-sm text-emerald-400">
          {connected} of {total} accounts connected
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-emerald-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-emerald-500"
        />
      </div>
    </div>
  );
}
