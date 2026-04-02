"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, AlertTriangle, BriefcaseBusiness, FlaskConical } from "lucide-react";
import { captureAnalyticsEvent, rememberFounderFunnelSource } from "@/lib/analytics";

const isProduction = process.env.NODE_ENV === "production";
const configuredCodes = (process.env.NEXT_PUBLIC_BETA_CODES ?? "")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);
const VALID_CODES = configuredCodes.length > 0
  ? configuredCodes
  : isProduction
    ? []
    : ["CLEARMONEY2026"];

export default function InvitePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inviteConfigured = VALID_CODES.length > 0;

  useEffect(() => {
    rememberFounderFunnelSource("invite");
    captureAnalyticsEvent("founder_invite_viewed", {
      invite_configured: inviteConfigured,
    });
  }, [inviteConfigured]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteConfigured) {
      captureAnalyticsEvent("founder_invite_submit_blocked", {
        reason: "invite_not_configured",
      });
      setError("Beta access is not configured yet. Please contact beta@clearmoney.com.");
      return;
    }
    if (VALID_CODES.includes(code.trim().toUpperCase())) {
      // 90-day expiry — aligned with expected beta program duration
      document.cookie = `cm_beta_access=1; path=/; max-age=7776000; SameSite=Lax${isProduction ? "; Secure" : ""}`;
      rememberFounderFunnelSource("private_beta");
      captureAnalyticsEvent("founder_invite_accepted", {
        destination: "/onboarding",
      });
      router.push("/onboarding?role=Founder&source=Private%20Beta");
    } else {
      captureAnalyticsEvent("founder_invite_rejected", {
        reason: "invalid_code",
      });
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
          Founder-first beta for people who want runway, tax pressure, and money decisions explained with the math in plain sight.
        </p>

        <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">What happens next</p>
              <p>1. Personalize your founder profile.</p>
              <p>2. Connect accounts or start with manual context.</p>
              <p>3. Land on a dashboard that highlights runway, tax pressure, and data confidence.</p>
            </div>
          </div>
        </div>

        {!inviteConfigured && (
          <div className="mb-6 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <p>
                Beta access is not configured for this environment yet. Contact{" "}
                <a href="mailto:beta@clearmoney.com" className="font-semibold underline underline-offset-2">
                  beta@clearmoney.com
                </a>{" "}
                for access.
              </p>
            </div>
          </div>
        )}

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
            disabled={!inviteConfigured}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={!inviteConfigured}
            className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            Enter Beta
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <FlaskConical className="h-3.5 w-3.5" />
          Need an invite or hit a launch bug? Contact{" "}
          <a href="mailto:beta@clearmoney.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            beta@clearmoney.com
          </a>
        </div>
      </div>
    </div>
  );
}
