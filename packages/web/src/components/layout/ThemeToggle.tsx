"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
        theme === "dark" ? "bg-slate-800" : "bg-slate-200",
        className
      )}
      aria-label="Toggle Theme"
    >
      <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none">
        <Moon className={cn("w-3.5 h-3.5", theme === "dark" ? "text-emerald-400" : "text-slate-400")} />
        <Sun className={cn("w-3.5 h-3.5", theme === "light" ? "text-amber-500" : "text-slate-500")} />
      </div>
      
      <motion.div
        className="relative z-10 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{
          x: theme === "dark" ? 0 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {theme === "dark" ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
            >
              <Moon className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
            >
              <Sun className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
