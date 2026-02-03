"use client";

import { useState, useMemo, useCallback } from "react";
import { useCreditCards, useSeedAmexPlatinum, useFinancialMemory } from "@/lib/strata/hooks";
import { CardCreditRow } from "@/components/tools/annual-fee-analyzer/CardCreditRow";
import { CardBenefitRow } from "@/components/tools/annual-fee-analyzer/CardBenefitRow";
import { FeeBreakdown } from "@/components/tools/annual-fee-analyzer/FeeBreakdown";
import { Button } from "@/components/ui/button";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { Loader2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AnnualFeeAnalyzerPage() {
  const { data: cards, isLoading } = useCreditCards();
  const { data: memory, isSuccess: memoryLoaded } = useFinancialMemory();
  const seedMutation = useSeedAmexPlatinum();
  
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [valuations, setValuations] = useState<Record<string, number>>({});
  const [useMemoryData, setUseMemoryData] = useState(false);

  const selectedCard = useMemo(
    () => cards?.find((c) => c.id === selectedCardId),
    [cards, selectedCardId]
  );

  const buildInitialValuations = useCallback((card: typeof selectedCard) => {
    if (!card) return {};
    const initialValuations: Record<string, number> = {};
    card.credits.forEach((c) => {
      const creditValue = Number(c.value ?? 0);
      initialValuations[c.id] = c.period === "annual" ? creditValue : creditValue * 12;
    });
    card.benefits.forEach((b) => {
      initialValuations[b.id] = Number(b.default_value ?? 0);
    });
    return initialValuations;
  }, []);

  const handleValuationChange = useCallback((id: string, value: number) => {
    setValuations((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleCardSelect = useCallback(
    (id: string) => {
      setSelectedCardId(id);
      const card = cards?.find((c) => c.id === id);
      if (card) {
        setValuations(buildInitialValuations(card));
      }
    },
    [cards, buildInitialValuations]
  );

  const totalCreditsValue = useMemo(() => {
    if (!selectedCard) return 0;
    return selectedCard.credits.reduce((sum, credit) => sum + (valuations[credit.id] ?? 0), 0);
  }, [selectedCard, valuations]);

  const totalBenefitsValue = useMemo(() => {
    if (!selectedCard) return 0;
    return selectedCard.benefits.reduce((sum, benefit) => sum + (valuations[benefit.id] ?? 0), 0);
  }, [selectedCard, valuations]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  const memoryMonthlyExpenses = useMemoryData ? memory?.average_monthly_expenses : undefined;
  const hasMemoryData = memory?.average_monthly_expenses != null;

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Annual Fee Analyzer</h1>
        <p className="text-muted-foreground">
          Find out if that premium credit card is actually worth the annual fee based on your real spending habits.
        </p>
      </div>

      <LoadMyDataBanner
        isLoaded={memoryLoaded}
        hasData={hasMemoryData}
        isApplied={useMemoryData}
        onApply={() => setUseMemoryData(true)}
        description="Use your average monthly expenses to sanity-check credit valuations."
      />

      {useMemoryData && memoryMonthlyExpenses != null && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Contextual Awareness Active:</span> We&apos;ve detected your average monthly expenses are <span className="font-mono font-bold">{formatCurrency(memoryMonthlyExpenses)}</span>. 
            We&apos;ll use this to help you sanity-check your credit valuations.
          </div>
        </div>
      )}

      {!cards || cards.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="mb-4">No cards found in the database.</p>
          <Button 
            onClick={() => seedMutation.mutate()} 
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Seed Amex Platinum Data
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
            <div className="w-full max-w-sm">
                <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCardId}
                    onChange={(e) => handleCardSelect(e.target.value)}
                >
                    <option value="" disabled>Select a card to analyze</option>
                    {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                        {card.name} (${card.annual_fee}/yr)
                    </option>
                    ))}
                </select>
            </div>
        </div>
      )}

      {selectedCard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Credits & Offers</h2>
                    <div className="space-y-4">
                        {selectedCard.credits.map(credit => (
                            <CardCreditRow 
                                key={credit.id} 
                                credit={credit} 
                                onValuationChange={handleValuationChange}
                                actualMonthlySpend={credit.category === 'transportation' ? (memoryMonthlyExpenses ?? undefined) : undefined}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Benefits & Perks</h2>
                    <div className="space-y-4">
                        {selectedCard.benefits.map(benefit => (
                            <CardBenefitRow 
                                key={benefit.id} 
                                benefit={benefit} 
                                onValuationChange={handleValuationChange} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="md:col-span-1">
                <div className="sticky top-4">
                    <FeeBreakdown 
                        annualFee={selectedCard.annual_fee}
                        creditsValue={totalCreditsValue}
                        benefitsValue={totalBenefitsValue}
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
