"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { usePlaidLink, PlaidLinkOnSuccess } from "react-plaid-link";
import { useCreatePlaidLinkToken, useHandlePlaidCallback } from "@/lib/strata/hooks";
import { useRouter } from "next/navigation";
import { captureAnalyticsEvent } from "@/lib/analytics";

interface PlaidLinkButtonProps {
  source: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PlaidLinkButton({ source, onSuccess, onError }: PlaidLinkButtonProps) {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const hasFetchedRef = useRef(false);

  const createLinkToken = useCreatePlaidLinkToken();
  const handleCallback = useHandlePlaidCallback();

  // Fetch link token on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    createLinkToken
      .mutateAsync({
        redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
      })
      .then((response) => setLinkToken(response.link_token))
      .catch(() => {
        captureAnalyticsEvent("founder_connect_setup_failed", {
          source,
          connection_method: "bank_plaid",
          reason: "plaid_link_token_init_failed",
        });
        onError?.("Failed to initialize Plaid Link");
      });
  }, [createLinkToken, onError, source]);

  const handlePlaidSuccess: PlaidLinkOnSuccess = useCallback(
    async (publicToken, metadata) => {
      setIsConnecting(true);
      try {
        await handleCallback.mutateAsync({
          public_token: publicToken,
          institution_id: metadata.institution?.institution_id ?? undefined,
          institution_name: metadata.institution?.name ?? undefined,
        });
        captureAnalyticsEvent("founder_connect_succeeded", {
          source,
          connection_method: "bank_plaid",
          institution_id: metadata.institution?.institution_id ?? "unknown",
          institution_name: metadata.institution?.name ?? "Unknown institution",
        });
        onSuccess?.();
        router.push("/dashboard");
      } catch (err) {
        captureAnalyticsEvent("founder_connect_failed", {
          source,
          connection_method: "bank_plaid",
          institution_id: metadata.institution?.institution_id ?? "unknown",
          institution_name: metadata.institution?.name ?? "Unknown institution",
          reason: err instanceof Error ? err.message : "plaid_callback_failed",
        });
        onError?.(err instanceof Error ? err.message : "Failed to connect account");
        setIsConnecting(false);
      }
    },
    [handleCallback, onSuccess, onError, router, source]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: (err, metadata) => {
      captureAnalyticsEvent("founder_connect_exited", {
        source,
        connection_method: "bank_plaid",
        institution_id: metadata.institution?.institution_id ?? "unknown",
        institution_name: metadata.institution?.name ?? "Unknown institution",
        exit_status: metadata.status ?? "unknown",
        had_error: Boolean(err),
      });
      setIsConnecting(false);
    },
  });

  const handleClick = () => {
    if (ready && linkToken) {
      captureAnalyticsEvent("founder_connect_started", {
        source,
        connection_method: "bank_plaid",
        institution_id: "plaid_link",
      });
      open();
    }
  };

  const isLoading = createLinkToken.isPending || !ready || !linkToken;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={isLoading || isConnecting}
      className="group w-full p-4 rounded-xl text-left transition-all duration-300 border bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-700/50 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-700/50">
          <Building2 className="w-5 h-5 text-emerald-300" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-emerald-100">
            Connect Bank Account
          </p>
          <p className="text-xs text-emerald-400/70">
            Checking, savings, and credit cards via Plaid
          </p>
        </div>

        {/* Status indicator */}
        {isLoading || isConnecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-600/30 flex items-center justify-center group-hover:bg-emerald-600/50 transition-colors">
            <span className="text-emerald-300 text-sm">+</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
