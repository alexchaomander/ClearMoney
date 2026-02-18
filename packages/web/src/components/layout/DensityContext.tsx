"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Density = "comfort" | "compact";

interface DensityContextType {
  density: Density;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>("comfort");

  useEffect(() => {
    const saved = localStorage.getItem("strata-density") as Density;
    if (saved === "comfort" || saved === "compact") {
      setDensity(saved);
    }
  }, []);

  const updateDensity = (newDensity: Density) => {
    setDensity(newDensity);
    localStorage.setItem("strata-density", newDensity);
    
    // Set a data attribute on the root html element for global CSS styling if needed
    document.documentElement.setAttribute("data-density", newDensity);
  };

  const toggleDensity = () => {
    updateDensity(density === "comfort" ? "compact" : "comfort");
  };

  return (
    <DensityContext.Provider value={{ density, setDensity: updateDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error("useDensity must be used within a DensityProvider");
  }
  return context;
}
