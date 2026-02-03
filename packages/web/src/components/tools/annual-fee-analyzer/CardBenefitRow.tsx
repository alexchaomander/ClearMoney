import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardBenefit } from "@clearmoney/strata-sdk";

interface CardBenefitRowProps {
  benefit: CardBenefit;
  onValuationChange: (id: string, value: number) => void;
}

export function CardBenefitRow({ benefit, onValuationChange }: CardBenefitRowProps) {
  const [value, setValue] = useState<string>(benefit.default_value?.toString() || "0");

  useEffect(() => {
    const numValue = parseFloat(value);
    onValuationChange(benefit.id, isNaN(numValue) ? 0 : numValue);
  }, [value, benefit.id, onValuationChange]);

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-semibold">{benefit.name}</Label>
          <p className="text-sm text-muted-foreground">{benefit.description}</p>
        </div>
        <div className="flex items-center space-x-2">
           <Label htmlFor={`benefit-${benefit.id}`} className="whitespace-nowrap">Value to me:</Label>
           <Input
             id={`benefit-${benefit.id}`}
             type="number"
             value={value}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
             className="w-24 text-right"
             min="0"
           />
        </div>
      </div>
    </div>
  );
}
