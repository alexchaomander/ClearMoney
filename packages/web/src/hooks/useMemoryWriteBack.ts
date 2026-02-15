"use client";

import { useCallback } from "react";
import { useFinancialMemory, useUpdateMemory, useConsentStatus } from "@/lib/strata/hooks";
import type { FinancialMemory, FinancialMemoryUpdate, MemoryEventSource } from "@clearmoney/strata-sdk";

/**
 * Hook that writes calculator values back to Financial Memory when they differ.
 *
 * Returns a function that takes a mapping of memory field -> value, and
 * optionally a source context string. Only writes fields whose values
 * actually differ from the current memory.
 */
export function useMemoryWriteBack() {
  const { hasConsent } = useConsentStatus(["memory:read", "memory:write"]);
  const { data: memory } = useFinancialMemory({ enabled: hasConsent });
  const updateMemory = useUpdateMemory();

  return useCallback(
    (
      values: Partial<Record<keyof FinancialMemory, unknown>>,
      sourceContext?: string,
      source: MemoryEventSource = "calculator"
    ) => {
      if (!memory) return;

      const changes: Record<string, unknown> = {};
      let hasChanges = false;

      for (const [field, newValue] of Object.entries(values)) {
        const key = field as keyof FinancialMemory;
        const currentValue = memory[key];

        // Skip if values are the same (both null, or equal)
        if (currentValue === newValue) continue;
        if (currentValue == null && newValue == null) continue;

        changes[field] = newValue;
        hasChanges = true;
      }

      if (hasChanges && hasConsent) {
        updateMemory.mutate({
          ...changes,
          source,
          source_context: sourceContext ?? undefined,
        } as FinancialMemoryUpdate);
      }
    },
    [hasConsent, memory, updateMemory]
  );
}
