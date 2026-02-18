"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreamingMetricProps {
  value: number;
  formatter?: (val: number) => string;
  className?: string;
}

export function StreamingMetric({
  value,
  formatter = (v) => v.toLocaleString(),
  className,
}: StreamingMetricProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatter(displayValue)}
    </span>
  );
}
