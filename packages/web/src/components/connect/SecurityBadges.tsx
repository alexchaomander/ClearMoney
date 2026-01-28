"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Lock } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/shared/animations";

const securityBadges = [
  { icon: Shield, label: "Bank-grade security" },
  { icon: Eye, label: "Read-only access" },
  { icon: Lock, label: "Your data, your control" },
];

export function SecurityBadges() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-wrap items-center justify-center gap-4"
    >
      {securityBadges.map((badge) => (
        <motion.div
          key={badge.label}
          variants={staggerItem}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800"
        >
          <badge.icon className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-neutral-200">
            {badge.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
