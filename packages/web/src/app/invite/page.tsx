"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";

const VALID_CODES = (process.env.NEXT_PUBLIC_BETA_CODES ?? "CLEARMONEY2026")
  .split(",")
  .map((c) => c.trim().toUpperCase());

export default function InvitePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(code.trim().toUpperCase())) {
      document.cookie = "cm_beta_access=1; path=/; max-age=31536000; SameSite=Lax";
      router.push("/onboarding");
    } else {
      setError("Invalid invite code. Please check your email for the correct code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-8">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white mb-3">
          Private Beta Access
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
          ClearMoney is currently in private beta. Enter your invite code to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="Enter invite code"
            className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg tracking-widest uppercase"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            Enter Beta
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400">
          Need an invite? Contact{" "}
          <a href="mailto:beta@clearmoney.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            beta@clearmoney.com
          </a>
        </p>
      </div>
    </div>
  );
}
