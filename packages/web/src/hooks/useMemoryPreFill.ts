"use client";

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useFinancialMemory } from "@/lib/strata/hooks";
import type { FinancialMemory } from "@clearmoney/strata-sdk";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const deepMerge = <V extends object>(target: V, source: Partial<V>): V => {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value);
    } else {
      result[key] = value;
    }
  }
  return result as V;
};

/**
 * Hook that provides default values for calculator fields from Financial Memory,
 * but only applies them when explicitly requested.
 *
 * @param fieldMap - Maps calculator field names to FinancialMemory keys.
 *   Supports dot paths for nested objects (e.g. "income.wagesIncome").
 *   The value can be either a memory key or a tuple [memoryKey, transformFn]
 *   for value transformations.
 *
 * @returns defaults (flat object of calculator field values), available fields,
 *   applied fields, isLoaded flag, and an applyTo helper for state.
 */
export function useMemoryPreFill<T extends object>(
  fieldMap: Record<
    string,
    keyof FinancialMemory | [keyof FinancialMemory, (v: unknown) => unknown]
  >
): {
  defaults: Partial<T>;
  availableFields: Set<string>;
  preFilledFields: Set<string>;
  isLoaded: boolean;
  hasDefaults: boolean;
  applyTo: (
    setState: Dispatch<SetStateAction<T>>,
    merge?: (prev: T, defaults: Partial<T>) => T
  ) => void;
} {
  const { data: memory, isSuccess } = useFinancialMemory();
  const [preFilledFields, setPreFilledFields] = useState<Set<string>>(new Set());

  const { defaults, availableFields } = useMemo(() => {
    if (!memory || !isSuccess) {
      return { defaults: {} as Partial<T>, availableFields: new Set<string>() };
    }

    const defaults: Record<string, unknown> = {};
    const availableFields = new Set<string>();

    for (const [formField, mapping] of Object.entries(fieldMap)) {
      const [memoryKey, transform] = Array.isArray(mapping)
        ? mapping
        : [mapping, undefined];

      const rawValue = memory[memoryKey];
      if (rawValue == null) continue;

      const value = transform ? transform(rawValue) : rawValue;
      if (value == null) continue;

      // Handle dot-path fields (e.g. "income.wagesIncome")
      if (formField.includes(".")) {
        const [parent, child] = formField.split(".");
        if (!defaults[parent]) defaults[parent] = {};
        (defaults[parent] as Record<string, unknown>)[child] = value;
      } else {
        defaults[formField] = value;
      }
      availableFields.add(formField);
    }

    return { defaults: defaults as Partial<T>, availableFields };
  }, [memory, isSuccess, fieldMap]);

  const applyTo = useCallback(
    (
      setState: Dispatch<SetStateAction<T>>,
      merge?: (prev: T, defaults: Partial<T>) => T
    ) => {
      if (!isSuccess || !memory || availableFields.size === 0) return;
      setState((prev) => (merge ? merge(prev, defaults) : deepMerge(prev, defaults)));
      setPreFilledFields(new Set(availableFields));
    },
    [availableFields, defaults, isSuccess, memory]
  );

  return {
    defaults,
    availableFields,
    preFilledFields,
    isLoaded: isSuccess,
    hasDefaults: availableFields.size > 0,
    applyTo,
  };
}
