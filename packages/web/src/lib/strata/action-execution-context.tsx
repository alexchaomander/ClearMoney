"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ActionIntent } from "@clearmoney/strata-sdk";
import { useActionIntent, useUpdateActionIntent } from "@/lib/strata/hooks";
import { GhostSidebar } from "@/components/action-lab/GhostSidebar";
import { AnimatePresence } from "framer-motion";

interface ActionExecutionContextType {
  activeIntentId: string | null;
  startExecution: (intentId: string) => void;
  stopExecution: () => void;
  isExecuting: boolean;
}

const ActionExecutionContext = createContext<ActionExecutionContextType | undefined>(undefined);

export function ActionExecutionProvider({ children }: { children: ReactNode }) {
  const [activeIntentId, setActiveIntentId] = useState<string | null>(null);
  const { data: intent } = useActionIntent(activeIntentId || "", { 
    enabled: !!activeIntentId 
  });
  const updateIntent = useUpdateActionIntent();

  const startExecution = (intentId: string) => {
    setActiveIntentId(intentId);
  };

  const stopExecution = () => {
    setActiveIntentId(null);
  };

  const handleComplete = async () => {
    if (activeIntentId) {
      try {
        // Mark as pending approval/verification in backend
        await updateIntent.mutateAsync({
          id: activeIntentId,
          data: { status: "pending_approval" }
        });
        stopExecution();
      } catch (err) {
        console.error("Failed to mark intent as complete", err);
        // Sidebar remains open for retry
      }
    }
  };

  return (
    <ActionExecutionContext.Provider value={{
      activeIntentId,
      startExecution,
      stopExecution,
      isExecuting: !!activeIntentId
    }}>
      {children}
      
      <AnimatePresence>
        {activeIntentId && intent && (
          <GhostSidebar 
            intent={intent} 
            onClose={stopExecution} 
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </ActionExecutionContext.Provider>
  );
}

export function useActionExecution() {
  const context = useContext(ActionExecutionContext);
  if (context === undefined) {
    throw new Error("useActionExecution must be used within an ActionExecutionProvider");
  }
  return context;
}
