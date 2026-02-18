"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiometricOverlayProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  amount?: string;
}

export function BiometricOverlay({
  isOpen,
  onSuccess,
  onCancel,
  title = "Confirm Action",
  amount,
}: BiometricOverlayProps) {
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle");

  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
    }
  }, [isOpen]);

  const handleStartScan = () => {
    setStatus("scanning");
    // Simulate biometric delay
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onSuccess();
      }, 800);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className="p-3 rounded-2xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <h2 className="font-display text-2xl text-white mb-2">{title}</h2>
                {amount && (
                  <p className="font-mono text-3xl font-bold text-emerald-400 mb-4">{amount}</p>
                )}
                <p className="text-sm text-slate-400 mb-8">
                  Verify your identity to authorize this secure maneuver on the Strata Action Layer.
                </p>

                <div className="flex justify-center mb-10">
                  <button
                    onClick={status === "idle" ? handleStartScan : undefined}
                    disabled={status !== "idle"}
                    className="relative group"
                  >
                    {/* Ring animations */}
                    <AnimatePresence>
                      {status === "scanning" && (
                        <>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 rounded-full border-2 border-emerald-500/50"
                          />
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                            className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                          />
                        </>
                      )}
                    </AnimatePresence>

                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-4",
                      status === "idle" ? "bg-slate-800 border-slate-700 text-slate-400 group-hover:bg-slate-700 group-hover:border-emerald-500/50 group-hover:text-emerald-400" :
                      status === "scanning" ? "bg-emerald-900/20 border-emerald-500/50 text-emerald-400" :
                      "bg-emerald-500 border-emerald-400 text-white"
                    )}>
                      {status === "success" ? (
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                          <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                      ) : status === "scanning" ? (
                        <Loader2 className="w-12 h-12 animate-spin" />
                      ) : (
                        <Fingerprint className="w-12 h-12" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {status === "idle" ? (
                    <button
                      onClick={onCancel}
                      className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
                    >
                      Cancel Transaction
                    </button>
                  ) : (
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-widest animate-pulse",
                      status === "scanning" ? "text-amber-400" : "text-emerald-400"
                    )}>
                      {status === "scanning" ? "Scanning Biometrics..." : "Identity Verified"}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}

// Simple portal helper to mount at root
function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div id="biometric-portal">
      {children}
    </div>,
    document.body
  );
}
