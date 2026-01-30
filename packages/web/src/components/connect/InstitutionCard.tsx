"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { getInitials } from "@/lib/shared/formatters";

interface Institution {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface InstitutionCardProps {
  institution: Institution;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
}

export function InstitutionCard({
  institution,
  isConnected,
  isConnecting,
  onConnect,
}: InstitutionCardProps) {
  const initials = getInitials(institution.name);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onConnect}
      disabled={isConnected || isConnecting}
      className={`group p-4 rounded-xl text-left transition-all duration-300 w-full disabled:cursor-default border ${
        isConnected
          ? "bg-emerald-900/40 border-emerald-600"
          : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Logo or initials */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-serif text-lg font-medium transition-all duration-300 ${
            isConnected
              ? "bg-emerald-700 text-emerald-100"
              : "bg-neutral-800 text-neutral-200"
          }`}
        >
          {institution.logo_url ? (
            <img
              src={institution.logo_url}
              alt={institution.name}
              className="w-6 h-6 object-contain"
            />
          ) : (
            initials
          )}
        </div>

        {/* Institution name */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium truncate transition-colors duration-200 ${
              isConnected ? "text-emerald-100" : "text-neutral-200"
            }`}
          >
            {institution.name}
          </p>
        </div>

        {/* Status indicator */}
        {isConnected ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500">
            <Check className="w-4 h-4 text-emerald-950" />
          </div>
        ) : isConnecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent"
          />
        ) : (
          <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
        )}
      </div>
    </motion.button>
  );
}
