"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Newspaper,
  Activity,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VALUATIONS } from "@/lib/constants";
import type { PostMeta } from "@/lib/content/types";

export function BlogPageClient({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-emerald-500/30">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
              Clear<span className="text-emerald-600 dark:text-emerald-400">Money</span> <span className="text-slate-400 font-normal">Intelligence</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              Open Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Market Ticker */}
      <div className="bg-slate-900 text-white overflow-hidden whitespace-nowrap h-10 flex items-center">
        <div className="animate-marquee flex gap-12 items-center px-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2 shrink-0">
            <Activity className="w-3 h-3" /> Live Valuations
          </span>
          {VALUATIONS.map((v, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold text-slate-400">{v.program}</span>
              <span className="font-mono text-xs font-bold">{v.value}</span>
              <span className={cn(
                "text-[10px] font-bold",
                v.delta.startsWith("+") ? "text-emerald-400" : v.delta.startsWith("-") ? "text-rose-400" : "text-slate-500"
              )}>{v.delta}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-12 gap-16">

          {/* Main Column */}
          <div className="lg:col-span-8 space-y-20">
            <section>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                <Newspaper className="w-3 h-3" />
                Latest Analysis
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                Independent research <br />
                for the <span className="italic underline decoration-emerald-500/30 underline-offset-8">sovereign mind.</span>
              </h1>

              <div className="space-y-12 mt-16">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <article className="grid md:grid-cols-4 gap-8">
                      <div className="md:col-span-1">
                        <time className="text-xs font-mono text-slate-400">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          }).toUpperCase()}
                        </time>
                      </div>
                      <div className="md:col-span-3">
                        <h2 className="font-display text-2xl md:text-3xl text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-4">
                          {post.title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
                          {post.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:gap-3 transition-all">
                          READ ANALYSIS <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            {/* Independence Pledge */}
            <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="font-display text-2xl mb-4">The Independence Pledge</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                We will never recommend a product because of affiliate payout. Every piece of advice is backed by
                a hierarchical logic trace.
              </p>
              <Link href="/transparency" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-2 uppercase tracking-widest">
                See Our Audit Log <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Newsletter */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-display text-xl mb-2 text-slate-900 dark:text-white">Field Notes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Weekly experiments in financial portability, yield optimization, and market math.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-sm hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Research Sectors</h4>
              <div className="flex flex-wrap gap-2">
                {["Credit Strategy", "Tax Harvest", "Yield Arbitrage", "ACATS Rollover", "Equity Comp"].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Style for Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
