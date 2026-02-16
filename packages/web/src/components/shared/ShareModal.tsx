"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Share2, Shield, EyeOff, Check, Copy, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStrataClient } from "@/lib/strata/client";
import { useToast } from "@/components/shared/toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ShareModalProps {
  toolId: string;
  payload: Record<string, any>;
  onRedact?: (payload: Record<string, any>, settings: RedactionSettings) => Record<string, any>;
  trigger?: React.ReactNode;
}

export interface RedactionSettings {
  redactPII: boolean;
  redactInstitutions: boolean;
  redactExactBalances: boolean;
}

export function ShareModal({ toolId, payload, onRedact, trigger }: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<RedactionSettings>({
    redactPII: true,
    redactInstitutions: false,
    redactExactBalances: false,
  });

  const client = useStrataClient();
  const { pushToast } = useToast();

  const handleShare = async () => {
    setIsPending(true);
    try {
      const finalPayload = onRedact ? onRedact(payload, settings) : payload;
      
      const created = await client.createShareReport({
        tool_id: toolId,
        mode: settings.redactExactBalances || settings.redactInstitutions ? "redacted" : "full",
        payload: finalPayload,
        expires_in_days: 30,
      });

      const url = new URL(window.location.href);
      url.pathname = `/tools/${toolId}/report`;
      url.search = "";
      url.searchParams.set("rid", created.id);
      url.searchParams.set("rt", created.token);
      
      setShareUrl(url.toString());
      pushToast({ title: "Share link generated", variant: "success" });
    } catch (err) {
      pushToast({ title: "Failed to generate share link", variant: "error" });
    } finally {
      setIsPending(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    pushToast({ title: "Link copied to clipboard", variant: "success" });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) setShareUrl(null);
    }}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all">
            <Share2 className="w-4 h-4" />
            Share Report
          </button>
        )}
      </Dialog.Trigger>
      
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Shield className="w-5 h-5" />
                        </div>
                        <Dialog.Title className="font-serif text-xl text-white">
                          Share Redacted Report
                        </Dialog.Title>
                      </div>
                      <Dialog.Close asChild>
                        <button className="p-1 rounded-lg text-neutral-500 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </Dialog.Close>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Securely share your results without revealing sensitive details.
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    {!shareUrl ? (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm text-neutral-200">Redact PII</Label>
                              <p className="text-[10px] text-neutral-500">Hide names, emails, and identifiers.</p>
                            </div>
                            <Switch 
                              checked={settings.redactPII} 
                              onCheckedChange={(v) => setSettings(s => ({ ...s, redactPII: v }))} 
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm text-neutral-200">Redact Institutions</Label>
                              <p className="text-[10px] text-neutral-500">Replace bank names with generic labels.</p>
                            </div>
                            <Switch 
                              checked={settings.redactInstitutions} 
                              onCheckedChange={(v) => setSettings(s => ({ ...s, redactInstitutions: v }))} 
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm text-neutral-200">Redact Exact Balances</Label>
                              <p className="text-[10px] text-neutral-500">Show approximate ranges instead of exact $.</p>
                            </div>
                            <Switch 
                              checked={settings.redactExactBalances} 
                              onCheckedChange={(v) => setSettings(s => ({ ...s, redactExactBalances: v }))} 
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                          <div className="flex items-start gap-3">
                            <Lock className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <p className="text-[10px] text-neutral-400 leading-relaxed">
                              Reports are stored with salted hashes and expire in 30 days. You can revoke access at any time in Settings.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleShare}
                          disabled={isPending}
                          className="w-full py-3 rounded-xl bg-white text-neutral-950 font-bold text-sm hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                          Generate Share Link
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium text-emerald-400">Share link is ready!</p>
                        </div>

                        <div className="relative">
                          <input
                            readOnly
                            value={shareUrl}
                            className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-xs text-neutral-300 pr-12 focus:outline-none"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[10px] text-neutral-500 text-center">
                          Anyone with this link can view the redacted version of your report.
                        </p>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => window.open(shareUrl, '_blank')}
                            className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 font-medium text-xs hover:bg-white/5 transition-all"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => setOpen(false)}
                            className="flex-1 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
