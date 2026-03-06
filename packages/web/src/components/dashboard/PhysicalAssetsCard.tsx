"use client";

import React from "react";
import { 
  Home, 
  Car, 
  TrendingUp, 
  MapPin, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Info,
  ChevronRight,
  Zap,
  ShieldCheck,
  Building2,
  Navigation,
  Watch,
  Gem,
  Coins,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { 
  PhysicalAssetsSummary, 
  RealEstateAsset, 
  VehicleAsset,
  CollectibleAsset,
  PreciousMetalAsset,
  AlternativeAsset
} from "@clearmoney/strata-sdk";

interface PhysicalAssetsCardProps {
  summary: PhysicalAssetsSummary;
  onRefreshRealEstate: (id: string) => void;
  onRefreshVehicle: (id: string) => void;
  onRefreshCollectible: (id: string) => void;
  onRefreshMetal: (id: string) => void;
  onDeleteRealEstate: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
  onDeleteCollectible: (id: string) => void;
  onDeleteMetal: (id: string) => void;
  onDeleteAlternative: (id: string) => void;
  onAddAsset: () => void;
}

export function PhysicalAssetsCard({ 
  summary, 
  onRefreshRealEstate, 
  onRefreshVehicle,
  onRefreshCollectible,
  onRefreshMetal,
  onDeleteRealEstate,
  onDeleteVehicle,
  onDeleteCollectible,
  onDeleteMetal,
  onDeleteAlternative,
  onAddAsset
}: PhysicalAssetsCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const hasAssets = 
    summary.real_estate.length > 0 || 
    summary.vehicles.length > 0 || 
    summary.collectibles.length > 0 || 
    summary.precious_metals.length > 0 ||
    (summary.alternative_assets?.length ?? 0) > 0;

  const totalAssetCount = 
    summary.real_estate.length + 
    summary.vehicles.length + 
    summary.collectibles.length + 
    summary.precious_metals.length +
    (summary.alternative_assets?.length ?? 0);

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group/card">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover/card:rotate-6 transition-transform duration-700">
        <Home className="w-64 h-64 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <h3 className="font-serif text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
            Physical Assets
          </h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">Context Graph: Tangible Wealth</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(summary.total_value)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.15em] mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
            {totalAssetCount} Assets Tracked
          </p>
        </div>
      </div>

      {!hasAssets ? (
        <div className="py-20 text-center rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 relative z-10">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">No physical assets linked</h4>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
            Auto-sync your primary residence, investment properties, vehicles, luxury goods, and precious metals for a complete net worth.
          </p>
          <button 
            onClick={onAddAsset}
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Property or Vehicle
          </button>
        </div>
      ) : (
        <div className="space-y-8 relative z-10">
          {/* Real Estate Section */}
          {summary.real_estate.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Real Estate Portfolio</span>
                </div>
                {summary.real_estate.some(re => re.valuation_type === 'auto') && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-500/5 border border-brand-500/10">
                    <Zap className="w-3 h-3 text-brand-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-brand-400">Zillow Sync Active</span>
                  </div>
                )}
              </div>
              
              <div className="grid gap-4">
                {summary.real_estate.map((re) => (
                  <AssetItem 
                    key={re.id}
                    icon={<Home className="w-5 h-5" />}
                    name={re.name}
                    subtitle={re.address}
                    value={re.market_value}
                    type={re.property_type.replace('_', ' ')}
                    valuationType={re.valuation_type}
                    onRefresh={() => onRefreshRealEstate(re.id)}
                    onDelete={() => onDeleteRealEstate(re.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Alternative Assets Section */}
          {summary.alternative_assets && summary.alternative_assets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Alternative Investments</span>
              </div>
              <div className="grid gap-4">
                {summary.alternative_assets.map((a) => (
                  <AssetItem 
                    key={a.id}
                    icon={<Briefcase className="w-5 h-5" />}
                    name={a.name}
                    subtitle={a.asset_type.replace('_', ' ')}
                    value={a.market_value}
                    type="Alternative"
                    valuationType="manual"
                    onRefresh={() => {}}
                    onDelete={() => onDeleteAlternative(a.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vehicles Section */}
          {summary.vehicles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Vehicle Fleet</span>
                </div>
                {summary.vehicles.some(v => v.valuation_type === 'auto') && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/5 border border-blue-500/10">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">KBB Verified</span>
                  </div>
                )}
              </div>
              
              <div className="grid gap-4">
                {summary.vehicles.map((v) => (
                  <AssetItem 
                    key={v.id}
                    icon={<Car className="w-5 h-5" />}
                    name={v.name}
                    subtitle={`${v.year} ${v.make} ${v.model}`}
                    value={v.market_value}
                    type={v.vehicle_type}
                    valuationType={v.valuation_type}
                    onRefresh={() => onRefreshVehicle(v.id)}
                    onDelete={() => onDeleteVehicle(v.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Collectibles Section */}
          {summary.collectibles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Watch className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Luxury Goods & Collectibles</span>
              </div>
              <div className="grid gap-4">
                {summary.collectibles.map((c) => (
                  <AssetItem 
                    key={c.id}
                    icon={<Watch className="w-5 h-5" />}
                    name={c.name}
                    subtitle={c.item_type}
                    value={c.market_value}
                    type="Collectible"
                    valuationType={c.valuation_type}
                    onRefresh={() => onRefreshCollectible(c.id)}
                    onDelete={() => onDeleteCollectible(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Precious Metals Section */}
          {summary.precious_metals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Gem className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Precious Metals</span>
              </div>
              <div className="grid gap-4">
                {summary.precious_metals.map((m) => (
                  <AssetItem 
                    key={m.id}
                    icon={<Coins className="w-5 h-5" />}
                    name={m.name}
                    subtitle={`${m.weight_oz} oz ${m.metal_type}`}
                    value={m.market_value}
                    type="Commodity"
                    valuationType={m.valuation_type}
                    onRefresh={() => onRefreshMetal(m.id)}
                    onDelete={() => onDeleteMetal(m.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={onAddAsset}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Another Physical Asset
          </button>
        </div>
      )}
    </div>
  );
}

interface AssetItemProps {
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  value: number;
  type: string;
  valuationType: 'manual' | 'auto';
  onRefresh: () => void;
  onDelete: () => void;
}

function AssetItem({ icon, name, subtitle, value, type, valuationType, onRefresh, onDelete }: AssetItemProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shadow-sm group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                {name}
              </h4>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                {type}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-bold uppercase tracking-tight">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{subtitle}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right flex items-center gap-4">
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {formatCurrency(value)}
            </div>
            <div className="flex items-center justify-end gap-1 mt-1.5">
              {valuationType === 'auto' ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 text-brand-400 animate-spin-slow" />
                  <span className="text-xs text-brand-400 uppercase font-black tracking-widest">Auto-Valuation</span>
                </>
              ) : (
                <span className="text-xs text-slate-400 uppercase font-black tracking-widest">Manual Entry</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {valuationType === 'auto' && (
              <button 
                onClick={onRefresh}
                className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                title="Refresh Valuation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Delete Asset"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
