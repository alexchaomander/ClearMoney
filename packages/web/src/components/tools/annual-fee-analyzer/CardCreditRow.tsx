import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CardCredit } from "@clearmoney/strata-sdk";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface CardCreditRowProps {
  credit: CardCredit;
  onValuationChange: (id: string, value: number) => void;
  actualMonthlySpend?: number;
}

export function CardCreditRow({ credit, onValuationChange, actualMonthlySpend }: CardCreditRowProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [utilization, setUtilization] = useState(100); // Percentage

  const creditValue = Number(credit.value ?? 0);
  const annualizedValue = credit.period === "annual" ? creditValue : creditValue * 12;
  const monthlyEquivalentValue = credit.period === "annual" ? creditValue / 12 : creditValue;
  const valuationValue = isEnabled ? (annualizedValue * utilization) / 100 : 0;

  useEffect(() => {
    onValuationChange(credit.id, valuationValue);
  }, [credit.id, onValuationChange, valuationValue]);
  
  const showSpendWarning = useMemo(() => {
    if (!isEnabled || !actualMonthlySpend) return false;
    // Simple heuristic: if it's a transportation credit (Uber) and spend is less than the credit
    if (credit.category === "transportation" && actualMonthlySpend < monthlyEquivalentValue) {
        return true;
    }
    return false;
  }, [isEnabled, actualMonthlySpend, credit.category, monthlyEquivalentValue]);

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm relative overflow-hidden">
      {showSpendWarning && (
          <div className="absolute top-0 right-0 left-0 bg-amber-100 dark:bg-amber-900/30 px-4 py-1 flex items-center justify-center space-x-2 border-b border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Spend Sanity Check: Your avg monthly spend ({formatCurrency(actualMonthlySpend!)}) is less than this credit!
              </span>
          </div>
      )}
      
      <div className={`flex items-center justify-between ${showSpendWarning ? "pt-4" : ""}`}>
        <div className="space-y-1">
          <Label className="text-base font-semibold">{credit.name}</Label>
          <p className="text-sm text-muted-foreground">{credit.description}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{formatCurrency(creditValue)}</div>
          <div className="text-xs text-muted-foreground uppercase">{credit.period}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            id={`toggle-${credit.id}`}
          />
          <Label htmlFor={`toggle-${credit.id}`}>I use this</Label>
        </div>

        {isEnabled && (
          <div className="flex items-center space-x-4 flex-1 max-w-xs ml-4">
            <span className="text-sm w-12">{utilization}%</span>
            <Slider
              value={[utilization]}
              onValueChange={(vals: number[]) => setUtilization(vals[0])}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="font-mono font-medium text-green-600 min-w-[4rem] text-right">
              {formatCurrency(valuationValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
