"use client";

import { useMemo } from "react";
import { useFinancialMemory } from "@/lib/strata/hooks";
import type { FinancialMemory } from "@clearmoney/strata-sdk";

/**
 * Hook that provides default values for calculator fields from Financial Memory.
 *
 * @param fieldMap - Maps calculator field names to FinancialMemory keys.
 *   Supports dot paths for nested objects (e.g. "income.wagesIncome").
 *   The value can be either a memory key or a tuple [memoryKey, transformFn]
 *   for value transformations.
 *
 * @returns defaults (flat object of calculator field values), preFilledFields,
 *   and isLoaded flag.
 */
export function useMemoryPreFill<T extends object>(
  fieldMap: Record<
    string,
    keyof FinancialMemory | [keyof FinancialMemory, (v: unknown) => unknown]
  >
): {
  defaults: Partial<T>;
  preFilledFields: Set<string>;
  isLoaded: boolean;
} {
  const { data: memory, isSuccess } = useFinancialMemory();

  return useMemo(() => {
    if (!memory || !isSuccess) {
      return { defaults: {} as Partial<T>, preFilledFields: new Set<string>(), isLoaded: false };
    }

    const defaults: Record<string, unknown> = {};
    const preFilledFields = new Set<string>();

    for (const [formField, mapping] of Object.entries(fieldMap)) {
      const [memoryKey, transform] = Array.isArray(mapping)
        ? mapping
        : [mapping, undefined];

      const rawValue = memory[memoryKey];
      if (rawValue == null) continue;

      const value = transform ? transform(rawValue) : rawValue;

      // Handle dot-path fields (e.g. "income.wagesIncome")
      if (formField.includes(".")) {
        const [parent, child] = formField.split(".");
        if (!defaults[parent]) defaults[parent] = {};
        (defaults[parent] as Record<string, unknown>)[child] = value;
      } else {
        defaults[formField] = value;
      }
      preFilledFields.add(formField);
    }

    return { defaults: defaults as Partial<T>, preFilledFields, isLoaded: true };
  }, [memory, isSuccess, fieldMap]);
}
