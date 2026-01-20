
// ... existing imports
import React, { useState, useMemo, useEffect } from 'react';
import { BiltCardTier, BiltCardData, CalculationResult, RewardMode } from './types';
import { BILT_CARDS, POINT_VALUATION, BILT_CASH_UNLOCK_RATIO, BILT_CASH_EARN_RATE, CARD_BENEFITS_TEXT, ASSUME_MIN_SPEND_MET_TEXT, BASE_RENT_POINTS_MONTHLY } from './constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

// Updated Slider with tap-to-edit functionality for mobile
const CompactSlider = ({ label, value, min, max, step = 50, onChange, unit = "$" }: { label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void, unit?: string }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value.toString());
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleValueClick = () => {
    setInputValue(value.toString());
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue.replace(/,/g, ''), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
        {isEditing ? (
          <div className="flex items-center bg-white border-2 border-black rounded-lg px-2 py-1">
            <span className="text-base font-extrabold text-zinc-900">{unit}</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-20 text-base font-extrabold text-zinc-900 bg-transparent outline-none text-right"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={handleValueClick}
            className="text-base font-extrabold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
            title="Tap to enter exact value"
          >
            {unit}{value.toLocaleString()}
          </button>
        )}
      </div>
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black focus:outline-none focus:ring-2 focus:ring-black/20"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
};

interface CardTileProps {
  result: CalculationResult;
  isBest: boolean;
  baseline: number;
  timeframe: 'year1' | 'year2';
  baselineWins: boolean;
}

const CardTile: React.FC<CardTileProps> = ({ result, isBest, baseline, timeframe, baselineWins }) => {
  const card = BILT_CARDS[result.cardTier];
  const isYear1 = timeframe === 'year1';
  
  // Dynamic Values based on Timeframe
  const netValue = isYear1 ? result.netValueYear1 : result.netValueYear2;
  const isNegative = netValue < 0;
  
  // Breakdown Components
  const bonusVal = card.welcomeBonusCash + (card.welcomeBonusPoints * POINT_VALUATION);
  const annualFixedCredits = card.annualBiltCash;
  const hotelCredit = card.hotelCredit;
  const biltCashProfit = result.annualBiltCashProfit;
  
  // For the breakdown table, we specifically want to show Recurring vs Bonus
  // recurringRewardsVal = (Points * Value)
  const recurringPointsVal = result.annualPointsEarned * POINT_VALUATION;

  // Determine Badge Text and Style
  const badgeText = baselineWins ? 'Best Bilt Option' : 'Best Value';
  const badgeStyle = baselineWins ? 'bg-zinc-200 text-zinc-600' : 'bg-amber-400 text-black';
  const containerStyle = isBest 
    ? (baselineWins ? 'border-zinc-400 bg-white text-zinc-900 shadow-xl scale-[1.01] z-10' : 'border-zinc-900 bg-zinc-900 text-white shadow-2xl scale-[1.02] z-10') 
    : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300';

  // Specific Text Colors based on active state
  const headlineColor = isBest && !baselineWins ? 'text-white' : 'text-zinc-900';
  const sublabelColor = isBest && !baselineWins ? 'text-zinc-500' : 'text-zinc-400';
  const dividerColor = isBest && !baselineWins ? 'border-zinc-800' : 'border-zinc-100';
  const bodyTextColor = isBest && !baselineWins ? 'text-zinc-400' : 'text-zinc-600';
  const valueColor = isBest && !baselineWins ? 'text-zinc-300' : 'text-zinc-900';

  return (
    <div className={`p-4 lg:p-6 rounded-xl lg:rounded-[2rem] border-2 transition-all flex flex-col justify-between relative overflow-hidden group ${containerStyle}`}>

      {isBest && (
        <div className={`absolute top-0 right-0 text-[8px] lg:text-[10px] font-black uppercase px-3 lg:px-4 py-1.5 lg:py-2 rounded-bl-xl lg:rounded-bl-2xl tracking-widest z-20 ${badgeStyle}`}>
          {badgeText}
        </div>
      )}

      <div>
        <div className="flex justify-between items-baseline mb-3 lg:mb-4">
          <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight">{result.cardTier}</h3>
          <span className={`text-[10px] lg:text-xs font-bold px-2 py-1 rounded ${isBest && !baselineWins ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
            ${card.annualFee} Fee
          </span>
        </div>

        <div className="flex flex-col gap-0.5 lg:gap-1 mb-4 lg:mb-6">
           <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest ${sublabelColor}`}>
             {isYear1 ? 'Year 1 Net Value' : 'Year 2+ Net Value'}
           </span>
           <p className={`text-3xl lg:text-5xl font-black tracking-tighter ${netValue < 0 ? 'text-rose-500' : headlineColor}`}>
              ${Math.round(netValue).toLocaleString()}
           </p>
        </div>

        {/* Detailed Breakdown Table */}
        <div className={`text-xs lg:text-sm font-medium border-t border-b py-3 lg:py-4 flex flex-col gap-2 lg:gap-2.5 ${dividerColor} ${bodyTextColor}`}>

             {/* Welcome Bonus Row - Only show in Year 1 */}
             {isYear1 && (
               <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 lg:gap-2">
                     <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-amber-400"></span>
                     Welcome Bonus
                  </span>
                  <span className="text-amber-500 font-bold">
                     +${Math.round(bonusVal).toLocaleString()}
                  </span>
               </div>
             )}

             {/* Credits Row */}
             {(annualFixedCredits > 0 || hotelCredit > 0) && (
               <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 lg:gap-2">
                     <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-500"></span>
                     Annual Credits
                  </span>
                  <span className="text-emerald-500 font-bold">
                     +${(annualFixedCredits + hotelCredit).toLocaleString()}
                  </span>
               </div>
             )}

             {/* Rewards Row (Points) */}
             <div className="flex justify-between items-center">
                 <span className="flex items-center gap-1.5 lg:gap-2">
                     <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-blue-500"></span>
                     Recurring Points
                  </span>
                <span className={valueColor}>+${Math.round(recurringPointsVal).toLocaleString()}</span>
             </div>

             {/* Rewards Row (Bilt Cash) */}
             <div className="flex justify-between items-center">
                 <span className="flex items-center gap-1.5 lg:gap-2">
                     <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-indigo-500"></span>
                     Net Bilt Cash
                  </span>
                <span className={valueColor}>+${Math.round(biltCashProfit).toLocaleString()}</span>
             </div>

             {/* Fee Row */}
             <div className="flex justify-between items-center opacity-80">
                <span>Annual Fee</span>
                <span className="text-rose-500">-${card.annualFee}</span>
             </div>
        </div>
      </div>

      {/* Footer comparing to alternate timeframe */}
      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4">
        <div className="flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
             <span className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${sublabelColor}`}>
               {isYear1 ? 'Year 2+ Recurring' : 'Year 1 (w/ Bonus)'}
             </span>
             <span className={`text-xs lg:text-sm font-bold ${valueColor}`}>
                ${Math.round(isYear1 ? result.netValueYear2 : result.netValueYear1).toLocaleString()}
             </span>
        </div>
      </div>
    </div>
  );
};

// ... TourStep and other constants ...
interface TourStep {
  title: string;
  content: React.ReactNode;
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Should you get Bilt 2.0?",
    content: (
      <span>
        Bilt 1.0 made it easy to earn points on rent. With 2.0, the calculation is harder. This app helps you figure out the best decision for yourself on <strong>whether you should get the new Bilt cards and which one to get</strong>.
      </span>
    ),
    icon: "❓"
  },
  {
    title: "The New Rules of the Game",
    content: (
      <span>
        It's no longer just 'pay rent, earn points'. You now have two complex paths: 1) <strong>Spend enough</strong> on the card to unlock multipliers, or 2) <strong>Earn 'Bilt Cash'</strong> to 'buy' your rent points. We built this calculator because <strong>balancing spend ratios</strong> against <strong>cash unlock rates</strong> requires precise math to ensure you aren't leaving money on the table.
      </span>
    ),
    icon: "♟️"
  },
  {
    title: "The 2% Baseline Test",
    content: (
      <span>
        We compare Bilt against a <strong>standard 2% cash back card</strong>. Crucial detail: Standard cards <strong>lose ~1% on rent</strong> due to 3% transaction fees. Bilt avoids this. We factor this 'hidden fee' into our baseline so you get a fair comparison.
      </span>
    ),
    icon: "⚖️"
  },
  {
    title: "The 'Credit Rich' Trap",
    content: (
      <span>
        Premium cards charge up to $495/yr. They look profitable because of <strong>hotel credits and perks</strong>, but if you don't use them, you're just paying a high fee for nothing. We separate <strong>'Points Profit'</strong> from <strong>'Perks'</strong> so you see the real cost.
      </span>
    ),
    icon: "💸"
  },
  {
    title: "Your Personalized Verdict",
    content: (
      <span>
        Input your rent and spending habits. If Bilt doesn't beat a <strong>simple no-fee 2% card</strong>, we'll advise you to walk away. No fluff, just the math.
      </span>
    ),
    icon: "🎯"
  }
];

export default function App() {
  const [rent, setRent] = useState(3000);
  const [dining, setDining] = useState(500);
  const [grocery, setGrocery] = useState(500);
  const [travel, setTravel] = useState(500);
  const [misc, setMisc] = useState(750);
  const [mode, setMode] = useState<RewardMode>(RewardMode.MULTIPLIER);
  const [timeframe, setTimeframe] = useState<'year1' | 'year2'>('year1'); // New Timeframe State
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showValuation, setShowValuation] = useState(false);
  const [selectedChartBar, setSelectedChartBar] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFullScreenChart, setShowFullScreenChart] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('bilt_tour_seen');
    if (!hasSeenTour) {
      setTourStep(0);
    }
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = tourStep !== null || showVerdict || showBenefits || showDisclaimer || showMethodology || showValuation || showMobileMenu || showFullScreenChart;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [tourStep, showVerdict, showBenefits, showDisclaimer, showMethodology, showValuation, showMobileMenu, showFullScreenChart]);

  const startTour = () => setTourStep(0);
  const closeTour = () => {
    setTourStep(null);
    localStorage.setItem('bilt_tour_seen', 'true');
  };

  const results = useMemo(() => {
    const everydaySpend = dining + grocery + travel + misc;

    return Object.values(BiltCardTier).map(tier => {
      const card = BILT_CARDS[tier];
      let rentPoints = 0;
      let effectiveRentMultiplier = 0;
      let isUnlockedFully = false;
      let everydayPoints = 0;
      let biltCashProfit = 0;

      // Common Calculation: Everyone earns 4% Bilt Cash on everyday spend now
      // AND everyone earns standard points.
      // The "Mode" determines if you keep the cash (Multiplier Mode) or Spend it on Rent (Bilt Cash Mode)

      const rawBiltCashEarned = everydaySpend * BILT_CASH_EARN_RATE;

      // Calculate dining and grocery points based on card tier
      // Obsidian: User chooses 3x on EITHER dining OR grocery (not both)
      // Calculator assumes optimal choice: 3x on whichever has higher annual spend
      // Grocery has $25k/year cap for Obsidian
      let diningPoints = 0;
      let groceryPoints = 0;

      if (tier === BiltCardTier.OBSIDIAN) {
        // For Obsidian, apply 3x to the higher-spend category, 1x to the other
        const annualGrocery = grocery * 12;
        const annualDining = dining * 12;
        const cappedAnnualGrocery = Math.min(annualGrocery, card.groceryAnnualCap);

        if (annualDining >= cappedAnnualGrocery) {
          // Choose dining as 3x category
          diningPoints = dining * card.diningMultiplier; // 3x
          groceryPoints = grocery * 1; // 1x (not chosen)
        } else {
          // Choose grocery as 3x category (with cap applied)
          diningPoints = dining * 1; // 1x (not chosen)
          const monthlyGroceryCap = card.groceryAnnualCap / 12;
          const cappedGrocery = Math.min(grocery, monthlyGroceryCap);
          const uncappedGrocery = Math.max(0, grocery - monthlyGroceryCap);
          groceryPoints = (cappedGrocery * card.groceryMultiplier) + (uncappedGrocery * 1); // 3x up to cap, 1x above
        }
      } else {
        // Blue and Palladium: Apply multipliers directly to both categories
        diningPoints = dining * card.diningMultiplier;
        groceryPoints = grocery * card.groceryMultiplier;
      }

      everydayPoints = diningPoints + groceryPoints +
                       (travel * card.travelMultiplier) +
                       (misc * card.everythingElseMultiplier);

      if (mode === RewardMode.MULTIPLIER) {
        // Mode 1: Spending to unlock Multiplier.
        // Benefit: You KEEP all your Bilt Cash as profit.

        const spendRatio = rent > 0 ? everydaySpend / rent : (everydaySpend > 0 ? 100 : 0);

        if (spendRatio >= 1.0) effectiveRentMultiplier = 1.25;
        else if (spendRatio >= 0.75) effectiveRentMultiplier = 1.0;
        else if (spendRatio >= 0.50) effectiveRentMultiplier = 0.75;
        else if (spendRatio >= 0.25) effectiveRentMultiplier = 0.50;
        else effectiveRentMultiplier = 0;

        // Calculate rent points (with base earning if below 25% threshold)
        if (effectiveRentMultiplier > 0) {
          rentPoints = rent * effectiveRentMultiplier;
        } else if (rent > 0) {
          // Below 25% threshold: earn 250 base points per month
          rentPoints = BASE_RENT_POINTS_MONTHLY;
        }

        isUnlockedFully = spendRatio >= 1.0;
        biltCashProfit = rawBiltCashEarned;

      } else {
        // Mode 2: Using Bilt Cash to unlock Rent.
        // Cost: You SPEND your Bilt Cash to unlock rent points.
        // Max 1x on rent in this mode.

        const biltCashNeeded = rent * BILT_CASH_UNLOCK_RATIO;
        const unlockRatio = rent > 0 ? Math.min(1, rawBiltCashEarned / biltCashNeeded) : (rawBiltCashEarned > 0 ? 1 : 0);

        rentPoints = rent * unlockRatio; // Capped at 1x in this mode
        effectiveRentMultiplier = unlockRatio;
        isUnlockedFully = rawBiltCashEarned >= biltCashNeeded;

        // Surplus: If you earn $100 cash but only need $50 for rent, you keep $50.
        biltCashProfit = Math.max(0, rawBiltCashEarned - biltCashNeeded);
      }

      const yearlyPoints = (everydayPoints + rentPoints) * 12;
      const annualBiltCashValue = biltCashProfit * 12;

      const annualTravelSpend = travel * 12;
      const effectiveHotelCredit = Math.min(card.hotelCredit, annualTravelSpend);
      const annualCredits = effectiveHotelCredit + card.annualBiltCash;

      // Net Value = (Points * Valuation) + (Liquid Bilt Cash Profit) + (Credits) - (Fee)
      const netYear2 = (yearlyPoints * POINT_VALUATION) + annualBiltCashValue + annualCredits - card.annualFee;

      const welcomeBonusValue = card.welcomeBonusCash + (card.welcomeBonusPoints * POINT_VALUATION);
      const netYear1Val = netYear2 + welcomeBonusValue;

      return {
        cardTier: tier,
        annualPointsEarned: yearlyPoints,
        netValueYear1: netYear1Val,
        netValueYear2: netYear2,
        rentPointsUnlockedMonthly: mode === RewardMode.BILT_CASH ? effectiveRentMultiplier : 0,
        rentMultiplier: effectiveRentMultiplier,
        annualBiltCashProfit: annualBiltCashValue,
        isUnlockedFully,
        qualifiedForBonus: true
      } as CalculationResult;
    });
  }, [rent, dining, grocery, travel, misc, mode]);

  const best = useMemo(() => results.reduce((a, b) => {
    const valA = timeframe === 'year1' ? a.netValueYear1 : a.netValueYear2;
    const valB = timeframe === 'year1' ? b.netValueYear1 : b.netValueYear2;
    return valA > valB ? a : b;
  }), [results, timeframe]);

  const totalSpend = dining + grocery + travel + misc;
  const baselineValue = (totalSpend * 12) * 0.02;
  const activeBestNetValue = timeframe === 'year1' ? best.netValueYear1 : best.netValueYear2;
  
  const baselineWins = baselineValue > activeBestNetValue;

  const strategyText = useMemo(() => {
    if (rent === 0 && totalSpend === 0) {
      return "Start by entering your rent and monthly expenses to see your personalized strategy.";
    }

    if (baselineWins) {
        return `⚠️ REALITY CHECK: A standard 2% cash back card beats the best Bilt option for you. You would earn $${Math.round(baselineValue)} vs $${Math.round(activeBestNetValue)} with Bilt. Bilt is likely not worth it for your current spend profile.`;
    }
    
    if (timeframe === 'year1' && best.netValueYear1 > 0 && best.netValueYear2 < 0) {
        return `✨ CHURN OPPORTUNITY: The ${best.cardTier} is your best bet for Year 1 thanks to the welcome bonus ($${Math.round(best.netValueYear1)} net). However, be careful—in Year 2, this card will cost you money ($${Math.round(best.netValueYear2)}/yr) at current spend levels.`;
    }

    if (timeframe === 'year2' && best.netValueYear2 < 0) {
        return `⚠️ NEGATIVE OUTLOOK: Even the best card option results in a net loss for Year 2+. You might want to consider a no-fee card or standard cash back.`;
    }

    if (mode === RewardMode.MULTIPLIER) {
      const spendRatio = rent > 0 ? totalSpend / rent : 0;
      if (spendRatio >= 1.0) {
        return "✨ MAXIMUM VELOCITY: Your spend unlocks 1.25x rent points + you keep all 4% Bilt Cash.";
      } else if (spendRatio >= 0.50) {
        return `You've unlocked the 0.75x tier. To level up to 1.0x on rent, you need to route more spend through your card.`;
      } else {
         return `You are earning base points. Increase everyday spend to unlock higher rent multipliers.`;
      }
    }
    return "Your 4% Bilt Cash is working hard to unlock rent points. Any surplus cash is yours to keep.";
  }, [mode, totalSpend, rent, best, timeframe, baselineWins, baselineValue, activeBestNetValue]);

  const recommendation = useMemo(() => {
    if (activeBestNetValue < 0) {
      return {
        title: "Don't get a Bilt Card.",
        tier: "None",
        reason: "Even with the potential rewards, the annual fees outweigh the value for your spend profile in this timeframe.",
        isPass: true,
        isCreditDependent: false
      };
    }
    
    if (activeBestNetValue === 0 && totalSpend === 0 && rent === 0) {
       return {
        title: "Enter your spend.",
        tier: "None",
        reason: "Enter your estimated monthly spend to see which card fits your lifestyle.",
        isPass: true,
        isCreditDependent: false
      };
    }
    
    if (baselineWins) {
       return {
        title: "Stick with a 2% Cash Back Card.",
        tier: "None",
        reason: `Your spending profile earns more with a standard 2% card ($${Math.round(baselineValue)}) than the best Bilt card ($${Math.round(activeBestNetValue)}). The math doesn't justify switching.`,
        isPass: true,
        isCreditDependent: false
      };
    }

    const isCreditDependent = (best.annualPointsEarned * POINT_VALUATION) < BILT_CARDS[best.cardTier].annualFee;

    return {
      title: `Get the Bilt ${best.cardTier} Card.`,
      tier: best.cardTier,
      reason: `For a ${timeframe === 'year1' ? 'Year 1' : 'Year 2+'} horizon, the ${best.cardTier} offers the highest net value ($${Math.round(activeBestNetValue)}). ${timeframe === 'year1' ? 'This is largely driven by the welcome bonus.' : 'This is based on recurring rewards and credits.'}`,
      isPass: false,
      isCreditDependent
    };
  }, [best, timeframe, totalSpend, rent, activeBestNetValue, baselineWins, baselineValue]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-200 selection:text-black">
      {/* Tour Modal omitted for brevity, logic remains same */}
      {tourStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <div className="bg-black p-6 lg:p-12 text-white text-center relative">
              <div className="text-4xl lg:text-7xl mb-4 lg:mb-8">{TOUR_STEPS[tourStep].icon}</div>
              <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tight">{TOUR_STEPS[tourStep].title}</h2>
              <div className="absolute top-4 lg:top-8 right-4 lg:right-8 text-xs lg:text-sm font-bold opacity-40">STEP {tourStep + 1} / {TOUR_STEPS.length}</div>
            </div>
            <div className="p-6 lg:p-12">
              <div className="text-zinc-600 text-base lg:text-xl leading-relaxed mb-8 lg:mb-12 min-h-[80px] lg:min-h-[120px]">
                {TOUR_STEPS[tourStep].content}
              </div>
              <div className="flex gap-3 lg:gap-6">
                {tourStep > 0 && (
                  <button onClick={() => setTourStep(tourStep - 1)} className="flex-1 py-3 lg:py-5 px-4 lg:px-8 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg text-zinc-500 hover:bg-zinc-100 border border-zinc-200 transition-colors">Back</button>
                )}
                <button onClick={() => tourStep < TOUR_STEPS.length - 1 ? setTourStep(tourStep + 1) : closeTour()} className="flex-[2] py-3 lg:py-5 px-4 lg:px-8 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg bg-amber-400 text-black hover:bg-amber-300 shadow-xl transition-all transform hover:scale-[1.02]">
                  {tourStep < TOUR_STEPS.length - 1 ? "Next Step" : "Let's Go!"}
                </button>
              </div>
              <button onClick={closeTour} className="w-full text-center mt-4 lg:mt-6 text-xs lg:text-sm font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest transition-colors">
                Skip Introduction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verdict Modal */}
      {showVerdict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-zinc-900/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className={`p-6 lg:p-14 text-center ${recommendation.isPass ? 'bg-zinc-100' : (recommendation.isCreditDependent ? 'bg-amber-400 text-black' : 'bg-black text-white')}`}>
              <div className={`inline-block px-4 lg:px-5 py-2 lg:py-2.5 rounded-full backdrop-blur-md text-xs lg:text-sm font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] mb-4 lg:mb-8 ${recommendation.isPass ? 'bg-zinc-200 text-zinc-500' : 'bg-white/20'}`}>
                Personalized Verdict
              </div>
              <h2 className="text-2xl lg:text-5xl font-black leading-tight mb-4 lg:mb-8">{recommendation.title}</h2>
              <p className={`text-base lg:text-xl leading-relaxed ${recommendation.isPass ? 'text-zinc-500' : (recommendation.isCreditDependent ? 'text-zinc-900 font-medium' : 'text-zinc-400')}`}>
                {recommendation.reason}
              </p>
            </div>
            <div className="p-6 lg:p-14 bg-white">
              {!recommendation.isPass && (
                <div className={`rounded-2xl lg:rounded-3xl p-5 lg:p-10 mb-6 lg:mb-10 border ${recommendation.isCreditDependent ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 lg:mb-6">
                    <span className="text-xs lg:text-sm font-black text-zinc-400 uppercase tracking-widest">{timeframe === 'year1' ? 'Year 1' : 'Year 2'} Net Value</span>
                    <span className={`${recommendation.isCreditDependent ? 'text-amber-600' : 'text-emerald-600'} font-black text-3xl lg:text-5xl`}>
                      ${Math.round(activeBestNetValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-3 lg:gap-4 text-sm lg:text-lg text-zinc-600">
                       <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs lg:text-sm shrink-0">✓</div>
                       <span>{timeframe === 'year1' ? 'Includes One-Time Welcome Bonus' : 'Based on Recurring Annual Value'}</span>
                    </div>
                    {recommendation.isCreditDependent ? (
                        <div className="flex items-center gap-3 lg:gap-4 text-sm lg:text-lg text-rose-600 font-bold">
                           <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs lg:text-sm shrink-0">!</div>
                           <span>Requires using Hotel/Cash Credits to hold value</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 lg:gap-4 text-sm lg:text-lg text-zinc-600">
                           <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs lg:text-sm shrink-0">✓</div>
                           <span>Fully optimized for your spend profile</span>
                        </div>
                    )}
                  </div>
                </div>
              )}
              {recommendation.isPass && (
                 <div className="bg-rose-50 rounded-2xl lg:rounded-3xl p-5 lg:p-8 mb-6 lg:mb-10 border border-rose-100">
                    <h3 className="text-rose-900 font-bold mb-2 uppercase tracking-wide text-xs lg:text-sm">Opportunity Cost Analysis</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-rose-200 pb-2">
                        <span className="text-rose-800 text-sm lg:text-base">Standard 2% Card (No Fee)</span>
                        <span className="text-lg lg:text-xl font-black text-rose-900">${Math.round(baselineValue)}/yr</span>
                      </div>
                      <div className="flex justify-between items-center opacity-60">
                         <span className="text-rose-800 text-sm lg:text-base">Best Bilt Option ({best.cardTier})</span>
                         <span className="text-base lg:text-lg font-bold text-rose-900">${Math.round(activeBestNetValue)}/yr</span>
                      </div>
                    </div>
                    <p className="text-rose-700 mt-4 text-xs lg:text-sm font-medium">Bilt falls short because your everyday spend isn't high enough to offset the lack of base rewards, or your rent rewards don't bridge the gap against a simple 2% card.</p>
                 </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowVerdict(false)}
                  className="w-full py-4 lg:py-6 rounded-xl lg:rounded-2xl bg-zinc-100 text-zinc-600 font-bold text-base lg:text-xl hover:bg-zinc-200 transition-colors"
                >
                  Back to Calculator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Modal and Disclaimer Modal logic omitted, same as before */}
      {showBenefits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-4 bg-zinc-900/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowBenefits(false)}>
          <div className="bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl max-w-7xl w-full overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 lg:p-10 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tight text-zinc-900">Card Benefits</h2>
              <button onClick={() => setShowBenefits(false)} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors text-zinc-500 font-bold text-base lg:text-lg">✕</button>
            </div>

            <div className="overflow-y-auto p-4 lg:p-12 bg-zinc-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-16">
                {Object.values(BiltCardTier).map((tier) => {
                  const details = CARD_BENEFITS_TEXT[tier];
                  const isPalladium = tier === BiltCardTier.PALLADIUM;
                  const isObsidian = tier === BiltCardTier.OBSIDIAN;
                  const isBlue = tier === BiltCardTier.BLUE;

                  // Specific styling for each card tier in the modal
                  let cardStyle = "";
                  let checkStyle = "";

                  if (isBlue) {
                    cardStyle = "bg-sky-50 border-sky-200";
                    checkStyle = "bg-sky-200 text-sky-700";
                  } else if (isObsidian) {
                    // CHANGED: Use slate/charcoal instead of pure black to distinguish from "Best Card" selection state
                    cardStyle = "bg-slate-800 border-slate-900 text-white";
                    checkStyle = "bg-slate-600 text-white";
                  } else {
                    // Palladium
                    cardStyle = "bg-stone-100 border-stone-300";
                    checkStyle = "bg-stone-300 text-stone-700";
                  }

                  return (
                    <div key={tier} className={`rounded-2xl lg:rounded-[2.5rem] border p-5 lg:p-10 flex flex-col shadow-sm ${cardStyle}`}>
                      <div className="mb-5 lg:mb-10">
                        <div className={`text-xs lg:text-sm font-black uppercase tracking-widest mb-2 lg:mb-4 opacity-60`}>
                          {details.headline}
                        </div>
                        <h3 className="text-2xl lg:text-5xl font-black mb-3 lg:mb-6 tracking-tight">{tier}</h3>
                        <p className={`text-sm lg:text-lg leading-relaxed font-medium opacity-80`}>{details.description}</p>
                      </div>

                      <div className="flex-1 space-y-3 lg:space-y-6">
                        {details.highlights.map((item: string, i: number) => (
                          <div key={i} className="flex gap-2 lg:gap-4 text-sm lg:text-lg items-start">
                            <span className={`shrink-0 mt-1 lg:mt-1.5 w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-bold ${checkStyle}`}>✓</span>
                            <span className={`font-medium`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 lg:mt-12 text-center">
                 <a
                    href="https://support.biltrewards.com/hc/en-us/articles/42648751360653-About-the-Bilt-Card-2-0-Program"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-black text-white px-6 lg:px-10 py-3 lg:py-5 rounded-xl lg:rounded-2xl font-black text-base lg:text-xl hover:bg-zinc-800 transition-all shadow-xl hover:scale-[1.02]"
                 >
                    Read Full Program Details
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
       {/* NEW: Disclaimer Modal */}
       {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-zinc-900/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowDisclaimer(false)}>
           <div className="bg-white rounded-2xl lg:rounded-[2rem] shadow-2xl max-w-2xl w-full p-5 lg:p-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight">Legal & Privacy</h2>
                <button onClick={() => setShowDisclaimer(false)} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm">✕</button>
              </div>
              <div className="space-y-6 text-zinc-600">
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                     <h3 className="font-bold text-indigo-900 mb-3 uppercase tracking-wide text-sm">Bilt Cash Valuation</h3>
                     <p className="text-indigo-800 mb-2">Bilt Cash has a fixed face value of <strong>$1 per $1</strong> (unlike points which vary), but it is <strong>illiquid</strong>. It can only be redeemed within the Bilt ecosystem for:</p>
                     <ul className="list-disc pl-5 text-sm space-y-1 text-indigo-700">
                        <li>Rent or Mortgage unlocks</li>
                        <li>Travel bookings via Bilt Portal</li>
                        <li>Lyft rides & Fitness classes</li>
                     </ul>
                     <p className="text-indigo-800 text-xs mt-3"><strong>Important:</strong> Bilt Cash expires at the end of the year. Our calculations assume you use 100% of your earned Bilt Cash annually.</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                     <h3 className="font-bold text-amber-900 mb-3 uppercase tracking-wide text-sm">Assumptions</h3>
                     <p className="text-amber-800 font-bold">{ASSUME_MIN_SPEND_MET_TEXT}</p>
                     <ul className="list-disc pl-5 text-sm space-y-2 text-amber-800 mt-3">
                        <li>The calculator assumes you will meet the minimum spend requirements (e.g. $4,000 in 3 months for Palladium) to unlock the sign-up bonuses.</li>
                        <li><strong>Obsidian 3x Category:</strong> You can only choose ONE category (Dining or Grocery) for 3x points. The calculator assumes you select the optimal category (whichever has higher annual spend). Grocery is capped at $25k/year.</li>
                        <li><strong>Below 25% Spend Threshold:</strong> If your everyday spend is less than 25% of your rent, you still earn 250 base points per month on rent.</li>
                     </ul>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl">
                    <h3 className="font-bold text-zinc-900 mb-3 uppercase tracking-wide text-sm">Real Talk: The "Rent Fee" Trap</h3>
                    <p className="text-zinc-800 mb-3">Why don't we calculate rewards for other cards on rent? Because it's usually a bad deal.</p>
                    <ul className="list-disc pl-5 text-sm space-y-2 text-zinc-600">
                        <li><strong>The Fee:</strong> Landlord portals and services like Venmo/Plastiq charge ~2.9-3% for credit card payments.</li>
                        <li><strong>The Math:</strong> Earning 2% rewards while paying a 3% fee results in a <strong>1% NET LOSS</strong>.</li>
                        <li><strong>The Bilt Edge:</strong> Bilt is the only major card to offer fee-free rent rewards (via ACH bypass), making it the only truly profitable option for rent.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Disclaimer</h3>
                    <p>This tool is a free educational guide and is not affiliated with Wells Fargo, Bilt Rewards, or Mastercard. All valuations are estimated based on data as of Jan 2026.</p>
                    <p className="font-bold mt-2">We are NOT affiliated with The Points Guy (TPG).</p>
                    <p className="mt-2">We assume no liability for personal decisions, card approvals, or program changes. Ultimate financial responsibility lies with you.</p>
                  </div>
              </div>
           </div>
        </div>
       )}
       {/* NEW: Methodology Modal */}
       {showMethodology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-zinc-900/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowMethodology(false)}>
           <div className="bg-white rounded-2xl lg:rounded-[2rem] shadow-2xl max-w-4xl w-full p-5 lg:p-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tight">Methodology</h2>
                <button onClick={() => setShowMethodology(false)} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm">✕</button>
              </div>
              
              <div className="space-y-8 text-zinc-700">
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                   <h3 className="text-xl font-bold mb-4 text-zinc-900">How We Calculate Net Value</h3>
                   <p className="font-mono text-sm bg-zinc-900 text-white p-4 rounded-xl mb-4">
                      Net Value = (Points Earned × $0.022) + (Liquid Bilt Cash Profit) + (Credits) - (Annual Fee)
                   </p>
                   <p className="text-sm">We separate "Points" (which vary in value) from "Bilt Cash" (which is fixed at $1.00). The result is a comprehensive view of your total return.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">1. The "Double Dip" Logic</h3>
                      <p className="mb-4 text-sm">
                        With Bilt 2.0, you earn rewards on everyday spend (non-rent) in two ways simultaneously:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>Standard Points:</strong> You earn 1x-3x points based on your card tier and category (Dining/Travel).</li>
                        <li><strong>PLUS 4% Bilt Cash:</strong> You earn an additional 4% back in Bilt Cash on that same spend.</li>
                      </ul>
                      <p className="mt-4 text-sm font-bold text-indigo-600">Our calculator adds BOTH of these to your total value.</p>
                   </div>
                   
                   <div>
                      <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">2. Bilt Cash Valuation</h3>
                      <p className="mb-4 text-sm">
                        We value Bilt Cash at <strong>$1.00 (Face Value)</strong>.
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                         <li><strong>Liquidity Warning:</strong> Bilt Cash is illiquid. It cannot be cashed out to a bank account. It must be used within the Bilt ecosystem (Travel Portal, Rent, Lyft, etc.).</li>
                         <li><strong>Expiration:</strong> It expires at the end of the year. We assume you utilize 100% of your Bilt Cash annually.</li>
                      </ul>
                   </div>
                </div>

                <div className="border-t border-zinc-100 pt-8">
                    <h3 className="text-lg font-black text-black mb-4 uppercase tracking-wide">3. The Two Strategies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-zinc-200 p-5 rounded-xl">
                            <h4 className="font-bold mb-2">Option 1: Multipliers</h4>
                            <p className="text-xs text-zinc-500 mb-2">Goal: Spend enough on card to unlock rent points.</p>
                            <p className="text-sm">In this mode, you keep <strong>100% of your Bilt Cash</strong> as profit because your spending volume unlocks the rent points automatically.</p>
                        </div>
                        <div className="bg-white border border-zinc-200 p-5 rounded-xl">
                            <h4 className="font-bold mb-2">Option 2: Bilt Cash Unlock</h4>
                            <p className="text-xs text-zinc-500 mb-2">Goal: Use Bilt Cash to "buy" rent points.</p>
                            <p className="text-sm">In this mode, we deduct the Bilt Cash needed to unlock rent from your profit. You only keep the <strong>Surplus Bilt Cash</strong>.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                    <h3 className="text-lg font-bold text-rose-900 mb-2">4. The 2% Baseline Comparison</h3>
                    <p className="text-sm text-rose-800">
                        Most 2% cash back cards charge a ~3% transaction fee when paying rent. This would result in a net loss.
                        Therefore, our baseline calculation assumes you do <strong>NOT</strong> pay rent with a credit card (earning $0), rather than paying a 3% fee to earn 2%.
                        The Bilt advantage is earning points on rent for $0 in fees, which the baseline cannot do.
                    </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">5. Point Valuation &amp; Transfer Partners</h3>
                    <p className="text-sm text-purple-800 mb-3">
                        We value Bilt Points at <strong>2.2 cents per point</strong> based on TPG's baseline valuation. This is a <strong>conservative floor</strong>, not a ceiling.
                    </p>
                    <p className="text-sm text-purple-800">
                        Savvy points maximizers can achieve <strong>3-5+ cents per point</strong> by transferring to airline and hotel partners like Hyatt, United, or American Airlines. If you optimize transfers, your actual value may be significantly higher than shown.
                    </p>
                </div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">6. Hotel Credit Note</h3>
                    <p className="text-sm text-amber-800">
                        Obsidian ($100) and Palladium ($400) hotel credits are <strong>only redeemable through Bilt Travel Hotel bookings</strong>.
                        The calculator caps hotel credit value at your annual travel spend, but note that general "travel" (flights, Uber, transit) does not qualify.
                        For accurate valuation, your Travel input should reflect <strong>hotel-eligible spending</strong>.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-black text-zinc-900 mb-4 uppercase tracking-wide">Sources</h3>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <a href="https://support.biltrewards.com/hc/en-us/articles/42648751360653-About-the-Bilt-Card-2-0-Program" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                                <span>📄</span> About the Bilt Card 2.0 Program (Official Support)
                            </a>
                        </li>
                        <li>
                            <a href="https://thepointsguy.com/credit-cards/bilt-cash-earn-and-redeem/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                                <span>📄</span> The Points Guy: Bilt Cash Guide
                            </a>
                        </li>
                        <li>
                             <a href="https://support.biltrewards.com/hc/en-us/articles/40132420650509-Bilt-Cash" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                                <span>📄</span> Bilt Cash Official FAQ
                            </a>
                        </li>
                        <li>
                             <a href="https://newsroom.biltrewards.com/biltcardupdate" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                                <span>📄</span> Bilt Newsroom: Card Update Announcement
                            </a>
                        </li>
                    </ul>
                </div>
              </div>
           </div>
        </div>
       )}
       {showValuation && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-zinc-900/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowValuation(false)}>
            <div className="bg-white rounded-2xl lg:rounded-[2rem] shadow-2xl max-w-lg w-full p-5 lg:p-10" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-4 lg:mb-6">
                 <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight">Point Valuation</h2>
                 <button onClick={() => setShowValuation(false)} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm">✕</button>
               </div>
               <div className="text-zinc-600 space-y-4">
                  <p className="text-lg">
                    Our calculations use a value of <strong>2.2 cents per point</strong> for Bilt Points.
                  </p>
                  <p className="text-lg">
                    We value <strong>Bilt Cash at $1.00</strong> (Face Value), assuming you redeem it for travel, rent, or fitness within the app.
                  </p>
                  <div className="bg-zinc-50 p-4 rounded-xl text-sm border border-zinc-100 mt-4">
                    Note: We are not affiliated with The Points Guy. We simply use their public data as a reputable industry benchmark.
                  </div>
                  <a href="https://thepointsguy.com/loyalty-programs/monthly-valuations/" target="_blank" rel="noopener noreferrer" className="block w-full py-4 mt-4 bg-zinc-900 text-white font-bold rounded-xl text-center hover:bg-black transition-colors">
                    Read TPG Report
                  </a>
               </div>
            </div>
         </div>
       )}

       {/* Mobile Menu Modal */}
       {showMobileMenu && (
         <div className="fixed inset-0 z-50 bg-zinc-900/90 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden" onClick={() => setShowMobileMenu(false)}>
           <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
               <h2 className="text-xl font-black uppercase tracking-tight">Menu</h2>
               <button onClick={() => setShowMobileMenu(false)} className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold">✕</button>
             </div>
             <div className="p-4 space-y-2">
               <button
                 onClick={() => { setShowMobileMenu(false); startTour(); }}
                 className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors text-left"
               >
                 <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-lg">?</span>
                 <div>
                   <p className="font-bold text-zinc-900">Take the Tour</p>
                   <p className="text-sm text-zinc-500">Learn how this app works</p>
                 </div>
               </button>
               <button
                 onClick={() => { setShowMobileMenu(false); setShowBenefits(true); }}
                 className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors text-left"
               >
                 <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">💳</span>
                 <div>
                   <p className="font-bold text-zinc-900">Card Benefits</p>
                   <p className="text-sm text-zinc-500">Compare card tiers and perks</p>
                 </div>
               </button>
               <button
                 onClick={() => { setShowMobileMenu(false); setShowMethodology(true); }}
                 className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors text-left"
               >
                 <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-lg">📊</span>
                 <div>
                   <p className="font-bold text-zinc-900">Methodology</p>
                   <p className="text-sm text-zinc-500">How we calculate values</p>
                 </div>
               </button>
               <button
                 onClick={() => { setShowMobileMenu(false); setShowValuation(true); }}
                 className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors text-left"
               >
                 <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg">💰</span>
                 <div>
                   <p className="font-bold text-zinc-900">TPG Valuation</p>
                   <p className="text-sm text-zinc-500">Point valuation details</p>
                 </div>
               </button>
               <button
                 onClick={() => { setShowMobileMenu(false); setShowDisclaimer(true); }}
                 className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors text-left"
               >
                 <span className="w-10 h-10 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center text-lg">⚖️</span>
                 <div>
                   <p className="font-bold text-zinc-900">Disclaimer</p>
                   <p className="text-sm text-zinc-500">Legal and privacy info</p>
                 </div>
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Full Screen Chart Modal */}
       {showFullScreenChart && (
         <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
           <div className="p-3 border-b border-zinc-200 flex justify-between items-center shrink-0">
             <h2 className="text-base font-black uppercase tracking-tight">{timeframe === 'year1' ? 'Year 1' : 'Year 2+'} Net Profit</h2>
             <button onClick={() => setShowFullScreenChart(false)} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm">✕</button>
           </div>
           <div className="flex-1 p-3 flex flex-col overflow-hidden min-h-0">
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2 flex items-center gap-2 shrink-0">
               <span className="text-amber-600 text-sm">📱</span>
               <p className="text-[10px] text-amber-800 font-medium">Rotate your device to landscape for the best view</p>
             </div>
             <div className="flex-1 min-h-0 overflow-hidden [&_svg]:outline-none [&_svg]:focus:outline-none [&_.recharts-surface]:outline-none">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={results} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                   <XAxis dataKey="cardTier" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 700, fill: '#71717a' }} />
                   <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12, fill: '#a1a1aa' }} width={50} />
                   <ReferenceLine y={0} stroke="#3f3f46" strokeWidth={2} />
                   <ReferenceLine y={baselineValue} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'top', value: '2% Baseline', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                   <Tooltip
                     cursor={{ fill: '#f4f4f5' }}
                     content={({ active, payload, label }) => {
                       if (active && payload && payload.length) {
                         const value = payload[0].value as number;
                         return (
                           <div className="bg-white p-4 rounded-xl shadow-lg border border-zinc-200">
                             <p className="text-xs text-zinc-400 font-black uppercase mb-2">{label}</p>
                             <div className="space-y-1">
                               <div className="flex justify-between items-center gap-4">
                                 <span className="text-zinc-600 font-bold text-sm">Bilt Profit</span>
                                 <span className={`font-black ${value < 0 ? 'text-rose-500' : 'text-black'}`}>
                                   ${Math.round(value).toLocaleString()}
                                 </span>
                               </div>
                               <div className="flex justify-between items-center gap-4 pt-1 border-t border-zinc-100">
                                 <span className="text-rose-500 font-bold text-sm">2% Card</span>
                                 <span className="text-rose-500 font-bold text-sm">
                                   ${Math.round(baselineValue).toLocaleString()}
                                 </span>
                               </div>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     }}
                   />
                   <Bar dataKey={timeframe === 'year1' ? "netValueYear1" : "netValueYear2"} radius={[12, 12, 0, 0]} barSize={80}>
                     {results.map((entry, index) => {
                       const val = timeframe === 'year1' ? entry.netValueYear1 : entry.netValueYear2;
                       return <Cell key={`cell-fs-${index}`} fill={val < 0 ? '#f43f5e' : (entry.cardTier === best.cardTier && val > 0 ? '#000000' : '#e4e4e7')} />;
                     })}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <div className="text-center mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
               {timeframe === 'year1' ? 'Year 1 Net Value (Incl. Sign-up Bonus)' : 'Year 2+ Recurring Annual Value'}
             </div>
           </div>
         </div>
       )}

      <header className="px-4 md:px-10 py-4 md:py-8 flex items-center justify-between border-b border-zinc-200 bg-white shrink-0">
        <div className="flex items-center gap-4 md:gap-10">
          <h1 className="text-xl md:text-4xl font-black tracking-tighter flex items-center gap-1 md:gap-2">IS BILT <span className="text-zinc-400 font-light text-lg md:text-3xl">|</span> 2.0 FOR ME?</h1>

          <div className="hidden lg:flex bg-zinc-100 p-2 rounded-2xl">
            <button onClick={() => setMode(RewardMode.MULTIPLIER)} className={`text-base px-8 py-3 rounded-xl font-bold transition-all ${mode === RewardMode.MULTIPLIER ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}>Option 1: Multipliers</button>
            <button onClick={() => setMode(RewardMode.BILT_CASH)} className={`text-base px-8 py-3 rounded-xl font-bold transition-all ${mode === RewardMode.BILT_CASH ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}>Option 2: Bilt Cash</button>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex gap-2">
            <button onClick={() => setShowDisclaimer(true)} className="text-sm font-bold text-zinc-400 hover:text-black hover:bg-zinc-100 px-4 py-3 rounded-2xl transition-all">
              Disclaimer
            </button>
            <button onClick={() => setShowMethodology(true)} className="text-sm font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 px-4 py-3 rounded-2xl transition-all">
              Methodology
            </button>
            <button onClick={() => setShowBenefits(true)} className="text-base font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 px-6 py-3 rounded-2xl border border-transparent hover:border-zinc-200 transition-all">
              Card Benefits
            </button>
            <button onClick={startTour} className="text-base font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 px-6 py-3 rounded-2xl border border-transparent hover:border-zinc-200 transition-all flex items-center gap-2">
              <span className="w-6 h-6 bg-zinc-200 text-zinc-600 flex items-center justify-center rounded-full text-xs font-black">?</span>
              Tour
            </button>
          </div>
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex md:hidden w-10 h-10 bg-zinc-100 hover:bg-zinc-200 rounded-xl items-center justify-center transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => setShowValuation(true)} className="hidden sm:flex text-sm md:text-base font-black text-zinc-500 hover:text-black uppercase bg-zinc-50 hover:bg-zinc-100 px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-zinc-100 transition-colors items-center gap-2 group">
            <span className="hidden md:inline">Latest TPG Valuation</span>
            <span className="md:hidden">TPG</span>
            <span className="w-4 h-4 rounded-full bg-zinc-200 text-[10px] flex items-center justify-center text-zinc-500 group-hover:bg-zinc-300">?</span>
          </button>
        </div>
      </header>

      {/* Mobile Desktop Recommendation Banner */}
      <div className="lg:hidden px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-center gap-2">
        <span className="text-amber-600 text-lg">💻</span>
        <p className="text-xs text-amber-800 font-medium">For the best experience, view this app on a desktop browser.</p>
      </div>

      {/* Mobile Mode Switcher */}
      <div className="lg:hidden px-4 py-3 bg-white border-b border-zinc-100">
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button onClick={() => setMode(RewardMode.MULTIPLIER)} className={`flex-1 text-xs sm:text-sm py-2.5 rounded-lg font-bold transition-all ${mode === RewardMode.MULTIPLIER ? 'bg-white shadow-sm text-black' : 'text-zinc-400'}`}>Multipliers</button>
            <button onClick={() => setMode(RewardMode.BILT_CASH)} className={`flex-1 text-xs sm:text-sm py-2.5 rounded-lg font-bold transition-all ${mode === RewardMode.BILT_CASH ? 'bg-white shadow-sm text-black' : 'text-zinc-400'}`}>Bilt Cash</button>
          </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-6 lg:gap-10 max-w-[2000px] mx-auto w-full">
        {/* Housing & Spend Section - First on mobile, top-left on desktop */}
        <section className="order-1 lg:col-span-4 lg:row-start-1 bg-white p-6 md:p-8 lg:p-12 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-zinc-200">
          <h2 className="text-sm lg:text-base font-black text-zinc-400 mb-4 lg:mb-6 uppercase tracking-widest border-b border-zinc-100 pb-4 lg:pb-6 flex justify-between items-center">
            <span>Housing & Spend</span>
            <span className="text-black bg-zinc-100 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm">${(rent + totalSpend).toLocaleString()} Total</span>
          </h2>

          {/* City Presets */}
          <div className="mb-6 lg:mb-8">
            <p className="text-[10px] lg:text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 lg:mb-3">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setRent(3500); setDining(600); setGrocery(400); setTravel(300); setMisc(800); }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                NYC
              </button>
              <button
                onClick={() => { setRent(3200); setDining(500); setGrocery(450); setTravel(400); setMisc(700); }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                SF
              </button>
              <button
                onClick={() => { setRent(2500); setDining(400); setGrocery(350); setTravel(500); setMisc(600); }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                LA
              </button>
              <button
                onClick={() => { setRent(1500); setDining(200); setGrocery(300); setTravel(100); setMisc(300); }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                Budget
              </button>
            </div>
          </div>

          <CompactSlider label="Rent / Mortgage" value={rent} min={0} max={10000} step={100} onChange={setRent} />
          <CompactSlider label="Dining" value={dining} min={0} max={3000} step={50} onChange={setDining} />
          <CompactSlider label="Grocery" value={grocery} min={0} max={3000} step={50} onChange={setGrocery} />
          <CompactSlider label="Travel" value={travel} min={0} max={5000} step={50} onChange={setTravel} />
          <CompactSlider label="Everything Else" value={misc} min={0} max={10000} step={100} onChange={setMisc} />

           <div className="bg-zinc-50 rounded-xl p-3 lg:p-4 text-[10px] lg:text-xs text-zinc-500 font-medium border border-zinc-100 space-y-1">
            <p>* Calculations assume you meet the minimum spend requirements (e.g. $4k in 3mo for Palladium) to unlock all sign-up bonuses.</p>
            <p>* For Obsidian, calculator assumes you select the optimal 3x category (whichever has higher spend between Dining and Grocery).</p>
           </div>
        </section>

        {/* Strategy Alert - Last on mobile (order-3), bottom-left on desktop */}
        <section className="order-3 lg:col-span-4 lg:row-start-2 bg-black text-white p-6 md:p-8 lg:p-12 rounded-2xl lg:rounded-[2.5rem] shadow-2xl flex flex-col justify-center relative overflow-hidden min-h-[280px] lg:min-h-[350px]">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6 lg:mb-8">
                <h3 className="text-sm lg:text-base font-black uppercase tracking-widest text-zinc-500">Strategy Alert</h3>
                <button
                  onClick={() => setShowVerdict(true)}
                  className="animate-pulse bg-amber-400 text-black hover:bg-amber-300 text-xs lg:text-sm font-black uppercase tracking-widest px-4 lg:px-6 py-2.5 lg:py-3 rounded-full transition-colors"
                >
                  What should I do?
                </button>
              </div>
              <p className="text-base lg:text-xl leading-relaxed mb-8 lg:mb-12 text-zinc-300 font-medium">
                {strategyText}
              </p>
              <div className="grid grid-cols-2 gap-4 lg:gap-8">
                <div className="bg-zinc-900 p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-zinc-800">
                  <p className="text-xs lg:text-sm font-bold text-zinc-500 uppercase mb-2 lg:mb-3">Est. Points/Yr</p>
                  <p className="text-xl lg:text-3xl font-black text-white">
                    {Math.round(best.annualPointsEarned).toLocaleString()}
                  </p>
                </div>
                <div className="bg-zinc-900 p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-zinc-800">
                  <p className="text-xs lg:text-sm font-bold text-zinc-500 uppercase mb-2 lg:mb-3">Est. Value (TPG)</p>
                  <p className="text-xl lg:text-3xl font-black text-emerald-400">
                     ${Math.round(timeframe === 'year1' ? best.netValueYear1 : best.netValueYear2).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            {/* Abstract geometric shape background */}
            <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
               <div className="w-64 lg:w-96 h-64 lg:h-96 border-[40px] lg:border-[60px] border-white rounded-full"></div>
            </div>
        </section>

        {/* Right Column - Contains Timeframe Toggle, Card Tiles, and Chart */}
        <div className="order-2 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 flex flex-col gap-6 lg:gap-10">
          {/* Timeframe Toggle - Prominent placement above results */}
          <div className="flex flex-col items-center gap-2 mb-0 lg:mb-2">
            <div className="inline-flex bg-zinc-200/50 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl backdrop-blur-sm border border-zinc-200">
               <button
                 onClick={() => setTimeframe('year1')}
                 className={`px-4 lg:px-8 py-2 lg:py-3 rounded-lg lg:rounded-xl font-black text-xs lg:text-sm uppercase tracking-wide transition-all ${timeframe === 'year1' ? 'bg-white text-black shadow-md scale-105' : 'text-zinc-500 hover:text-zinc-700'}`}
               >
                 Year 1 (w/ Bonus)
               </button>
               <button
                 onClick={() => setTimeframe('year2')}
                 className={`px-4 lg:px-8 py-2 lg:py-3 rounded-lg lg:rounded-xl font-black text-xs lg:text-sm uppercase tracking-wide transition-all ${timeframe === 'year2' ? 'bg-white text-black shadow-md scale-105' : 'text-zinc-500 hover:text-zinc-700'}`}
               >
                 Year 2+ (Recurring)
               </button>
            </div>
            <p className="text-[10px] lg:text-xs text-zinc-400 text-center max-w-md">
              {timeframe === 'year1'
                ? "Includes one-time welcome bonus — great if you're evaluating the first-year value"
                : "Ongoing annual value after bonus — what you'll earn long-term"}
            </p>
          </div>

          {/* Bilt Worth It? Banner */}
          {(rent > 0 || totalSpend > 0) && (
            <div className={`rounded-xl lg:rounded-2xl p-4 lg:p-5 flex items-center gap-3 lg:gap-4 ${
              baselineWins
                ? 'bg-rose-50 border border-rose-200'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-lg lg:text-xl shrink-0 ${
                baselineWins ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {baselineWins ? '✗' : '✓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm lg:text-base ${baselineWins ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {baselineWins ? 'SKIP BILT' : 'BILT WINS'}
                </p>
                <p className={`text-xs lg:text-sm ${baselineWins ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {baselineWins
                    ? `A standard 2% card beats the best Bilt option by $${Math.round(baselineValue - activeBestNetValue).toLocaleString()}/yr`
                    : `You'd earn $${Math.round(activeBestNetValue - baselineValue).toLocaleString()}/yr more than a standard 2% card`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-10">
            {results.map((r: CalculationResult) => {
              // Only treat as visually "Best" if the value is positive.
              const isVisuallyBest = (r.cardTier === best.cardTier) && (activeBestNetValue > 0);
              return <CardTile key={r.cardTier} result={r} isBest={isVisuallyBest} baseline={baselineValue} timeframe={timeframe} baselineWins={baselineWins} />;
            })}
          </div>

          <section className="bg-white p-4 md:p-8 lg:p-12 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-zinc-200 flex-1 flex flex-col min-h-[350px] lg:min-h-[450px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 lg:mb-10">
              <div>
                 <h2 className="text-sm lg:text-base font-black text-zinc-400 uppercase tracking-widest">
                   {timeframe === 'year1' ? 'Year 1' : 'Year 2+'} Net Profit Breakdown
                 </h2>
                 <p className="text-[10px] lg:text-xs text-zinc-400 mt-1 lg:mt-2 font-medium">Comparing Bilt Rewards vs. a Standard 2% Cash Back Card</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Full screen button - mobile only */}
                <button
                  onClick={() => setShowFullScreenChart(true)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand
                </button>
                <div className="text-xs lg:text-sm font-bold text-white bg-black px-3 lg:px-5 py-2 lg:py-2.5 rounded-full uppercase tracking-wide">Current Best: {(timeframe === 'year1' ? best.netValueYear1 : best.netValueYear2) > 0 ? best.cardTier : 'None'}</div>
              </div>
            </div>
            <div className="flex-1 [&_svg]:outline-none [&_svg]:focus:outline-none [&_.recharts-surface]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="cardTier" axisLine={false} tickLine={false} tick={{ fontSize: 16, fontWeight: 700, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 14, fill: '#a1a1aa' }} width={60} />
                  <ReferenceLine y={0} stroke="#3f3f46" strokeWidth={2} />
                  <ReferenceLine y={baselineValue} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'top', value: '2% Cash Back Card (Excl. Rent) Baseline', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    wrapperClassName="hidden lg:block"
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const value = payload[0].value as number;
                        return (
                          <div className="bg-white p-6 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-none">
                            <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mb-3">{label}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center gap-8">
                                <span className="text-zinc-600 font-bold text-sm">Bilt Annual Profit</span>
                                <span className={`text-lg font-black ${value < 0 ? 'text-rose-500' : 'text-black'}`}>
                                  ${Math.round(value).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-8 pt-2 border-t border-zinc-100">
                                <span className="text-rose-500 font-bold text-sm">2% Cash Back Profit</span>
                                <span className="text-rose-500 font-bold text-sm">
                                  ${Math.round(baselineValue).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Dynamic Bar Key based on Timeframe */}
                  <Bar
                    dataKey={timeframe === 'year1' ? "netValueYear1" : "netValueYear2"}
                    radius={[16, 16, 0, 0]}
                    barSize={120}
                    onClick={(data) => setSelectedChartBar(data.cardTier)}
                  >
                    {results.map((entry, index) => {
                      const val = timeframe === 'year1' ? entry.netValueYear1 : entry.netValueYear2;
                      return <Cell key={`cell-${index}`} fill={val < 0 ? '#f43f5e' : (entry.cardTier === best.cardTier && val > 0 ? '#000000' : '#e4e4e7')} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Mobile: Fixed info panel for selected bar */}
              <div className="lg:hidden mt-3">
                {selectedChartBar ? (
                  <div className="bg-zinc-100 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-500 uppercase">{selectedChartBar}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">Bilt:</span>
                        <span className={`font-black ${(timeframe === 'year1' ? results.find(r => r.cardTier === selectedChartBar)?.netValueYear1 ?? 0 : results.find(r => r.cardTier === selectedChartBar)?.netValueYear2 ?? 0) < 0 ? 'text-rose-500' : 'text-black'}`}>
                          ${Math.round(timeframe === 'year1' ? results.find(r => r.cardTier === selectedChartBar)?.netValueYear1 ?? 0 : results.find(r => r.cardTier === selectedChartBar)?.netValueYear2 ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">2% Card:</span>
                        <span className="font-bold text-rose-500">${Math.round(baselineValue).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 rounded-xl p-3 text-center">
                    <span className="text-xs text-zinc-400 font-medium">Tap a bar to see details</span>
                  </div>
                )}
              </div>

              <div className="text-center mt-3 lg:mt-4 text-[10px] lg:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Graph displays {timeframe === 'year1' ? 'Year 1 Net Value (Incl. Sign-up Bonus)' : 'Year 2+ Recurring Annual Value'}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="px-4 lg:px-12 py-4 lg:py-6 border-t border-zinc-200 bg-white flex justify-between items-center shrink-0">
          <div className="hidden sm:flex gap-4 lg:gap-8 text-[10px] lg:text-xs text-zinc-400">
            <p><strong>Option 1:</strong> Multipliers (0.5x-1.25x)</p>
            <p><strong>Option 2:</strong> 4% Bilt Cash to unlock points</p>
          </div>
          <p className="font-bold text-zinc-300 uppercase text-[10px] lg:text-xs">Updated: Jan 16, 2026</p>
       </footer>
    </div>
  );
}