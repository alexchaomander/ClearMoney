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

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const envDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const paramDemo = searchParams.get("demo") === "true";
    const storedDemo = sessionStorage.getItem(STORAGE_KEY) === "true";

    const active = envDemo || paramDemo || storedDemo;
    if (active) {
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    setIsDemo(active);
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
