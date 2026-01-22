"use client";

import React, { useState } from "react";
import { Mail, Shield, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  /** Variant style */
  variant?: "inline" | "card" | "minimal";
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Additional className */
  className?: string;
}

/**
 * NewsletterSignup - Trust-focused email signup component
 *
 * Variants:
 * - inline: Horizontal layout for sidebars
 * - card: Full card with more details (homepage)
 * - minimal: Just the input for footers
 */
export function NewsletterSignup({
  variant = "card",
  title = "Financial clarity, delivered",
  description = "Weekly insights on making smarter money decisions. No affiliate pitches. No sponsored content. Just math.",
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Placeholder - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, always show success (placeholder)
    setStatus("success");
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  const trustSignals = [
    "No spam, ever",
    "Unsubscribe anytime",
    "Your data stays private",
  ];

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-500 transition-colors"
            disabled={status === "loading" || status === "success"}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || status === "success" || !email}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            status === "success"
              ? "bg-success-500 text-white"
              : "bg-brand-500 hover:bg-brand-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : status === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border border-neutral-800 bg-neutral-900/50",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-brand-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Stay informed</h3>
        </div>
        <p className="text-xs text-neutral-500 mb-3">
          Weekly financial insights. No affiliate links.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-500 transition-colors"
            disabled={status === "loading" || status === "success"}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success" || !email}
            className={cn(
              "w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              status === "success"
                ? "bg-success-500 text-white"
                : "bg-brand-500 hover:bg-brand-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {status === "loading" ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : status === "success" ? (
              <>
                <Check className="w-4 h-4" />
                Subscribed!
              </>
            ) : (
              <>
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900",
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                disabled={status === "loading" || status === "success"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "success" || !email}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-w-[140px]",
                status === "success"
                  ? "bg-success-500 text-white"
                  : "bg-brand-500 hover:bg-brand-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {status === "loading" ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : status === "success" ? (
                <>
                  <Check className="w-5 h-5" />
                  Subscribed!
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Trust promise:</span>
          </div>
          {trustSignals.map((signal) => (
            <div
              key={signal}
              className="flex items-center gap-1.5 text-xs text-neutral-400"
            >
              <div className="w-1 h-1 rounded-full bg-brand-500" />
              {signal}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsletterSignup;
