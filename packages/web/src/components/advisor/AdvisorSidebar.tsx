"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  MessageSquare,
  ChevronRight,
  EyeOff,
  Maximize2,
  Minimize2,
  Terminal,
  Activity
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  useAvailableSkills, 
  useCreateAdvisorSession,
  useAdvisorSessions
} from "@/lib/strata/hooks";
import { useStrataClient } from "@/lib/strata/client";
import { AdvisorMessage } from "./AdvisorMessage";
import type { AdvisorSession, SkillSummary } from "@clearmoney/strata-sdk";

const PAGE_SKILL_MAPPING: Record<string, string> = {
  "/dashboard/founder-operating-room": "financial_checkup",
  "/dashboard/taxes": "tax_optimization",
  "/dashboard/investing": "investment_review",
  "/dashboard/debt": "debt_payoff",
  "/dashboard/scenario-lab": "retirement_planning",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: { name: string; result: string }[];
}

export function AdvisorSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { data: availableSkills } = useAvailableSkills();
  const createSession = useCreateAdvisorSession();
  const client = useStrataClient();

  const [activeSession, setActiveSession] = useState<AdvisorSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [vanishMode, setVanishMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-suggest skill based on current page
  const currentSkillName = PAGE_SKILL_MAPPING[pathname] || null;
  const currentSkill = availableSkills?.find(s => s.name === currentSkillName);

  const isVisible = pathname.startsWith("/dashboard") || pathname.startsWith("/advisor");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = useCallback(async (skillName?: string) => {
    const session = await createSession.mutateAsync({ 
      skillName: skillName || currentSkillName || undefined, 
      vanishMode 
    });
    setActiveSession(session);
    setMessages([]);
  }, [createSession, currentSkillName, vanishMode]);

  const sendMessage = useCallback(async () => {
    if (!activeSession || !input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const stream = await client.sendAdvisorMessage(activeSession.id, userMessage);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const toolCalls: { name: string; result: string }[] = [];

      setMessages((prev) => [...prev, { role: "assistant", content: "", toolCalls: [] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("
");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          if (data.startsWith("[ERROR:")) continue;

          const toolMatch = data.match(/^\[TOOL:(\w+):(.*)\]$/);
          if (toolMatch) {
            toolCalls.push({ name: toolMatch[1], result: toolMatch[2] });
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") last.toolCalls = [...toolCalls];
              return updated;
            });
            continue;
          }

          assistantContent += data;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") last.content = assistantContent;
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "I encountered an error. Check your API configuration." }
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [activeSession, input, isStreaming, client]);

  if (!isVisible) return null;

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={false}
        animate={{ 
          scale: isOpen ? 0.9 : 1, 
          opacity: 1,
          boxShadow: isStreaming ? [
            "0 0 0 0px rgba(16, 185, 129, 0)",
            "0 0 0 10px rgba(16, 185, 129, 0.2)",
            "0 0 0 0px rgba(16, 185, 129, 0)"
          ] : "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
        }}
        transition={isStreaming ? { 
          repeat: Infinity, 
          duration: 2,
          boxShadow: { repeat: Infinity, duration: 2 }
        } : {}}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
          isOpen ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-600 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0, width: isExpanded ? "600px" : "400px" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[90] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-white">Financial Advisor</h2>
                    <div className="flex items-center gap-2">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Context Aware</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:block"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!activeSession ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {currentSkill && (
                      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Recommended Skill</span>
                        </div>
                        <h3 className="font-display text-lg text-white mb-1">{currentSkill.display_name}</h3>
                        <p className="text-xs text-slate-400 mb-4">{currentSkill.description}</p>
                        <button 
                          onClick={() => startSession(currentSkill.name)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                          Start This Analysis
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Assistance</p>
                      <button 
                        onClick={() => startSession()}
                        className="w-full p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">General Chat</span>
                          <MessageSquare className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500">Ask anything about your data surface.</p>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vanish Mode</p>
                        <button
                          onClick={() => setVanishMode(!vanishMode)}
                          className={cn(
                            "relative w-10 h-5 rounded-full transition-colors",
                            vanishMode ? "bg-purple-600" : "bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                            vanishMode && "translate-x-5"
                          )} />
                        </button>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-850/50 border border-slate-800">
                        <EyeOff className={cn("w-4 h-4 shrink-0 mt-0.5", vanishMode ? "text-purple-400" : "text-slate-600")} />
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          When active, session data is not persisted to your account history. Perfect for &quot;What-If&quot; scenarios.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Session</span>
                        <div className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[8px] font-mono">
                          {activeSession.skill_name?.toUpperCase() || "GENERAL"}
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveSession(null)}
                        className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="flex-1 space-y-4 pb-4">
                      {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1",
                            msg.role === "user" ? "bg-slate-800 text-slate-400" : "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50"
                          )}>
                            {msg.role === "user" ? <Terminal className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>
                          <div className={cn(
                            "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                            msg.role === "user" ? "bg-slate-800 text-white" : "bg-slate-850/50 border border-slate-800 text-slate-200"
                          )}>
                            {msg.role === "assistant" ? (
                              <AdvisorMessage content={msg.content} />
                            ) : (
                              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                            )}
                            {msg.toolCalls && msg.toolCalls.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {msg.toolCalls.map((tc, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-emerald-500/70">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {tc.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isStreaming && messages[messages.length - 1]?.content === "" && (
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-lg bg-emerald-950/50 flex items-center justify-center shrink-0 border border-emerald-900/50">
                            <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                          </div>
                          <div className="bg-slate-850/50 border border-slate-800 rounded-xl px-4 py-3">
                            <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce" />
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Input */}
              {activeSession && (
                <div className="p-6 border-t border-slate-800 bg-slate-850/50">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <div className="relative flex gap-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Ask about your financial graph..."
                        rows={1}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isStreaming}
                        className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:grayscale shadow-lg shadow-emerald-900/20 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-3 text-center uppercase tracking-widest font-bold">
                    Educational analysis only &middot; Not financial advice
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
