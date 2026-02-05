"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: "currency" | "percent" | "number";
  description?: string;
  className?: string;
  rightSlot?: React.ReactNode;
}

/**
 * SliderInput - A mobile-friendly slider with tap-to-edit functionality
 *
 * Features:
 * - Tap the value to enter an exact number (mobile-friendly)
 * - Drag slider for quick adjustments
 * - Supports currency, percentage, and plain number formatting
 * - Dark mode optimized
 */
export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = "number",
  description,
  className,
  rightSlot,
}: SliderInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (val: number): string => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percent":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const parseInput = (input: string): number => {
    // Remove currency symbols, commas, percent signs
    const cleaned = input.replace(/[$,%\s]/g, "").replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? value : parsed;
  };

  const handleValueClick = () => {
    // For editing, show raw number
    setInputValue(value.toString());
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleInputBlur = () => {
    const parsed = parseInput(inputValue);
    const clamped = Math.max(min, Math.min(max, parsed));
    // Round to step
    const rounded = Math.round(clamped / step) * step;
    onChange(rounded);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              {label}
            </label>
            {rightSlot}
          </div>
          {description && (
            <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5">
            {format === "currency" && (
              <span className="text-sm font-medium text-neutral-400 mr-1">
                $
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-20 text-sm font-semibold text-white bg-transparent outline-none text-right"
              autoFocus
            />
            {format === "percent" && (
              <span className="text-sm font-medium text-neutral-400 ml-1">
                %
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={handleValueClick}
            className="text-sm font-semibold text-white bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 px-3 py-1.5 rounded-lg transition-colors min-w-[80px] text-right"
            title="Tap to enter exact value"
          >
            {formatValue(value)}
          </button>
        )}
      </div>

      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-white
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:shadow-md
                     [&::-moz-range-thumb]:cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-white/20"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-neutral-600">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

export default SliderInput;
