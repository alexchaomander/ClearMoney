"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ApiErrorStateProps {
  message?: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ApiErrorState({
  message = "Something went wrong loading your data.",
  error,
  onRetry,
}: ApiErrorStateProps) {
  const isApiErrorLike = (value: unknown): value is { status: number; detail?: string } =>
    !!value &&
    typeof value === "object" &&
    "status" in value &&
    typeof (value as { status?: unknown }).status === "number";

  const detail =
    isApiErrorLike(error)
      ? error.detail || `${error.status}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="font-serif text-xl text-slate-900 dark:text-white mb-2">
        Unable to Load Data
      </h3>
      <p className={`text-slate-600 dark:text-slate-400 max-w-md ${detail ? "mb-2" : "mb-6"}`}>
        {message}
      </p>
      {detail && (
        <p className="text-xs text-slate-500 mb-6">
          {detail}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}
