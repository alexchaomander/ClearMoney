"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, Shield, TrendingUp, PieChart, Plus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 relative z-10"
      >
        {/* Illustrative Icon Composition */}
        <div className="relative mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20"
          >
            <Wallet className="w-12 h-12 text-white" />
          </motion.div>
          
          {/* Small floating elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5 text-emerald-500" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-2 -left-6 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg"
          >
            <Link2 className="w-6 h-6 text-brand-500" />
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-serif text-4xl sm:text-5xl text-slate-900 dark:text-white mb-6 tracking-tight"
        >
          Your financial data <br /><span className="text-emerald-600 dark:text-emerald-400">needs a surface</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
        >
          ClearMoney builds a real-time context graph of your wealth. 
          Connect your first institution to unlock decision traces, 
          scenario modeling, and autonomous growth.
        </motion.p>

        {/* CTA Button with Spring Effect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20 border-0 transition-all">
            <Link href="/connect">
              Connect My First Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>

        {/* Features / Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full"
        >
          {[
            {
              icon: TrendingUp,
              title: "Unified Net Worth",
              description: "Every asset and liability in one high-fidelity view.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/5 dark:bg-emerald-500/10"
            },
            {
              icon: PieChart,
              title: "Smart Allocation",
              description: "Understand your risk across all institutions instantly.",
              color: "text-brand-500",
              bg: "bg-brand-500/5 dark:bg-brand-500/10"
            },
            {
              icon: Shield,
              title: "Proof of Sovereignty",
              description: "Your data is encrypted and stays under your control.",
              color: "text-amber-500",
              bg: "bg-amber-500/5 dark:bg-amber-500/10"
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
