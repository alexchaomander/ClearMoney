"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "h-4 w-4 accent-slate-900 dark:accent-slate-50",
          className
        )}
        {...props}
      />
    )
  }
)
Switch.displayName = "Switch"
export { Switch }
