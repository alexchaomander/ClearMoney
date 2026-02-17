"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExecutionSnippetProps {
  label: string;
  value: string;
  copyValue?: string;
}

export function ExecutionSnippet({ label, value, copyValue }: ExecutionSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = copyValue || value;
    // Clean up value for form entry (remove $ and commas)
    const cleanValue = textToCopy.replace(/[$,]/g, "");
    
    navigator.clipboard.writeText(cleanValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between group">
      <div>
        <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-0.5">
          {label}
        </div>
        <div className="text-sm font-mono text-emerald-400 truncate max-w-[180px]">
          {value}
        </div>
      </div>
      
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-all ${
          copied ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-900 text-neutral-500 hover:text-white"
        }`}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Check className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Copy className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
