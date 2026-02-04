"use client";

import { useState } from "react";
import Link from "next/link";
import { User, X } from "lucide-react";

interface MemoryBadgeProps {
  field?: string;
  preFilledFields?: Set<string>;
  isActive?: boolean;
  label?: string;
}

/**
 * Small indicator shown next to pre-filled calculator fields.
 * Shows "From your profile" with a link to /profile. Dismissible per-field.
 */
export function MemoryBadge({ field, preFilledFields, isActive, label }: MemoryBadgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (field && preFilledFields) {
    if (!preFilledFields.has(field)) return null;
    return (
      <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-emerald-900/30 border border-emerald-800/40 text-[11px] text-emerald-400">
        <User className="w-3 h-3" />
        <Link
          href="/profile"
          className="hover:underline underline-offset-2"
        >
          From profile
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            setDismissed(true);
          }}
          className="ml-0.5 hover:text-emerald-200 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  }

  if (!isActive) return null;

  return (
    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-emerald-900/30 border border-emerald-800/40 text-[11px] text-emerald-400">
      <User className="w-3 h-3" />
      {label ?? "Memory"}
    </span>
  );
}
