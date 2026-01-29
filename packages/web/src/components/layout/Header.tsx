"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Calculator, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, getLiveTools, getCategoryById } from "@/lib/site-config";

// Group tools by category for the dropdown
function getToolsByCategory() {
  const liveTools = getLiveTools();
  const grouped: Record<string, typeof liveTools> = {};

  liveTools.forEach((tool) => {
    if (!grouped[tool.categoryId]) {
      grouped[tool.categoryId] = [];
    }
    grouped[tool.categoryId].push(tool);
  });

  return grouped;
}

// Get unique categories that have live tools
function getCategoriesWithTools() {
  const toolsByCategory = getToolsByCategory();
  const uniqueCategories = new Map<string, typeof categories[0]>();

  Object.keys(toolsByCategory).forEach((categoryId) => {
    const category = getCategoryById(categoryId);
    if (category && !uniqueCategories.has(categoryId)) {
      uniqueCategories.set(categoryId, category);
    }
  });

  return Array.from(uniqueCategories.values());
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsDropdownOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const categoriesWithTools = getCategoriesWithTools();
  const toolsByCategory = getToolsByCategory();
  const liveToolsCount = getLiveTools().length;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center group-hover:bg-brand-400 transition-colors">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Clear<span className="text-brand-400">Money</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Tools Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isToolsDropdownOpen
                      ? "text-white bg-neutral-800"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                  )}
                >
                  Tools
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                    {liveToolsCount}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isToolsDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isToolsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[600px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-fade-up">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Decision Tools
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Plug in your numbers. Get an answer.
                          </p>
                        </div>
                        <Link
                          href="/#tools"
                          className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                        >
                          View all
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                      {categoriesWithTools.slice(0, 6).map((category) => (
                        <div key={category.id}>
                          <Link
                            href={category.href}
                            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 hover:text-brand-400 transition-colors"
                          >
                            <span>{category.icon}</span>
                            {category.shortName}
                          </Link>
                          <div className="space-y-1">
                            {toolsByCategory[category.id]?.slice(0, 4).map((tool) => (
                              <Link
                                key={tool.id}
                                href={tool.href}
                                className="block px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                              >
                                {tool.name}
                              </Link>
                            ))}
                            {(toolsByCategory[category.id]?.length || 0) > 4 && (
                              <Link
                                href={category.href}
                                className="block px-2 py-1.5 text-xs text-neutral-500 hover:text-brand-400 transition-colors"
                              >
                                +{(toolsByCategory[category.id]?.length || 0) - 4} more
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Nav Links */}
              <Link
                href="/blog"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/blog"
                    ? "text-white bg-neutral-800"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                )}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/about"
                    ? "text-white bg-neutral-800"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                )}
              >
                About
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/#tools"
                className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
              >
                Explore Tools
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname.startsWith("/dashboard") || pathname.startsWith("/connect")
                    ? "text-neutral-950 bg-brand-400"
                    : "text-neutral-950 bg-white hover:bg-neutral-100"
                )}
              >
                Dashboard
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-neutral-900 border-b border-neutral-800 max-h-[calc(100vh-4rem)] overflow-y-auto animate-fade-up">
            <div className="p-4 space-y-4">
              {/* Categories */}
              {categoriesWithTools.map((category) => (
                <div key={category.id} className="space-y-2">
                  <Link
                    href={category.href}
                    className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider"
                  >
                    <span>{category.icon}</span>
                    {category.shortName}
                  </Link>
                  <div className="pl-6 space-y-1">
                    {toolsByCategory[category.id]?.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="block py-2 text-sm text-neutral-300 hover:text-white transition-colors"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Other Links */}
              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <Link
                  href="/blog"
                  className="block py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  className="block py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  About
                </Link>
              </div>

              {/* CTA */}
              <div className="pt-4 space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full py-3 text-center text-sm font-medium text-neutral-950 bg-brand-400 hover:bg-brand-300 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/#tools"
                  className="block w-full py-3 text-center text-sm font-medium text-neutral-300 border border-neutral-700 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Explore All Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}

export default Header;
