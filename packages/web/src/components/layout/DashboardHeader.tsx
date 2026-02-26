"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefresh?: boolean;
}

export function DashboardHeader({
  onRefresh,
  isRefreshing = false,
  showRefresh = false,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Tools", href: "/tools" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "War Room", href: "/dashboard/war-room" },
    { label: "Action Lab", href: "/dashboard/action-lab", isPreview: true },
    { label: "Connect", href: "/connect" },
    { label: "Advisor", href: "/advisor" },
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-900 dark:bg-emerald-800 transition-all duration-300 group-hover:scale-105 shadow-lg shadow-black/5 dark:shadow-emerald-900/20">
              <Calculator className="w-4 h-4 text-white dark:text-emerald-100" />
            </div>
            <span className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
              Clear<span className="text-emerald-600 dark:text-emerald-400">Money</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.href === "/dashboard" 
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    id={item.label === "War Room" ? "war-room-nav" : undefined}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? "text-emerald-700 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-900/60"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                    {item.isPreview && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                        PREVIEW
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <ThemeToggle />

            {showRefresh && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                aria-label="Refresh data"
                title="Refresh data"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.div>
              </button>
            )}
            {hasClerkKey && (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-3">
                    <NotificationCenter />
                    <UserButton />
                  </div>
                </SignedIn>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
