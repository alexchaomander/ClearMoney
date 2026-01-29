"use client";

import {
  createContext,
  useContext,
  useEffect,
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
  const [isDemo, setIsDemo] = useState(() => getInitialDemoState(searchParams));

  useEffect(() => {
    const param = searchParams.get("demo");

    if (param === "true") {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsDemo(true);
    } else if (param === "false") {
      sessionStorage.removeItem(STORAGE_KEY);
      setIsDemo(false);
    } else {
      const envDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
      const storedDemo = sessionStorage.getItem(STORAGE_KEY) === "true";
      setIsDemo(envDemo || storedDemo);
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
