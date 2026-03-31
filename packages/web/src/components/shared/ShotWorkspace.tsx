"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ShotWorkspaceProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * ShotWorkspace - Single-column immersive workspace for viral tools.
 * Centers the content and provides a soft, focused background.
 */
export const ShotWorkspace = forwardRef<HTMLDivElement, ShotWorkspaceProps>(
  ({ children, className, id }, ref) => {
    return (
      <div 
        ref={ref}
        id={id}
        className={cn(
          "max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 md:p-12 animate-fade-up",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ShotWorkspace.displayName = "ShotWorkspace";
