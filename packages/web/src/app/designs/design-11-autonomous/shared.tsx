"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";

// ============================================================================
// SHARED DESIGN SYSTEM FOR AUTONOMOUS-INSPIRED DESIGN
// ============================================================================

// Color palette - sophisticated with vivid accents
export const colors = {
  bg: "#fafafa",
  bgAlt: "#ffffff",
  text: "#0a0a0a",
  textMuted: "#525252",
  textLight: "#a3a3a3",
  accent: "#2563eb",
  accentLight: "#3b82f6",
  border: "#e5e5e5",
  borderLight: "#f5f5f5",
  success: "#059669",
  successLight: "#10b981",
  warning: "#ea580c",
  warningLight: "#f97316",
  // Gradient blob colors - more saturated
  blob1: "#3b82f6", // Blue
  blob2: "#8b5cf6", // Purple
  blob3: "#06b6d4", // Cyan
  blob4: "#10b981", // Emerald
  blob5: "#f59e0b", // Amber
};

// ============================================================================
// GRADIENT BLOB COMPONENT
// ============================================================================

export function GradientBlob({
  color,
  size = 600,
  top,
  left,
  right,
  bottom,
  opacity = 0.4,
  blur = 80,
  animate = false,
  delay = 0,
}: {
  color: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  blur?: number;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${animate ? "animate-blob" : ""}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color} 0%, ${color}80 25%, ${color}40 50%, transparent 70%)`,
        top,
        left,
        right,
        bottom,
        opacity,
        filter: `blur(${blur}px)`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ============================================================================
// NOISE TEXTURE OVERLAY
// ============================================================================

export function NoiseTexture() {
  return (
    <div
      className="absolute inset-0 opacity-[0.015] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ============================================================================
// APP NAVIGATION (for authenticated pages)
// ============================================================================

export function AppNavigation({ currentPage }: { currentPage?: string }) {
  const navItems = [
    { name: "Dashboard", href: "/designs/design-11-autonomous/dashboard" },
    { name: "Connect", href: "/designs/design-11-autonomous/connect" },
    { name: "Map", href: "/designs/design-11-autonomous/graph" },
    { name: "Recommendations", href: "/designs/design-11-autonomous/recommendations" },
    { name: "Profile", href: "/designs/design-11-autonomous/profile" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          <Link href="/designs/design-11-autonomous" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
                boxShadow: `0 4px 14px ${colors.accent}40`
              }}
            >
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
              ClearMoney
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors duration-200 ${
                  currentPage === item.name.toLowerCase()
                    ? "text-black"
                    : "hover:text-black"
                }`}
                style={{
                  color: currentPage === item.name.toLowerCase() ? colors.text : colors.textMuted
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${colors.blob4} 0%, ${colors.blob3} 100%)`,
                  color: "white"
                }}
              >
                S
              </div>
              <span className="hidden sm:block text-sm font-medium" style={{ color: colors.text }}>
                Sarah
              </span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ============================================================================
// GLOBAL STYLES
// ============================================================================

export function GlobalStyles() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Blob animation - slower, more subtle */
      @keyframes blob {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 30px) scale(0.9);
        }
      }

      .animate-blob {
        animation: blob 25s ease-in-out infinite;
      }

      /* Custom range slider */
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
      }

      input[type="range"]::-webkit-slider-track {
        height: 8px;
        background: ${colors.border};
        border-radius: 9999px;
      }

      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%);
        border-radius: 50%;
        margin-top: -8px;
        box-shadow: 0 2px 8px ${colors.accent}40;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px ${colors.accent}50;
      }

      input[type="range"]::-moz-range-track {
        height: 8px;
        background: ${colors.border};
        border-radius: 9999px;
      }

      input[type="range"]::-moz-range-thumb {
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%);
        border-radius: 50%;
        border: none;
        box-shadow: 0 2px 8px ${colors.accent}40;
      }

      /* Smooth scroll */
      html {
        scroll-behavior: smooth;
      }

      /* Selection */
      ::selection {
        background: ${colors.accent}30;
        color: ${colors.text};
      }
    `}</style>
  );
}

// ============================================================================
// MOCK USER DATA
// ============================================================================

export const mockUser = {
  name: "Sarah",
  age: 32,
  occupation: "Software Engineer",
  email: "sarah@example.com",
  income: 150000,
  savingsRate: 22,
  netWorth: 87400,
  financialHealthScore: 72,
  assets: {
    checking: 8500,
    savings: 25000,
    "401k": 68000,
    rothIra: 18000,
    brokerage: 12500,
    crypto: 3400,
  },
  debts: {
    studentLoans: 34000,
    creditCards: 0,
    carLoan: 12000,
    mortgage: 0,
  },
  goals: [
    { name: "Emergency Fund (3 months)", target: 12500, current: 8500, priority: "high" },
    { name: "Max 401k", target: 23000, current: 15600, priority: "high" },
    { name: "Down Payment", target: 100000, current: 25000, priority: "medium" },
    { name: "Pay off student loans", target: 34000, current: 0, priority: "medium" },
  ],
  riskTolerance: "moderate-aggressive",
  monthlyExpenses: 4500,
  employerMatch: "50% up to 6%",
};
