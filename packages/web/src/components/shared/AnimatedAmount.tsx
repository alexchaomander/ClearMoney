"use client";

import React, { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { usePrivacy } from "@/lib/privacy-context";
import { cn } from "@/lib/utils";

interface AnimatedAmountProps {
  value: number;
  className?: string;
  prefix?: string;
  showCurrency?: boolean;
}

export function AnimatedAmount({ 
  value, 
  className, 
  prefix = "$", 
  showCurrency = true 
}: AnimatedAmountProps) {
  const { isVanished } = usePrivacy();
  const count = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    count.set(value);
  }, [count, value]);

  const display = useTransform(count, (latest) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.floor(latest));
    
    return showCurrency ? `${prefix}${formatted}` : formatted;
  });

  return (
    <motion.span
      className={cn(
        "inline-block tabular-nums",
        isVanished && "privacy-blur",
        className
      )}
    >
      {display}
    </motion.span>
  );
}
