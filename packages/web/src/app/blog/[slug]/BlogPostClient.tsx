"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  Share2,
  Zap,
  Cpu,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/content/types";

interface BlogPostClientProps {
  post: Post;
  accentColor: string;
  categoryName: string;
}

export function BlogPostClient({ post, accentColor, categoryName }: BlogPostClientProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-emerald-500/30">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Editorial Header Nav */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Research</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg tracking-tight hidden sm:block">
              Clear<span className="text-emerald-600 dark:text-emerald-400 font-bold">Money</span>
            </span>
          </Link>

          <Link href="/dashboard" className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all">
            Open Dashboard
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Article Hero */}
        <section className="relative pt-24 pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-900">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div
            className="absolute top-0 right-0 w-1/2 h-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${accentColor}, transparent 70%)`
            }}
          />

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Sector Analysis</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{categoryName}</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display text-slate-900 dark:text-white leading-[0.95] tracking-tight mb-8"
            >
              {post.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-6 pt-8 border-t border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{post.author}</p>
                  <p className="text-slate-500">Protocol Architect</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTime || "8 min read"}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">Independence Verified</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-12 gap-16">

            {/* Sidebar Left: Engagement */}
            <aside className="hidden lg:block lg:col-span-1 pt-4">
              <div className="sticky top-32 flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/50 transition-all">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share</span>
                </div>
                <div className="w-px h-20 bg-slate-200 dark:bg-slate-800" />
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-7">
              <div className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:font-display prose-headings:tracking-tight
                prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6
                prose-p:text-lg prose-p:leading-[1.7] prose-p:text-slate-600 dark:prose-p:text-slate-400
                prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/50 dark:prose-blockquote:bg-emerald-950/20 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl
                prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              ">
                <div
                  dangerouslySetInnerHTML={{
                    __html: post.content
                      .replace(/^# .+\n/, "")
                      .replace(/\n## /g, '\n<h2 class="font-display tracking-tight text-slate-900 dark:text-white">')
                      .replace(/\n### /g, '\n<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">')
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.+?)\*/g, "<em>$1</em>")
                      .replace(/^- (.+)$/gm, "<li>$1</li>")
                      .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-6 my-6 space-y-2">$&</ul>')
                      .replace(/---/g, '<hr class="my-16 border-slate-200 dark:border-slate-800">')
                  }}
                />
              </div>

              {/* Maneuver Bridge CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-20 p-8 rounded-[2.5rem] bg-slate-900 dark:bg-[#020617] text-white shadow-2xl border border-slate-800 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-emerald-400 mb-4">
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ready to Execute?</span>
                  </div>
                  <h3 className="font-display text-3xl mb-4">Draft this maneuver.</h3>
                  <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
                    Based on this analysis, our agent can draft the necessary intents in your War Room. No manual forms required.
                  </p>
                  <Link href="/dashboard/war-room" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold hover:bg-emerald-400 transition-all">
                    Open the War Room
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
              </motion.div>
            </div>

            {/* Sidebar Right: Live Lab */}
            <aside className="lg:col-span-4 space-y-12">
              <div className="sticky top-32 space-y-12">

                {/* Live Valuations Widget */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Lab Context</span>
                  </div>

                  <h4 className="font-display text-xl text-slate-900 dark:text-white mb-4">The Rewards Index</h4>
                  <div className="space-y-4">
                    {[
                      { name: "Chase UR", val: "2.05 cpp", status: "STABLE" },
                      { name: "Amex MR", val: "1.80 cpp", status: "WEAK" },
                      { name: "Bilt Points", val: "2.10 cpp", status: "STRONG" }
                    ].map(item => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-slate-900 dark:text-emerald-400">{item.val}</p>
                          <p className={cn(
                            "text-[8px] font-black",
                            item.status === "STRONG" ? "text-emerald-500" : item.status === "WEAK" ? "text-rose-500" : "text-slate-500"
                          )}>{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Check Your Specific Math
                  </button>
                </div>

                {/* Transparency Summary */}
                <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Audit Disclosure</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    &quot;ClearMoney maintains editorial independence. This analysis is computed via the PROTOCOL_V4 methodology ledger and is not influenced by affiliate partnerships.&quot;
                  </p>
                </div>

              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-20 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 mb-8">
            <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h2 className="font-display text-3xl text-slate-900 dark:text-white mb-4">Financial intelligence, clarified.</h2>
          <p className="text-slate-500 mb-10 max-w-md mx-auto">
            Stop trusting marketing. Start trusting math. Open your Financial OS today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all">
              Go to Dashboard
            </Link>
            <Link href="/blog" className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
              All Research
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
