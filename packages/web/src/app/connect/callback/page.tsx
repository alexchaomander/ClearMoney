"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useHandleConnectionCallback } from "@/lib/strata/hooks";

type CallbackStatus = "loading" | "success" | "error";

export default function ConnectCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callbackMutation = useHandleConnectionCallback();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        setErrorMessage(errorDescription ?? error);
        return;
      }

      try {
        await callbackMutation.mutateAsync({
          code: code ?? undefined,
          state: state ?? undefined,
        });

        setStatus("success");

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to complete connection"
        );
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      {/* Background gradient */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 max-w-md w-full p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center"
      >
        {status === "loading" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-emerald-500 border-t-transparent"
            />
            <h1 className="font-serif text-2xl text-white mb-2">
              Connecting Your Account
            </h1>
            <p className="text-neutral-400">
              Please wait while we securely link your account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-emerald-950" />
            </motion.div>
            <h1 className="font-serif text-2xl text-white mb-2">
              Account Connected!
            </h1>
            <p className="text-neutral-400 mb-6">
              Your account has been securely linked. Redirecting to your
              dashboard...
            </p>
            <div className="flex items-center justify-center gap-1">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500 flex items-center justify-center"
            >
              <X className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="font-serif text-2xl text-white mb-2">
              Connection Failed
            </h1>
            <p className="text-neutral-400 mb-6">
              {errorMessage ?? "Something went wrong while connecting your account."}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/connect"
                className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              >
                Try Again
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3 rounded-lg font-medium transition-all duration-200 border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
