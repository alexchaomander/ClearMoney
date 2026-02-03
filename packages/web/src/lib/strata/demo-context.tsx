"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "clearmoney-demo-mode";

const DemoModeContext = createContext<boolean>(false);

function getInitialDemoState(searchParams: URLSearchParams): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (typeof window === "undefined") return false;

  const param = searchParams.get("demo");
  if (param === "true") return true;
  if (param === "false") return false;

  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [isDemoFallback] = useState(() => getInitialDemoState(searchParams));

  const isDemo = useMemo(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
    if (typeof window === "undefined") return isDemoFallback;
    const param = searchParams.get("demo");
    if (param === "true") return true;
    if (param === "false") return false;
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  }, [searchParams, isDemoFallback]);

  useEffect(() => {
    const param = searchParams.get("demo");
    if (param === "true") {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } else if (param === "false") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [searchParams]);

  return (
    <DemoModeContext.Provider value={isDemo}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): boolean {
  return useContext(DemoModeContext);
}
