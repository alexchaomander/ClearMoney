"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChevronRight,
  Loader2,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import {
  useAvailableSkills,
  useCreateAdvisorSession,
  useRecommendations,
} from "@/lib/strata/hooks";
import { useStrataClient } from "@/lib/strata/client";
import type { AdvisorSession, SkillSummary } from "@clearmoney/strata-sdk";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: { name: string; result: string }[];
}

function SkillCard({
  skill,
  onSelect,
}: {
  skill: SkillSummary;
  onSelect: (name: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(skill.name)}
      className="text-left p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-800/60 hover:bg-neutral-900/80 transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-neutral-100 text-sm">
          {skill.display_name}
        </h3>
        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
      </div>
      <p className="text-xs text-neutral-500 line-clamp-2">
        {skill.description}
      </p>
    </button>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-neutral-800 text-neutral-300"
            : "bg-emerald-900/40 text-emerald-400"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
          isUser
            ? "bg-neutral-800 text-neutral-100"
            : "bg-neutral-900 border border-neutral-800 text-neutral-200"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tc, i) => (
              <div
                key={i}
                className="text-xs bg-neutral-800/50 rounded-lg px-2 py-1 text-neutral-400"
              >
                <Sparkles className="w-3 h-3 inline mr-1 text-emerald-500" />
                Used: {tc.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdvisorPage() {
  const { data: availableSkills, isLoading: skillsLoading } =
    useAvailableSkills();
  const { data: recommendations } = useRecommendations();
  const createSession = useCreateAdvisorSession();
  const client = useStrataClient();

  const [activeSession, setActiveSession] = useState<AdvisorSession | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = useCallback(
    async (skillName?: string) => {
      const session = await createSession.mutateAsync(skillName);
      setActiveSession(session);
      setMessages([]);
    },
    [createSession]
  );

  const sendMessage = useCallback(async () => {
    if (!activeSession || !input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const stream = await client.sendAdvisorMessage(
        activeSession.id,
        userMessage
      );

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const toolCalls: { name: string; result: string }[] = [];

      // Add a placeholder assistant message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", toolCalls: [] },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") continue;
          if (data.startsWith("[ERROR:")) continue;

          // Check for tool call markers
          const toolMatch = data.match(/^\[TOOL:(\w+):(.*)\]$/);
          if (toolMatch) {
            toolCalls.push({
              name: toolMatch[1],
              result: toolMatch[2],
            });
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                last.toolCalls = [...toolCalls];
              }
              return updated;
            });
            continue;
          }

          assistantContent += data;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              last.content = assistantContent;
            }
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error. The Anthropic API key may not be configured. Please check your settings.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [activeSession, input, isStreaming, client]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 lg:px-8">
        <ConsentGate
          scopes={[
            "agent:read",
            "decision_traces:read",
            "portfolio:read",
            "transactions:read",
            "accounts:read",
            "memory:read",
          ]}
          purpose="Provide personalized advisor sessions using your linked accounts and transaction data."
          className="mt-10"
        >
        {!activeSession ? (
          /* Skill Picker / Landing */
          <div className="flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-900/30 flex items-center justify-center">
                <Bot className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="font-serif text-3xl text-white mb-2">
                Financial Advisor
              </h1>
              <p className="text-neutral-400 max-w-md mx-auto">
                AI-powered financial planning that uses your actual data. Choose
                a topic or start a general conversation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => startSession()}
                className="w-full mb-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Start a General Conversation
              </button>

              {skillsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 rounded-xl bg-neutral-800/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
                    Or choose a topic
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSkills?.map((skill) => (
                      <SkillCard
                        key={skill.name}
                        skill={skill}
                        onSelect={startSession}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
                  Recent Recommendations
                </p>
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-neutral-900 border border-neutral-800"
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-100">
                            {rec.title}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {rec.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Chat Interface */
          <>
            {/* Chat header */}
            <div className="py-4 border-b border-neutral-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-100">
                    Financial Advisor
                  </p>
                  <p className="text-xs text-neutral-500">
                    {activeSession.skill_name
                      ? activeSession.skill_name.replace(/_/g, " ")
                      : "General conversation"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSession(null);
                  setMessages([]);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                New Topic
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
              </AnimatePresence>

              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/40 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-neutral-900 border border-neutral-800">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="py-4 border-t border-neutral-800/60">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances..."
                  rows={1}
                  className="flex-1 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="px-4 rounded-xl bg-emerald-800 text-emerald-100 hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-600 mt-2 text-center">
                Educational analysis only — not financial advice. Consult a
                professional for personalized guidance.
              </p>
            </div>
          </>
        )}
        </ConsentGate>
      </main>
    </div>
  );
}
