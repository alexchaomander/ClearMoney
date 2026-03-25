"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Shield, Search, Home, Car, Loader2, MapPin, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  CashAccountType,
  CryptoChain,
  DebtType,
  InvestmentAccountType,
  RealEstateType,
  VehicleType,
  CollectibleType,
  MetalType,
  AlternativeAssetType,
  PropertySearchResult,
  VehicleSearchResult,
} from "@clearmoney/strata-sdk";
import { isValidVIN } from "@clearmoney/strata-sdk";
import { 
  useCashAccountMutations, 
  useDebtAccountMutations, 
  useCreateInvestmentAccount,
  useEquityGrantMutations,
  useCryptoWalletMutations,
  useRealEstateAssetMutations,
  useVehicleAssetMutations,
  useCollectibleAssetMutations,
  usePreciousMetalAssetMutations,
  useAlternativeAssetMutations,
  useSearchProperties,
  useSearchVehicles,
} from "@/lib/strata/hooks";
import { cn } from "@/lib/utils";

type TabKey = "cash" | "debt" | "investment" | "equity" | "crypto" | "real_estate" | "vehicle" | "collectible" | "metal" | "alternative";

const TABS: { key: TabKey; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "debt", label: "Debt" },
  { key: "investment", label: "Investment" },
  { key: "equity", label: "Equity" },
  { key: "crypto", label: "Crypto" },
  { key: "real_estate", label: "Property" },
  { key: "vehicle", label: "Vehicle" },
  { key: "collectible", label: "Luxury" },
  { key: "metal", label: "Metal" },
  { key: "alternative", label: "Alternative" },
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
  { value: "founder_stock", label: "Founder Stock" },
  { value: "safe", label: "SAFE" },
  { value: "convertible_note", label: "Convertible Note" },
];

const CRYPTO_CHAINS = [
  { value: "ethereum", label: "Ethereum / EVM" },
  { value: "solana", label: "Solana" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
];

const REAL_ESTATE_TYPES: { value: RealEstateType; label: string }[] = [
  { value: "primary_residence", label: "Primary Residence" },
  { value: "investment_property", label: "Investment Property" },
  { value: "vacation_home", label: "Vacation Home" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "boat", label: "Boat" },
  { value: "aircraft", label: "Aircraft" },
  { value: "other", label: "Other" },
];

const COLLECTIBLE_TYPES: { value: CollectibleType; label: string }[] = [
  { value: "art", label: "Art" },
  { value: "watch", label: "Watch" },
  { value: "handbag", label: "Handbag" },
  { value: "jewelry", label: "Jewelry" },
  { value: "wine", label: "Wine" },
  { value: "card", label: "Trading Cards" },
  { value: "other", label: "Other" },
];

const METAL_TYPES: { value: MetalType; label: string }[] = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "platinum", label: "Platinum" },
  { value: "palladium", label: "Palladium" },
];

const ALTERNATIVE_TYPES: { value: AlternativeAssetType; label: string }[] = [
  { value: "private_equity", label: "Private Equity" },
  { value: "angel_investment", label: "Angel Investment" },
  { value: "venture_capital", label: "Venture Capital" },
  { value: "hedge_fund", label: "Hedge Fund" },
  { value: "limited_partnership", label: "Limited Partnership" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all";
const selectClass =
  "w-full rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none";
const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-1.5 ml-1";

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
  const cryptoMutations = useCryptoWalletMutations();
  const realEstateMutations = useRealEstateAssetMutations();
  const vehicleMutations = useVehicleAssetMutations();
  const collectibleMutations = useCollectibleAssetMutations();
  const metalMutations = usePreciousMetalAssetMutations();
  const alternativeMutations = useAlternativeAssetMutations();

  const searchProperties = useSearchProperties();
  const searchVehicles = useSearchVehicles();

  // Mode states
  const [propertyMode, setPropertyMode] = useState<"search" | "manual">("search");
  const [vehicleMode, setVehicleMode] = useState<"search" | "manual">("search");

  // Search states
  const [reSearchQuery, setReSearchQuery] = useState("");
  const [reSearchResults, setReSearchResults] = useState<PropertySearchResult[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertySearchResult | null>(null);

  const [vSearchVin, setVSearchVin] = useState("");
  const [vSearchResults, setVSearchResults] = useState<VehicleSearchResult[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSearchResult | null>(null);

  const [propertySearchError, setPropertySearchError] = useState<string | null>(null);
  const [vehicleSearchError, setVehicleSearchError] = useState<string | null>(null);

  const handlePropertySearch = async () => {
    if (!reSearchQuery) return;
    setPropertySearchError(null);
    try {
      const results = await searchProperties.mutateAsync({ address: reSearchQuery });
      if (results.length === 0) {
        setPropertySearchError("No properties found for this address");
      }
      setReSearchResults(results);
    } catch {
      setPropertySearchError("Property search failed. Please try again.");
    }
  };

  const handleSelectProperty = (prop: PropertySearchResult) => {
    setSelectedProperty(prop);
    setReAddress(prop.address);
    setReName(prop.address.split(",")[0]);
    setReValue(prop.market_value?.toString() ?? "");
    setReZpid(prop.zillow_zpid);
    setReValuationType("auto");
    setPropertyMode("manual");
    setPropertySearchError(null);
  };

  const handleVehicleSearch = async () => {
    if (!vSearchVin) return;
    setVehicleSearchError(null);

    if (!isValidVIN(vSearchVin)) {
      setVehicleSearchError("Invalid 17-character VIN. I, O, and Q are not allowed.");
      return;
    }

    try {
      const results = await searchVehicles.mutateAsync({ vin: vSearchVin });
      if (results.length === 0) {
        setVehicleSearchError("Vehicle not found. Check the VIN and try again.");
      }
      setVSearchResults(results);
    } catch {
      setVehicleSearchError("Vehicle search failed. Please try again.");
    }
  };

  const handleSelectVehicle = (v: VehicleSearchResult) => {
    setSelectedVehicle(v);
    setVMake(v.make);
    setVModel(v.model);
    setVYear(v.year);
    setVName(`${v.year} ${v.make} ${v.model}`);
    setVVin(v.vin ?? "");
    setVValue(v.market_value?.toString() ?? "");
    setVValuationType("auto");
    setVehicleMode("manual");
  };

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
  const [equityCompanyName, setEquityCompanyName] = useState("");
  const [equityType, setEquityType] = useState("rsu");
  const [equityQuantity, setEquityQuantity] = useState("");
  const [equityStrike, setEquityStrike] = useState("");
  const [equityDate, setEquityDate] = useState("");
  const [equityValuationCap, setEquityValuationCap] = useState("");
  const [equityDiscountRate, setEquityDiscountRate] = useState("");
  const [equityAmountInvested, setEquityAmountInvested] = useState("");
  const [equityIs83bElected, setEquityIs83bElected] = useState(false);
  const [equityElectionDate, setEquityElectionDate] = useState("");
  const [equityIsQsbsEligible, setEquityIsQsbsEligible] = useState(false);
  const [equityQsbsHoldingStart, setEquityQsbsHoldingStart] = useState("");
  // Crypto form
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoChain, setCryptoChain] = useState<CryptoChain>("ethereum");
  const [cryptoLabel, setCryptoLabel] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  // Real Estate form
  const [reName, setReName] = useState("");
  const [reAddress, setReAddress] = useState("");
  const [reType, setReType] = useState<RealEstateType>("primary_residence");
  const [reValue, setReValue] = useState("");
  const [reZpid, setReZpid] = useState("");
  const [reValuationType, setReValuationType] = useState<"manual" | "auto">("auto");

  // Vehicle form
  const [vName, setVName] = useState("");
  const [vMake, setVMake] = useState("");
  const [vModel, setVModel] = useState("");
  const [vYear, setVYear] = useState(new Date().getFullYear());
  const [vType, setVType] = useState<VehicleType>("car");
  const [vValue, setVValue] = useState("");
  const [vVin, setVVin] = useState("");
  const [vMileage, setVMileage] = useState("");
  const [vValuationType, setVValuationType] = useState<"manual" | "auto">("auto");

  // Collectible form
  const [cName, setCName] = useState("");
  const [cType, setCType] = useState<CollectibleType>("watch");
  const [cValue, setCValue] = useState("");
  const [cValuationType, setCValuationType] = useState<"manual" | "auto">("manual");

  // Metal form
  const [mName, setMName] = useState("");
  const [mType, setMType] = useState<MetalType>("gold");
  const [mWeight, setMWeight] = useState("");
  const [mValue, setMValue] = useState("");
  const [mValuationType, setMValuationType] = useState<"manual" | "auto">("auto");

  // Alternative form
  const [altName, setAltName] = useState("");
  const [altType, setAltType] = useState<AlternativeAssetType>("private_equity");
  const [altValue, setAltValue] = useState("");
  const [altCostBasis, setAltCostBasis] = useState("");

  // Common
  const [isBusiness, setIsBusiness] = useState(false);

  function validateAddress(address: string, chain: string): boolean {
    if (!address) return false;
    
    if (chain === "ethereum" || chain === "polygon" || chain === "arbitrum" || chain === "base" || chain === "optimism") {
      const ethRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethRegex.test(address)) {
        setAddressError("Invalid Ethereum/EVM address format.");
        return false;
      }
    } else if (chain === "solana") {
      const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solRegex.test(address)) {
        setAddressError("Invalid Solana address format.");
        return false;
      }
    } else if (chain === "bitcoin") {
      const btcRegex = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
      if (!btcRegex.test(address)) {
        setAddressError("Invalid Bitcoin address format.");
        return false;
      }
    }
    
    setAddressError(null);
    return true;
  }

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
    setEquityCompanyName("");
    setEquityType("rsu");
    setEquityQuantity("");
    setEquityStrike("");
    setEquityDate("");
    setEquityValuationCap("");
    setEquityDiscountRate("");
    setEquityAmountInvested("");
    setEquityIs83bElected(false);
    setEquityElectionDate("");
    setEquityIsQsbsEligible(false);
    setEquityQsbsHoldingStart("");

    setCryptoAddress("");

    setCryptoChain("ethereum");
    setCryptoLabel("");
    setAddressError(null);

    setReName("");
    setReAddress("");
    setReType("primary_residence");
    setReValue("");
    setReZpid("");
    setReValuationType("auto");

    setVName("");
    setVMake("");
    setVModel("");
    setVYear(new Date().getFullYear());
    setVType("car");
    setVValue("");
    setVVin("");
    setVMileage("");
    setVValuationType("auto");

    setCName("");
    setCType("watch");
    setCValue("");
    setCValuationType("manual");

    setMName("");
    setMType("gold");
    setMWeight("");
    setMValue("");
    setMValuationType("auto");

    setAltName("");
    setAltType("private_equity");
    setAltValue("");
    setAltCostBasis("");
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
        symbol: equitySymbol ? equitySymbol.toUpperCase() : null,
        company_name: equityCompanyName || null,
        grant_type: equityType as any,
        quantity: equityQuantity ? parseFloat(equityQuantity) : 0,
        strike_price: equityStrike ? parseFloat(equityStrike) : null,
        grant_date: equityDate || new Date().toISOString().split('T')[0],
        valuation_cap: equityValuationCap ? parseFloat(equityValuationCap) : null,
        discount_rate: equityDiscountRate ? parseFloat(equityDiscountRate) / 100 : null,
        amount_invested: equityAmountInvested ? parseFloat(equityAmountInvested) : null,
        is_83b_elected: equityIs83bElected,
        election_date: equityElectionDate || null,
        is_qsbs_eligible: equityIsQsbsEligible,
        qsbs_holding_start: equityQsbsHoldingStart || null,
      });
    } else if (tab === "crypto") {
      if (!validateAddress(cryptoAddress, cryptoChain)) return;
      await cryptoMutations.add.mutateAsync({
        address: cryptoAddress,
        chain: cryptoChain,
        label: cryptoLabel || null,
      });
    } else if (tab === "real_estate") {
      await realEstateMutations.add.mutateAsync({
        name: reName,
        address: reAddress,
        property_type: reType,
        market_value: reValue ? parseFloat(reValue) : 0,
        valuation_type: reValuationType,
        zillow_zpid: reZpid || undefined,
      });
    } else if (tab === "vehicle") {
      await vehicleMutations.add.mutateAsync({
        name: vName,
        make: vMake,
        model: vModel,
        year: vYear,
        vehicle_type: vType,
        market_value: vValue ? parseFloat(vValue) : 0,
        vin: vVin || undefined,
        mileage: vMileage ? parseInt(vMileage) : undefined,
        valuation_type: vValuationType,
      });
    } else if (tab === "collectible") {
      await collectibleMutations.add.mutateAsync({
        name: cName,
        item_type: cType,
        market_value: cValue ? parseFloat(cValue) : 0,
        valuation_type: cValuationType,
      });
    } else if (tab === "metal") {
      await metalMutations.add.mutateAsync({
        name: mName,
        metal_type: mType,
        weight_oz: mWeight ? parseFloat(mWeight) : 0,
        market_value: mValue ? parseFloat(mValue) : 0,
        valuation_type: mValuationType,
      });
    } else if (tab === "alternative") {
      await alternativeMutations.add.mutateAsync({
        name: altName,
        asset_type: altType,
        market_value: altValue ? parseFloat(altValue) : 0,
        cost_basis: altCostBasis ? parseFloat(altCostBasis) : null,
      });
    }
    handleClose();
  }

  const isPending = 
    cashMutations.create.isPending || 
    debtMutations.create.isPending || 
    createInvestment.isPending ||
    equityMutations.add.isPending ||
    cryptoMutations.add.isPending ||
    realEstateMutations.add.isPending ||
    vehicleMutations.add.isPending ||
    collectibleMutations.add.isPending ||
    metalMutations.add.isPending ||
    alternativeMutations.add.isPending;

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
                  <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-950/50 mx-8 mt-6 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
                    {TABS.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 min-w-[80px] px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
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
                          {["rsu", "iso", "nso", "founder_stock"].includes(equityType) ? (
                            <div>
                              <label className={labelClass}>Ticker Symbol</label>
                              <input className={cn(inputClass, "font-mono uppercase")} value={equitySymbol} onChange={(e) => setEquitySymbol(e.target.value)} placeholder="AAPL" />
                            </div>
                          ) : (
                            <div>
                              <label className={labelClass}>Company Name</label>
                              <input className={inputClass} value={equityCompanyName} onChange={(e) => setEquityCompanyName(e.target.value)} placeholder="e.g. Stripe" />
                            </div>
                          )}
                          <div>
                            <label className={labelClass}>Grant / Asset Type</label>
                            <select className={selectClass} value={equityType} onChange={(e) => setEquityType(e.target.value)}>
                              {EQUITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Description</label>
                          <input className={inputClass} value={equityName} onChange={(e) => setEquityName(e.target.value)} placeholder="e.g. Initial Hire Grant" required />
                        </div>
                        
                        {["safe", "convertible_note"].includes(equityType) ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Amount Invested</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={equityAmountInvested} onChange={(e) => setEquityAmountInvested(e.target.value)} placeholder="0.00" required />
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>Valuation Cap</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input className={cn(inputClass, "pl-7")} type="number" step="1" value={equityValuationCap} onChange={(e) => setEquityValuationCap(e.target.value)} placeholder="e.g. 10000000" />
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>Discount Rate (%)</label>
                              <input className={inputClass} type="number" step="0.01" value={equityDiscountRate} onChange={(e) => setEquityDiscountRate(e.target.value)} placeholder="e.g. 20" />
                            </div>
                            <div>
                              <label className={labelClass}>Date</label>
                              <input className={inputClass} type="date" value={equityDate} onChange={(e) => setEquityDate(e.target.value)} required />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Total Shares</label>
                              <input className={inputClass} type="number" step="1" value={equityQuantity} onChange={(e) => setEquityQuantity(e.target.value)} placeholder="0" required />
                            </div>
                            <div>
                              <label className={labelClass}>Strike Price / 409A</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={equityStrike} onChange={(e) => setEquityStrike(e.target.value)} placeholder="0.00" disabled={equityType === "rsu"} />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className={labelClass}>Grant Date</label>
                              <input className={inputClass} type="date" value={equityDate} onChange={(e) => setEquityDate(e.target.value)} required />
                            </div>
                          </div>
                        )}

                        <div className="pt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                  <input type="checkbox" checked={equityIs83bElected} onChange={(e) => setEquityIs83bElected(e.target.checked)} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">83(b) Elected</span>
                              </label>

                              {equityIs83bElected && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                  <label className={labelClass}>Election Date</label>
                                  <input className={inputClass} type="date" value={equityElectionDate} onChange={(e) => setEquityElectionDate(e.target.value)} />
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                  <input type="checkbox" checked={equityIsQsbsEligible} onChange={(e) => setEquityIsQsbsEligible(e.target.checked)} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">QSBS Eligible</span>
                              </label>

                              {equityIsQsbsEligible && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                  <label className={labelClass}>Holding Start</label>
                                  <input className={inputClass} type="date" value={equityQsbsHoldingStart} onChange={(e) => setEquityQsbsHoldingStart(e.target.value)} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {tab === "crypto" && (
                      <>
                        <div>
                          <label className={labelClass}>Wallet Address</label>
                          <input 
                            className={cn(inputClass, "font-mono", addressError && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20")} 
                            value={cryptoAddress} 
                            onChange={(e) => {
                              setCryptoAddress(e.target.value);
                              if (addressError) setAddressError(null);
                            }} 
                            placeholder="0x... or Solana address" 
                            required 
                          />
                          {addressError && (
                            <p className="mt-1 text-xs font-bold text-rose-500 uppercase tracking-tight ml-1">{addressError}</p>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>Network / Chain</label>
                          <select className={selectClass} value={cryptoChain} onChange={(e) => {
                            setCryptoChain(e.target.value as CryptoChain);
                            if (addressError) setAddressError(null);
                          }}>
                            {CRYPTO_CHAINS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Label (Optional)</label>
                          <input className={inputClass} value={cryptoLabel} onChange={(e) => setCryptoLabel(e.target.value)} placeholder="e.g. Ledger Nano X" />
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                            <span className="font-black uppercase mr-1">Read-Only:</span>
                            We only need your public address. ClearMoney will never ask for your private keys or seed phrase.
                          </p>
                        </div>
                      </>
                    )}

                    {tab === "real_estate" && (
                      <div className="space-y-5">
                        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setPropertyMode("search")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                              propertyMode === "search" ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" : "text-slate-500"
                            )}
                          >
                            <Zap className="w-3 h-3" />
                            Auto-Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setPropertyMode("manual")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                              propertyMode === "manual" ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" : "text-slate-500"
                            )}
                          >
                            <MapPin className="w-3 h-3" />
                            Manual
                          </button>
                        </div>

                        {propertyMode === "search" ? (
                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>Search Property Address</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    className={cn(inputClass, "pl-10")} 
                                    value={reSearchQuery} 
                                    onChange={(e) => {
                                      setReSearchQuery(e.target.value);
                                      if (reSearchResults.length > 0) setReSearchResults([]);
                                      if (propertySearchError) setPropertySearchError(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handlePropertySearch())}
                                    placeholder="Enter full address..." 
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handlePropertySearch}
                                  disabled={searchProperties.isPending}
                                  className="px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                >
                                  {searchProperties.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                </button>
                              </div>
                            </div>

                            {propertySearchError && (
                              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-2">
                                <Shield className="w-3 h-3 text-rose-500" />
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight">{propertySearchError}</p>
                              </div>
                            )}

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                              {reSearchResults.map((res) => (
                                <button
                                  key={res.zillow_zpid}
                                  type="button"
                                  onClick={() => handleSelectProperty(res)}
                                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                                      <Home className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white">{res.address}</p>
                                      <p className="text-xs text-slate-500">{res.city}, {res.state}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 dark:text-white">
                                      {res.market_value != null ? `$${(Number(res.market_value) / 1000).toFixed(0)}k` : "N/A"}
                                    </p>
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Zestimate</p>
                                  </div>
                                </button>
                              ))}
                              {reSearchQuery && reSearchResults.length === 0 && !searchProperties.isPending && (
                                <p className="text-xs text-center py-4 text-slate-400 font-bold uppercase tracking-widest">Enter an address to auto-link</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className={labelClass}>Property Name</label>
                                <input className={inputClass} value={reName} onChange={(e) => setReName(e.target.value)} placeholder="e.g. Primary Residence" required />
                              </div>
                              <div className="col-span-2">
                                <label className={labelClass}>Address</label>
                                <input className={inputClass} value={reAddress} onChange={(e) => setReAddress(e.target.value)} placeholder="Full street address, city, state, zip" required />
                              </div>
                              <div>
                                <label className={labelClass}>Property Type</label>
                                <select className={selectClass} value={reType} onChange={(e) => setReType(e.target.value as RealEstateType)}>
                                  {REAL_ESTATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelClass}>Market Value</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                  <input className={cn(inputClass, "pl-7")} type="number" step="1" value={reValue} onChange={(e) => setReValue(e.target.value)} placeholder="0" />
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 space-y-4">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                  <input type="checkbox" checked={reValuationType === 'auto'} onChange={(e) => setReValuationType(e.target.checked ? 'auto' : 'manual')} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Auto-sync valuation (Zillow)</span>
                              </label>

                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <label className={labelClass}>Zillow Property ID (ZPID)</label>
                                  <input className={inputClass} value={reZpid} onChange={(e) => setReZpid(e.target.value)} placeholder="Optional ZPID" />
                                </div>
                              </div>

                              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                                  <span className="font-black uppercase mr-1">Zillow Integration:</span>
                                  We'll use your address to fetch live Zestimates. If the match isn't perfect, you can provide a Zillow Property ID (ZPID).
                                </p>
                              </div>
                            </div>
                            <button type="button" onClick={() => setPropertyMode("search")} className="w-full py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors">← Back to Address Search</button>
                          </>
                        )}
                      </div>
                    )}

                    {tab === "vehicle" && (
                      <div className="space-y-5">
                        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setVehicleMode("search")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                              vehicleMode === "search" ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" : "text-slate-500"
                            )}
                          >
                            <Zap className="w-3 h-3" />
                            Auto-Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setVehicleMode("manual")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                              vehicleMode === "manual" ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" : "text-slate-500"
                            )}
                          >
                            <MapPin className="w-3 h-3" />
                            Manual
                          </button>
                        </div>

                        {vehicleMode === "search" ? (
                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>Vehicle VIN</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    className={cn(inputClass, "pl-10 font-mono")} 
                                    value={vSearchVin} 
                                    onChange={(e) => {
                                      setVSearchVin(e.target.value.toUpperCase());
                                      if (vSearchResults.length > 0) setVSearchResults([]);
                                      if (vehicleSearchError) setVehicleSearchError(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleVehicleSearch())}
                                    placeholder="Enter 17-digit VIN..." 
                                    maxLength={17}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleVehicleSearch}
                                  disabled={searchVehicles.isPending}
                                  className="px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                >
                                  {searchVehicles.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Identify"}
                                </button>
                              </div>
                            </div>

                            {vehicleSearchError && (
                              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-2">
                                <Shield className="w-3 h-3 text-rose-500" />
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight">{vehicleSearchError}</p>
                              </div>
                            )}

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                              {vSearchResults.map((res, i) => (
                                <button
                                  key={res.vin || i}
                                  type="button"
                                  onClick={() => handleSelectVehicle(res)}
                                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                                      <Car className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white">{res.year} {res.make} {res.model}</p>
                                      <p className="text-xs text-slate-500 uppercase tracking-widest">{res.vin}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 dark:text-white">
                                      {res.market_value != null ? `$${(Number(res.market_value) / 1000).toFixed(1)}k` : "N/A"}
                                    </p>
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">KBB Value</p>
                                  </div>
                                </button>
                              ))}
                              {vSearchVin && vSearchResults.length === 0 && !searchVehicles.isPending && (
                                <p className="text-xs text-center py-4 text-slate-400 font-bold uppercase tracking-widest">Enter VIN to identify specs & value</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className={labelClass}>Vehicle Name</label>
                                <input className={inputClass} value={vName} onChange={(e) => setVName(e.target.value)} placeholder="e.g. Daily Driver" required />
                              </div>
                              <div>
                                <label className={labelClass}>Make</label>
                                <input className={inputClass} value={vMake} onChange={(e) => setVMake(e.target.value)} placeholder="e.g. Tesla" required />
                              </div>
                              <div>
                                <label className={labelClass}>Model</label>
                                <input className={inputClass} value={vModel} onChange={(e) => setVModel(e.target.value)} placeholder="e.g. Model 3" required />
                              </div>
                              <div>
                                <label className={labelClass}>Year</label>
                                <input className={inputClass} type="number" value={vYear} onChange={(e) => setVYear(parseInt(e.target.value))} required />
                              </div>
                              <div>
                                <label className={labelClass}>Vehicle Type</label>
                                <select className={selectClass} value={vType} onChange={(e) => setVType(e.target.value as VehicleType)}>
                                  {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>{vValuationType === "auto" ? "Estimated Value" : "Manual Value"}</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                  <input className={cn(inputClass, "pl-7")} type="number" step="1" value={vValue} onChange={(e) => setVValue(e.target.value)} placeholder="0" />
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>Mileage</label>
                                <input className={inputClass} type="number" value={vMileage} onChange={(e) => setVMileage(e.target.value)} placeholder="Optional" />
                              </div>
                            </div>

                            <div className="pt-2 space-y-4">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                  <input type="checkbox" checked={vValuationType === 'auto'} onChange={(e) => setVValuationType(e.target.checked ? 'auto' : 'manual')} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Auto-sync valuation (KBB)</span>
                              </label>

                              <div>
                                <label className={labelClass}>VIN</label>
                                <input className={cn(inputClass, "font-mono")} value={vVin} onChange={(e) => setVVin(e.target.value.toUpperCase())} placeholder="17-digit VIN" />
                              </div>

                              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                                  <span className="font-black uppercase mr-1">KBB Integration:</span>
                                  We use your VIN to fetch specific build specs and live market values. If you don't have a VIN, you can enter specs manually.
                                </p>
                              </div>
                            </div>
                            <button type="button" onClick={() => setVehicleMode("search")} className="w-full py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors">← Back to VIN Search</button>
                          </>
                        )}
                      </div>
                    )}

                    {tab === "collectible" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Item Name</label>
                            <input className={inputClass} value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Rolex Submariner" required />
                          </div>
                          <div>
                            <label className={labelClass}>Item Type</label>
                            <select className={selectClass} value={cType} onChange={(e) => setCType(e.target.value as CollectibleType)}>
                              {COLLECTIBLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Estimated Value</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input className={cn(inputClass, "pl-7")} type="number" step="1" value={cValue} onChange={(e) => setCValue(e.target.value)} placeholder="0" required />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                            ClearMoney focuses on high-integrity manual valuation for unique luxury assets. Auto-valuation for watches via Chrono24 is currently in pilot.
                          </p>
                        </div>
                      </>
                    )}

                    {tab === "metal" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Asset Name</label>
                            <input className={inputClass} value={mName} onChange={(e) => setMName(e.target.value)} placeholder="e.g. Gold Bullion" required />
                          </div>
                          <div>
                            <label className={labelClass}>Metal Type</label>
                            <select className={selectClass} value={mType} onChange={(e) => setMType(e.target.value as MetalType)}>
                              {METAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Weight (Troy Oz)</label>
                            <input className={inputClass} type="number" step="0.001" value={mWeight} onChange={(e) => setMWeight(e.target.value)} placeholder="0.000" required />
                          </div>
                        </div>
                        
                        <div className="pt-2 space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input type="checkbox" checked={mValuationType === 'auto'} onChange={(e) => setMValuationType(e.target.checked ? 'auto' : 'manual')} className="peer appearance-none w-5 h-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Auto-sync spot price</span>
                          </label>

                          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                              <span className="font-black uppercase mr-1">Spot Price Integration:</span>
                              We fetch real-time market data for gold, silver, platinum, and palladium to keep your metal holdings current.
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {tab === "alternative" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Asset Name</label>
                            <input className={inputClass} value={altName} onChange={(e) => setAltName(e.target.value)} placeholder="e.g. SpaceX Series B" required />
                          </div>
                          <div>
                            <label className={labelClass}>Asset Type</label>
                            <select className={selectClass} value={altType} onChange={(e) => setAltType(e.target.value as AlternativeAssetType)}>
                              {ALTERNATIVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Market Value</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={altValue} onChange={(e) => setAltValue(e.target.value)} placeholder="0.00" required />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className={labelClass}>Cost Basis (Optional)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input className={cn(inputClass, "pl-7")} type="number" step="0.01" value={altCostBasis} onChange={(e) => setAltCostBasis(e.target.value)} placeholder="0.00" />
                            </div>
                          </div>
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
