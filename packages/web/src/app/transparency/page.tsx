"use client";

import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PayoutDisclosure } from "@/components/dashboard/PayoutDisclosure";
import { MethodologyAuditLog } from "@/components/dashboard/MethodologyAuditLog";
import { ShieldCheck } from "lucide-react";

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3 h-3" />
            Radical Transparency
          </div>
          <h1 className="font-display text-4xl text-white mb-4">The Trust Hub</h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            We believe financial advice should be auditable. Here, we disclose our incentives, 
            publish our math changes, and prove our independence.
          </p>
        </motion.div>

        <div className="grid gap-16">
          <section>
            <PayoutDisclosure />
          </section>

          <section className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <MethodologyAuditLog />
            </div>
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 sticky top-24">
                <h3 className="font-display text-lg text-white mb-4">Our Promise</h3>
                <ul className="space-y-4">
                  {[
                    "We never sell your data to third parties.",
                    "We prioritize your financial health over affiliate revenue.",
                    "We use bank-grade encryption for all connections.",
                    "We open-source our core methodology."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
