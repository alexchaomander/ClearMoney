"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  CashAccountType,
  DebtType,
  InvestmentAccountType,
} from "@clearmoney/strata-sdk";
import { useCashAccountMutations, useDebtAccountMutations } from "@/lib/strata/hooks";

type TabKey = "cash" | "debt" | "investment";

const TABS: { key: TabKey; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "debt", label: "Debt" },
  { key: "investment", label: "Investment" },
];

const CASH_TYPES: { value: CashAccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "money_market", label: "Money Market" },
  { value: "cd", label: "CD" },
  { value: "other", label: "Other" },
];

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "student_loan", label: "Student Loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "auto_loan", label: "Auto Loan" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
];

const INVESTMENT_TYPES: { value: InvestmentAccountType; label: string }[] = [
  { value: "brokerage", label: "Brokerage" },
  { value: "ira", label: "IRA" },
  { value: "roth_ira", label: "Roth IRA" },
  { value: "401k", label: "401(k)" },
  { value: "403b", label: "403(b)" },
  { value: "hsa", label: "HSA" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors";
const selectClass =
  "w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors";
const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  const [tab, setTab] = useState<TabKey>("cash");
  const cashMutations = useCashAccountMutations();
  const debtMutations = useDebtAccountMutations();

  // Cash form
  const [cashName, setCashName] = useState("");
  const [cashType, setCashType] = useState<CashAccountType>("checking");
  const [cashBalance, setCashBalance] = useState("");
  const [cashApy, setCashApy] = useState("");
  const [cashInstitution, setCashInstitution] = useState("");

  // Debt form
  const [debtName, setDebtName] = useState("");
  const [debtType, setDebtType] = useState<DebtType>("credit_card");
  const [debtBalance, setDebtBalance] = useState("");
  const [debtRate, setDebtRate] = useState("");
  const [debtMinPayment, setDebtMinPayment] = useState("");
  const [debtInstitution, setDebtInstitution] = useState("");

  // Investment form
  const [investName, setInvestName] = useState("");
  const [investType, setInvestType] = useState<InvestmentAccountType>("brokerage");
  const [investBalance, setInvestBalance] = useState("");
  const [investTaxAdvantaged, setInvestTaxAdvantaged] = useState(false);

  function resetForms() {
    setCashName("");
    setCashType("checking");
    setCashBalance("");
    setCashApy("");
    setCashInstitution("");

    setDebtName("");
    setDebtType("credit_card");
    setDebtBalance("");
    setDebtRate("");
    setDebtMinPayment("");
    setDebtInstitution("");

    setInvestName("");
    setInvestType("brokerage");
    setInvestBalance("");
    setInvestTaxAdvantaged(false);
  }

  function handleClose() {
    resetForms();
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "cash") {
      await cashMutations.create.mutateAsync({
        name: cashName,
        account_type: cashType,
        balance: cashBalance ? parseFloat(cashBalance) : 0,
        apy: cashApy ? parseFloat(cashApy) : null,
        institution_name: cashInstitution || null,
      });
    } else if (tab === "debt") {
      await debtMutations.create.mutateAsync({
        name: debtName,
        debt_type: debtType,
        balance: debtBalance ? parseFloat(debtBalance) : 0,
        interest_rate: debtRate ? parseFloat(debtRate) : 0,
        minimum_payment: debtMinPayment ? parseFloat(debtMinPayment) : 0,
        institution_name: debtInstitution || null,
      });
    }
    // Investment tab is a placeholder — manual investment accounts
    // can be added in a future iteration via the backend
    handleClose();
  }

  const isPending = cashMutations.create.isPending || debtMutations.create.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <Dialog.Title className="font-serif text-xl text-white">
                      Add Account
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 px-6 mb-4">
                    {TABS.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          tab === t.key
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                    {tab === "cash" && (
                      <>
                        <div>
                          <label className={labelClass}>Account Name</label>
                          <input className={inputClass} value={cashName} onChange={(e) => setCashName(e.target.value)} placeholder="e.g. Chase Checking" required />
                        </div>
                        <div>
                          <label className={labelClass}>Account Type</label>
                          <select className={selectClass} value={cashType} onChange={(e) => setCashType(e.target.value as CashAccountType)}>
                            {CASH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Balance</label>
                            <input className={inputClass} type="number" step="0.01" value={cashBalance} onChange={(e) => setCashBalance(e.target.value)} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelClass}>APY (%)</label>
                            <input className={inputClass} type="number" step="0.01" value={cashApy} onChange={(e) => setCashApy(e.target.value)} placeholder="0.00" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Institution</label>
                          <input className={inputClass} value={cashInstitution} onChange={(e) => setCashInstitution(e.target.value)} placeholder="e.g. Chase" />
                        </div>
                      </>
                    )}

                    {tab === "debt" && (
                      <>
                        <div>
                          <label className={labelClass}>Account Name</label>
                          <input className={inputClass} value={debtName} onChange={(e) => setDebtName(e.target.value)} placeholder="e.g. Visa Card" required />
                        </div>
                        <div>
                          <label className={labelClass}>Debt Type</label>
                          <select className={selectClass} value={debtType} onChange={(e) => setDebtType(e.target.value as DebtType)}>
                            {DEBT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Balance</label>
                            <input className={inputClass} type="number" step="0.01" value={debtBalance} onChange={(e) => setDebtBalance(e.target.value)} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelClass}>Interest Rate (%)</label>
                            <input className={inputClass} type="number" step="0.01" value={debtRate} onChange={(e) => setDebtRate(e.target.value)} placeholder="0.00" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Min. Payment</label>
                            <input className={inputClass} type="number" step="0.01" value={debtMinPayment} onChange={(e) => setDebtMinPayment(e.target.value)} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelClass}>Institution</label>
                            <input className={inputClass} value={debtInstitution} onChange={(e) => setDebtInstitution(e.target.value)} placeholder="e.g. Chase" />
                          </div>
                        </div>
                      </>
                    )}

                    {tab === "investment" && (
                      <>
                        <div>
                          <label className={labelClass}>Account Name</label>
                          <input className={inputClass} value={investName} onChange={(e) => setInvestName(e.target.value)} placeholder="e.g. Fidelity 401(k)" required />
                        </div>
                        <div>
                          <label className={labelClass}>Account Type</label>
                          <select className={selectClass} value={investType} onChange={(e) => setInvestType(e.target.value as InvestmentAccountType)}>
                            {INVESTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Balance</label>
                          <input className={inputClass} type="number" step="0.01" value={investBalance} onChange={(e) => setInvestBalance(e.target.value)} placeholder="0.00" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={investTaxAdvantaged} onChange={(e) => setInvestTaxAdvantaged(e.target.checked)} className="rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500" />
                          <span className="text-sm text-neutral-300">Tax-advantaged account</span>
                        </label>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {isPending ? "Adding..." : "Add Account"}
                    </button>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
