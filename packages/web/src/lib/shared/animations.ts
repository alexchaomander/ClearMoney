/**
 * ClearMoney Shared Animation Variants
 *
 * Consistent framer-motion animation configurations.
 * Use these instead of defining animations in each component.
 */

import type { Variants } from "framer-motion";

/**
 * Stagger container for lists - children will animate in sequence
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger item for vertical fade-in
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/**
 * Stagger item for horizontal slide-in
 */
export const staggerItemHorizontal: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

/**
 * Simple fade-in with upward motion
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

/**
 * Simple fade-in with scale
 */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};
