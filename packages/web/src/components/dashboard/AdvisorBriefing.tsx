import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { useAdvisorBriefing } from '@/lib/strata/hooks';
import { formatDistanceToNow } from 'date-fns';

export function AdvisorBriefing() {
  const { data: briefing, isLoading } = useAdvisorBriefing();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!briefing || !briefing.items || briefing.items.length === 0) {
    return null;
  }

  const getIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(briefing.last_login), { addSuffix: true });

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
        <Sparkles className="w-16 h-16 text-emerald-500" />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-serif text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          Advisor Briefing
        </h3>
        <span className="text-xs font-medium text-slate-500">Since {timeAgo}</span>
      </div>

      <div className="space-y-3 relative z-10 w-full">
        {briefing.items.map((item, idx) => (
          <div key={idx} className="flex gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 w-full">
            <div className="mt-0.5">{getIcon(item.impact)}</div>
            <div className="w-full">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{item.category}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
