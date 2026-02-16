"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  useNotifications,
  useUpdateNotification,
  useMarkAllNotificationsRead,
  useConsentStatus,
} from "@/lib/strata/hooks";
import type { NotificationResponse } from "@clearmoney/strata-sdk";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { hasConsent } = useConsentStatus(["notifications:read", "notifications:write"]);
  const { data: notifications, isLoading } = useNotifications({ enabled: hasConsent });
  const updateNotification = useUpdateNotification();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  if (!hasConsent) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-neutral-950" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-neutral-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 text-[10px] font-bold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-emerald-400 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-neutral-800/50">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-neutral-500">Checking for updates...</p>
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-neutral-600" />
                  </div>
                  <p className="text-sm text-neutral-200">All clear</p>
                  <p className="text-xs text-neutral-500 mt-1">No new alerts at this time.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`relative p-4 transition-colors ${
                      n.is_read ? "bg-transparent opacity-60" : "bg-emerald-500/[0.02]"
                    }`}
                  >
                    {!n.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500" />
                    )}
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getSeverityIcon(n.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-tight ${n.is_read ? "text-neutral-300" : "text-neutral-100"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-neutral-600 whitespace-nowrap pt-0.5">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        
                        <div className="mt-3 flex items-center gap-3">
                          {n.action_url && (
                            <Link
                              href={n.action_url}
                              onClick={() => {
                                setIsOpen(false);
                                if (!n.is_read) updateNotification.mutate({ id: n.id, data: { is_read: true } });
                              }}
                              className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              Take Action
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                          {!n.is_read && (
                            <button
                              onClick={() => updateNotification.mutate({ id: n.id, data: { is_read: true } })}
                              className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-center">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
              >
                Notification Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
