"use client";

import React, { useRef } from "react";
import { ShotHero, ShotWorkspace } from "@/components/shared";
import { RunwayCalculator } from "./RunwayCalculator";

export function ShotClientPage() {
  const workspaceRef = useRef<HTMLDivElement>(null);

  const scrollToMath = () => {
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <ShotHero
        title="Shot #1: Founder Finance"
        subtitle="Is your personal burn killing your startup?"
        description="Calculate your true survival runway by combining personal and company assets. See the deterministic math behind your fundraising triggers."
        onCtaClick={scrollToMath}
      />
      
      <ShotWorkspace id="math-workspace" ref={workspaceRef}>
        <RunwayCalculator showShell={false} />
      </ShotWorkspace>
    </>
  );
}
