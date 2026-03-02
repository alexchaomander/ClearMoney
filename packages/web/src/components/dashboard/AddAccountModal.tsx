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
import { 
  useCashAccountMutations, 
  useDebtAccountMutations, 
  useCreateInvestmentAccount,
  useEquityGrantMutations
} from "@/lib/strata/hooks";
import { cn } from "@/lib/utils";

type TabKey = "cash" | "debt" | "investment" | "equity";

const TABS: { key: TabKey; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "debt", label: "Debt" },
  { key: "investment", label: "Investment" },
  { key: "equity", label: "Equity" },
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

const EQUITY_TYPES = [
  { value: "rsu", label: "RSU" },
  { value: "iso", label: "Stock Options (ISO)" },
  { value: "nso", label: "Stock Options (NSO)" },
];

const inputClass =
  "w-full rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all";
const selectClass =
  "w-full rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none";
const labelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-1.5 ml-1";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  const [tab, setTab] = useState<TabKey>("cash");
  const cashMutations = useCashAccountMutations();
  const debtMutations = useDebtAccountMutations();
  const createInvestment = useCreateInvestmentAccount();
  const equityMutations = useEquityGrantMutations();

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

  // Equity form
  const [equityName, setEquityName] = useState("");
  const [equitySymbol, setEquitySymbol] = useState("");
  const [equityType, setEquityType] = useState("rsu");
  const [equityQuantity, setEquityQuantity] = useState("");
  const [equityStrike, setEquityStrike] = useState("");
  const [equityDate, setEquityDate] = useState("");

  // Common
  const [isBusiness, setIsBusiness] = useState(false);

  function resetForms() {
    setIsBusiness(false);
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

    setEquityName("");
    setEquitySymbol("");
    setEquityType("rsu");
    setEquityQuantity("");
    setEquityStrike("");
    setEquityDate("");
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
        is_business: isBusiness,
      });
    } else if (tab === "debt") {
      await debtMutations.create.mutateAsync({
        name: debtName,
        debt_type: debtType,
        balance: debtBalance ? parseFloat(debtBalance) : 0,
        interest_rate: debtRate ? parseFloat(debtRate) : 0,
        minimum_payment: debtMinPayment ? parseFloat(debtMinPayment) : 0,
        institution_name: debtInstitution || null,
        is_business: isBusiness,
      });
    } else if (tab === "investment") {
      await createInvestment.mutateAsync({
        name: investName,
        account_type: investType,
        balance: investBalance ? parseFloat(investBalance) : 0,
        is_tax_advantaged: investTaxAdvantaged,
        is_business: isBusiness,
      });
    } else if (tab === "equity") {
      await equityMutations.add.mutateAsync({
        grant_name: equityName,
        symbol: equitySymbol.toUpperCase(),
        grant_type: equityType,
        quantity: parseFloat(equityQuantity),
        strike_price: equityStrike ? parseFloat(equityStrike) : null,
        grant_date: equityDate || new Date().toISOString().split('T')[0],
      });
    }
    handleClose();
  }

  const isPending = 
    cashMutations.create.isPending || 
    debtMutations.create.isPending || 
    createInvestment.isPending ||
    equityMutations.add.isPending;

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
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl pointer-events-auto overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-50 dark:border-slate-800">
                    <Dialog.Title className="font-serif text-2xl text-slate-900 dark:text-white">
                      Add Asset
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-950/50 mx-8 mt-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {TABS.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                          tab === t.key
                            ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5"
                            : "text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {tab === "cash" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Account Name</label>
                            <input className={inputClass} value={cashName} onChange={(e) => setCashName(e.target.value)} placeholder="e.g. Chase Checking" required />
                          </div>
                          <div>
                            <label className={labelClass}>Account Type</label>
                            <select className={selectClass} value={cashType} onChange={(e) => setCashType(e.target.value as CashAccountType)}>
                              {CASH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Institution</label>
                            <input className={inputClass} value={cashInstitution} onChange={(e) => setCashInstitution(e.target.value)} placeholder="e.g. Chase" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Current Balance</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={cashBalance} onChange={(e) => setCashBalance(e.target.value)} placeholder="0.00" />
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>APY (%)</label>
                            <input className={inputClass} type="number" step="0.01" value={cashApy} onChange={(e) => setCashApy(e.target.value)} placeholder="0.00" />
                          </div>
                        </div>
                      </>
                    )}

                    {tab === "debt" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Account Name</label>
                            <input className={inputClass} value={debtName} onChange={(e) => setDebtName(e.target.value)} placeholder="e.g. Visa Card" required />
                          </div>
                          <div>
                            <label className={labelClass}>Debt Type</label>
                            <select className={selectClass} value={debtType} onChange={(e) => setDebtType(e.target.value as DebtType)}>
                              {DEBT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Institution</label>
                            <input className={inputClass} value={debtInstitution} onChange={(e) => setDebtInstitution(e.target.value)} placeholder="e.g. Chase" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>Balance</label>
                            <input className={inputClass} type="number" step="0.01" value={debtBalance} onChange={(e) => setDebtBalance(e.target.value)} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelClass}>APR (%)</label>
                            <input className={inputClass} type="number" step="0.01" value={debtRate} onChange={(e) => setDebtRate(e.target.value)} placeholder="0.00" required />
                          </div>
                          <div>
                            <label className={labelClass}>Min Pay</label>
                            <input className={inputClass} type="number" step="0.01" value={debtMinPayment} onChange={(e) => setDebtMinPayment(e.target.value)} placeholder="0.00" />
                          </div>
                        </div>
                      </>
                    )}

                    {tab === "investment" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Account Name</label>
                            <input className={inputClass} value={investName} onChange={(e) => setInvestName(e.target.value)} placeholder="e.g. Fidelity 401(k)" required />
                          </div>
                          <div className="col-span-2">
                            <label className={labelClass}>Account Type</label>
                            <select className={selectClass} value={investType} onChange={(e) => setInvestType(e.target.value as InvestmentAccountType)}>
                              {INVESTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className={labelClass}>Balance</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={investBalance} onChange={(e) => setInvestBalance(e.target.value)} placeholder="0.00" />
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input type="checkbox" checked={investTaxAdvantaged} onChange={(e) => setInvestTaxAdvantaged(e.target.checked)} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Tax-advantaged account</span>
                          </label>
                        </div>
                      </>
                    )}

                    {tab === "equity" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Ticker Symbol</label>
                            <input className={cn(inputClass, "font-mono uppercase")} value={equitySymbol} onChange={(e) => setEquitySymbol(e.target.value)} placeholder="AAPL" required />
                          </div>
                          <div>
                            <label className={labelClass}>Grant Type</label>
                            <select className={selectClass} value={equityType} onChange={(e) => setEquityType(e.target.value)}>
                              {EQUITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Grant Description</label>
                          <input className={inputClass} value={equityName} onChange={(e) => setEquityName(e.target.value)} placeholder="e.g. Initial Hire Grant" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Total Shares</label>
                            <input className={inputClass} type="number" step="1" value={equityQuantity} onChange={(e) => setEquityQuantity(e.target.value)} placeholder="0" required />
                          </div>
                          <div>
                            <label className={labelClass}>Strike Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={equityStrike} onChange={(e) => setEquityStrike(e.target.value)} placeholder="0.00" disabled={equityType === "rsu"} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Grant Date</label>
                          <input className={inputClass} type="date" value={equityDate} onChange={(e) => setEquityDate(e.target.value)} required />
                        </div>
                      </>
                    )}

                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={isBusiness} onChange={(e) => setIsBusiness(e.target.checked)} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Business-related asset</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl"
                    >
                      {isPending ? "Syncing..." : "Add Asset to Surface"}
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
