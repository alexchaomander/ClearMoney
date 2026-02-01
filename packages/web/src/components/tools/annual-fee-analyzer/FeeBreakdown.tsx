import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeeBreakdownProps {
  annualFee: number;
  creditsValue: number;
  benefitsValue: number;
}

export function FeeBreakdown({ annualFee, creditsValue, benefitsValue }: FeeBreakdownProps) {
  const effectiveFee = annualFee - creditsValue - benefitsValue;
  const isPositive = effectiveFee > 0;

  return (
    <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle>Effective Annual Fee</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Sticker Price (Annual Fee)</span>
          <span className="font-mono font-medium">{formatCurrency(annualFee)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-green-600">
          <span>Credits Value</span>
          <span className="font-mono font-medium">-{formatCurrency(creditsValue)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-green-600">
          <span>Benefits Value</span>
          <span className="font-mono font-medium">-{formatCurrency(benefitsValue)}</span>
        </div>
        
        <div className="pt-4 border-t flex justify-between items-center">
          <span className="font-bold text-lg">Your Real Cost</span>
          <span className={`font-mono font-bold text-2xl ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(effectiveFee)}
          </span>
        </div>
        
        {!isPositive && (
            <p className="text-xs text-green-600 text-center font-medium">
                This card pays you {formatCurrency(Math.abs(effectiveFee))} to keep it!
            </p>
        )}
      </CardContent>
    </Card>
  );
}
