"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  User,
  Settings,
  CreditCard,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Zap,
  BarChart3,
  Landmark,
  Wallet,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { usePrivacy } from "@/lib/privacy-context";
import { useAccounts, useConnections } from "@/lib/strata/hooks";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { isVanished, toggleVanish } = usePrivacy();
  const { data: accounts } = useAccounts();
  const { data: connections } = useConnections();

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10"
                >
                  <Command className="flex h-full w-full flex-col overflow-hidden">
                    <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4" cmdk-input-wrapper="">
                      <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                      <Command.Input
                        placeholder="Search for anything... (e.g. 'settings', 'fidelity', 'vanish')"
                        className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-white"
                      />
                    </div>
                    <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
                      <Command.Empty className="py-14 text-center text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-slate-300" />
                          <p className="text-slate-500">No results found for your query.</p>
                        </div>
                      </Command.Empty>

                      <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          <span>Dashboard</span>
                          <CommandShortcut>G D</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/war-room"))}>
                          <Zap className="mr-3 h-4 w-4" />
                          <span>War Room</span>
                          <CommandShortcut>G W</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
                          <User className="mr-3 h-4 w-4" />
                          <span>Profile</span>
                          <CommandShortcut>G P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                          <Settings className="mr-3 h-4 w-4" />
                          <span>Settings</span>
                          <CommandShortcut>G S</CommandShortcut>
                        </CommandItem>
                      </Command.Group>

                      <Command.Separator className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                      <Command.Group heading="Actions" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        <CommandItem onSelect={() => runCommand(toggleVanish)}>
                          {isVanished ? <Eye className="mr-3 h-4 w-4" /> : <EyeOff className="mr-3 h-4 w-4" />}
                          <span>{isVanished ? "Disable Vanish Mode" : "Enable Vanish Mode"}</span>
                          <CommandShortcut>⌘ I</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/connect"))}>
                          <Plus className="mr-3 h-4 w-4" />
                          <span>Connect New Institution</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/settings?tab=general"))}>
                          <RefreshCw className="mr-3 h-4 w-4" />
                          <span>Sync All Connections</span>
                        </CommandItem>
                      </Command.Group>

                      {connections && connections.length > 0 && (
                        <>
                          <Command.Separator className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
                          <Command.Group heading="Institutions" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            {connections.map((conn) => (
                              <CommandItem key={conn.id} onSelect={() => runCommand(() => router.push(`/dashboard/connections/${conn.id}`))}>
                                <Landmark className="mr-3 h-4 w-4 text-emerald-500" />
                                <span>{conn.provider} connection</span>
                              </CommandItem>
                            ))}
                          </Command.Group>
                        </>
                      )}

                      {accounts && accounts.cash_accounts.length > 0 && (
                        <>
                          <Command.Separator className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
                          <Command.Group heading="Accounts" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            {[...accounts.cash_accounts, ...accounts.investment_accounts].map((acc) => (
                              <CommandItem key={acc.id} onSelect={() => runCommand(() => router.push(`/dashboard/accounts/${acc.id}`))}>
                                <Wallet className="mr-3 h-4 w-4 text-brand-500" />
                                <span>{acc.name}</span>
                              </CommandItem>
                            ))}
                          </Command.Group>
                        </>
                      )}
                    </Command.List>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 font-sans font-medium text-slate-500 dark:text-slate-400">↑↓</kbd>
                          <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 font-sans font-medium text-slate-500 dark:text-slate-400">↵</kbd>
                          <span>Select</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span>Secure Terminal</span>
                      </div>
                    </div>
                  </Command>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function CommandItem({ 
  children, 
  onSelect, 
  className 
}: { 
  children: React.ReactNode; 
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-emerald-500 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150",
        className
      )}
    >
      {children}
    </Command.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] font-black tracking-widest text-slate-400 aria-selected:text-emerald-100",
        className
      )}
      {...props}
    />
  );
}
