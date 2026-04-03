"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Briefcase, Coins, Landmark, Wallet, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { captureAnalyticsEvent, readFounderFunnelSource } from "@/lib/analytics";
import {
  getFounderManualOptions,
  shouldTrackFounderManualContext,
  type FounderManualCategory,
  type FounderManualEntryPoint,
  type FounderPriorityStage,
} from "@/lib/founder-activation";
import { AddAccountModal, type AddAccountTab } from "@/components/dashboard/AddAccountModal";

const ICONS = {
  cash: Wallet,
  debt: Coins,
  investment: Landmark,
  equity: Briefcase,
} satisfies Record<FounderManualCategory, typeof Wallet>;

interface FounderManualContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: FounderPriorityStage;
  entryPoint: FounderManualEntryPoint;
}

export function FounderManualContextDialog({
  open,
  onOpenChange,
  stage,
  entryPoint,
}: FounderManualContextDialogProps) {
  const [selectedTab, setSelectedTab] = useState<AddAccountTab>("cash");
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const source = readFounderFunnelSource() ?? "unknown";
  const options = useMemo(() => getFounderManualOptions(stage), [stage]);

  useEffect(() => {
    if (!open) {
      setShowAddModal(false);
      setHasSubmitted(false);
      setHasTrackedOpen(false);
      return;
    }

    if (hasTrackedOpen || !shouldTrackFounderManualContext(stage)) {
      return;
    }

    captureAnalyticsEvent("founder_manual_context_opened", {
      source,
      stage,
      entry_point: entryPoint,
    });
    setHasTrackedOpen(true);
  }, [entryPoint, hasTrackedOpen, open, source, stage]);

  const closeAll = () => {
    if (!hasSubmitted && shouldTrackFounderManualContext(stage)) {
      captureAnalyticsEvent("founder_manual_context_closed", {
        source,
        stage,
        entry_point: entryPoint,
        selected_tab: showAddModal ? selectedTab : null,
      });
    }
    setShowAddModal(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog.Root open={open && !showAddModal} onOpenChange={(nextOpen) => !nextOpen && closeAll()}>
        <AnimatePresence>
          {open && !showAddModal ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ type: "spring", damping: 24, stiffness: 260 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <div
                    className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                    data-testid="founder-manual-context-dialog"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 px-8 py-7 dark:border-slate-800">
                      <div className="max-w-xl">
                        <Dialog.Title className="font-serif text-3xl text-slate-900 dark:text-white">
                          Add founder context without linking yet
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          Manual context keeps the dashboard useful today, but it does not replace live balances.
                          Choose the fastest input you can add now, then upgrade to real sources when you are ready.
                        </Dialog.Description>
                      </div>
                      <Dialog.Close asChild>
                        <button className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">
                          <X className="h-5 w-5" />
                        </button>
                      </Dialog.Close>
                    </div>

                    <div className="grid gap-4 p-8 md:grid-cols-2">
                      {options.map((option) => {
                        const Icon = ICONS[option.category];

                        return (
                          <button
                            key={option.category}
                            type="button"
                            onClick={() => {
                              setSelectedTab(option.defaultTab);
                              captureAnalyticsEvent(
                                "founder_manual_context_category_selected",
                                {
                                  source,
                                  stage,
                                  entry_point: entryPoint,
                                  category: option.category,
                                }
                              );
                              setShowAddModal(true);
                            }}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                            data-testid={`founder-manual-option-${option.category}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                  <Icon className="h-3 w-3" />
                                  {option.label}
                                </div>
                                {option.recommended ? (
                                  <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                                    Recommended first
                                  </div>
                                ) : null}
                              </div>
                              <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                              {option.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                              {option.description}
                            </p>
                            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                              {option.detail}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 px-8 py-5 dark:border-slate-800">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Manual fallback is useful for orientation. Live sources are still required for decision-grade runway, tax timing, and balance freshness.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>

      <AddAccountModal
        open={open && showAddModal}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (!hasSubmitted && shouldTrackFounderManualContext(stage)) {
              captureAnalyticsEvent("founder_manual_context_closed", {
                source,
                stage,
                entry_point: entryPoint,
                selected_tab: selectedTab,
              });
            }
            setShowAddModal(false);
            onOpenChange(false);
          }
        }}
        defaultTab={selectedTab}
        title="Add founder context"
        description="Start with the highest-signal manual input you can add right now. You can still switch tabs if another asset type is more urgent."
        onTabChange={(tab) => setSelectedTab(tab)}
        onSubmitSuccess={(tab) => {
          setHasSubmitted(true);
          captureAnalyticsEvent("founder_manual_context_submitted", {
            source,
            stage,
            entry_point: entryPoint,
            selected_tab: tab,
          });
        }}
      />
    </>
  );
}
