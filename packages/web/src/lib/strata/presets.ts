"use client";

import { useMemo } from "react";
import { useToolPresets } from "./hooks";
import type { ToolPreset } from "@clearmoney/strata-sdk";

export function useToolPreset<T>(toolId: string): {
  preset: Partial<T> | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useToolPresets();
  const preset = useMemo(() => {
    const match = data?.presets?.find((item: ToolPreset) => item.tool_id === toolId);
    return (match?.defaults as Partial<T> | undefined) ?? null;
  }, [data, toolId]);
  return { preset, isLoading };
}
