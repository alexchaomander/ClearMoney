"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

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
    { label: "Connect", href: "/connect" },
    { label: "Advisor", href: "/advisor" },
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-800 transition-all duration-300 group-hover:scale-105">
              <Calculator className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="font-serif text-xl tracking-tight text-white">
              Clear<span className="text-emerald-400">Money</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href === "/dashboard" && pathname.startsWith("/dashboard")) ||
                  (item.href === "/connect" && pathname.startsWith("/connect")) ||
                  (item.href === "/settings" && pathname.startsWith("/settings")) ||
                  (item.href === "/profile" && pathname.startsWith("/profile"));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-emerald-100 bg-emerald-900/60"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {showRefresh && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-neutral-300" />
                </motion.div>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
