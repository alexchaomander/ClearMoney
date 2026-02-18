"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface HighlightContextType {
  highlightedMetric: string | null;
  setHighlightedMetric: (metricId: string | null) => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [highlightedMetric, setHighlightedMetric] = useState<string | null>(null);

  return (
    <HighlightContext.Provider value={{ highlightedMetric, setHighlightedMetric }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useMetricHighlight() {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error("useMetricHighlight must be used within a HighlightProvider");
  }
  return context;
}
