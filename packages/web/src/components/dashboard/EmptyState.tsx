"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, Shield, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-20 h-20 rounded-2xl bg-emerald-900/50 border border-emerald-800/50 flex items-center justify-center mb-8"
      >
        <Wallet className="w-10 h-10 text-emerald-400" />
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-serif text-3xl sm:text-4xl text-white mb-4"
      >
        Connect Your First Account
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-neutral-400 text-lg max-w-md mb-8"
      >
        Link your investment accounts to get a complete view of your portfolio,
        track your net worth, and see your asset allocation.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button asChild size="lg">
          <Link href="/connect">
            Connect Accounts
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid sm:grid-cols-3 gap-6 mt-12 max-w-2xl"
      >
        {[
          {
            icon: TrendingUp,
            title: "Track Net Worth",
            description: "See your total assets and liabilities in one place",
          },
          {
            icon: PieChart,
            title: "Asset Allocation",
            description: "Understand how your investments are distributed",
          },
          {
            icon: Shield,
            title: "Bank-Level Security",
            description: "256-bit encryption keeps your data safe",
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
            className="p-4 rounded-xl bg-slate-900/50 border border-slate-800"
          >
            <feature.icon className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-white font-medium mb-1">{feature.title}</h3>
            <p className="text-neutral-500 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
