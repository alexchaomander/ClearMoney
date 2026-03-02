"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PrivacyContextType {
  isVanished: boolean;
  toggleVanish: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isVanished, setIsVanished] = useState(false);

  const toggleVanish = () => setIsVanished((v) => !v);

  // Keyboard shortcut: Cmd + I or Ctrl + I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        toggleVanish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PrivacyContext.Provider value={{ isVanished, toggleVanish }}>
      <div className={isVanished ? "privacy-mode-active" : ""}>
        {children}
      </div>
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}
