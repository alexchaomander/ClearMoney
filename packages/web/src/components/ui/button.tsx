"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white dark:ring-offset-neutral-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700",
        secondary:
          "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-900",
        outline:
          "border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-100 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:border-neutral-600",
        ghost: "text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800",
        link: "text-brand-500 underline-offset-4 hover:underline",
        destructive: "bg-error-600 text-white hover:bg-error-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
