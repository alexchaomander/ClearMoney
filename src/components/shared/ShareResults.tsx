"use client";

import React, { useState, useCallback } from "react";
import {
  Share2,
  Link2,
  Twitter,
  Mail,
  Check,
  Copy,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareResultsProps {
  /** Data to encode in the URL (will be serialized to query params) */
  data: Record<string, string | number | boolean>;
  /** Title for sharing */
  title?: string;
  /** Description for sharing */
  description?: string;
  /** Variant style */
  variant?: "button" | "inline" | "card";
  /** Additional className */
  className?: string;
}

/**
 * ShareResults - Generate shareable URLs with calculation results
 *
 * Encodes calculator inputs/outputs into query parameters for sharing.
 * Supports copy to clipboard, Twitter, email, and native share API.
 */
export function ShareResults({
  data,
  title = "Check out my calculation",
  description = "I used ClearMoney to run the numbers",
  variant = "button",
  className,
}: ShareResultsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate shareable URL with query params
  const generateShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";

    const url = new URL(window.location.href);
    // Clear existing params and add new ones
    url.search = "";
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
    // Add share flag
    url.searchParams.set("shared", "true");
    return url.toString();
  }, [data]);

  const shareUrl = generateShareUrl();

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Share via Twitter/X
  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title}\n\n${description}`);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "width=550,height=420"
    );
    setShowMenu(false);
  };

  // Share via Email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowMenu(false);
  };

  // Native share API (mobile)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
        console.log("Share cancelled");
      }
    }
    setShowMenu(false);
  };

  const hasNativeShare = typeof navigator !== "undefined" && navigator.share;

  // Button variant
  if (variant === "button") {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Share Results
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 animate-fade-up">
              {/* Copy URL */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success-400" />
                ) : (
                  <Link2 className="w-4 h-4 text-neutral-400" />
                )}
                <span className="text-sm text-neutral-300">
                  {copied ? "Copied!" : "Copy link"}
                </span>
              </button>

              {/* Twitter */}
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left"
              >
                <Twitter className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Share on X</span>
              </button>

              {/* Email */}
              <button
                onClick={shareViaEmail}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left"
              >
                <Mail className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Send via email</span>
              </button>

              {/* Native share (mobile) */}
              {hasNativeShare && (
                <button
                  onClick={nativeShare}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                >
                  <MessageCircle className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-300">More options</span>
                </button>
              )}

              {/* Preview URL */}
              <div className="mt-2 pt-2 border-t border-neutral-800">
                <div className="px-3 py-2">
                  <p className="text-xs text-neutral-500 mb-1">Preview URL:</p>
                  <p className="text-xs text-neutral-400 font-mono truncate">
                    {shareUrl.substring(0, 50)}...
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={shareToTwitter}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Share on X"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={shareViaEmail}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Email"
        >
          <Mail className="w-4 h-4" />
        </button>
        {hasNativeShare && (
          <button
            onClick={nativeShare}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-neutral-800 bg-neutral-900/50",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            Share Your Results
          </h3>
          <p className="text-xs text-neutral-500">
            Send this calculation to a friend
          </p>
        </div>
      </div>

      {/* URL display */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-neutral-400 font-mono truncate"
        />
        <button
          onClick={copyToClipboard}
          className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            copied
              ? "bg-success-500 text-white"
              : "bg-brand-500 hover:bg-brand-400 text-white"
          )}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={shareToTwitter}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm transition-colors"
        >
          <Twitter className="w-4 h-4" />
          <span>X</span>
        </button>
        <button
          onClick={shareViaEmail}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Email</span>
        </button>
        {hasNativeShare && (
          <button
            onClick={nativeShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>More</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to parse shared URL params on page load
 */
export function useSharedParams<T extends Record<string, string>>(
  paramKeys: string[]
): { isShared: boolean; params: Partial<T> } {
  const [result] = useState(() => {
    if (typeof window === "undefined") {
      return { isShared: false, params: {} as Partial<T> };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isShared = urlParams.get("shared") === "true";
    const params: Partial<T> = {};

    paramKeys.forEach((key) => {
      const value = urlParams.get(key);
      if (value !== null) {
        (params as Record<string, string>)[key] = value;
      }
    });

    return { isShared, params };
  });

  return result;
}

export default ShareResults;
