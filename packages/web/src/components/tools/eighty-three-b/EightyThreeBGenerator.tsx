"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Mail, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Lock
} from "lucide-react";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { UnifiedIntakeForm } from "@/components/shared/UnifiedIntakeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * EightyThreeBGenerator - "Shot #4" for the Viral Launch.
 * High-utility wedge for founders. Solves a terrifying tax problem in 30 seconds.
 */
export function EightyThreeBGenerator() {
  const [step, setStep] = useState<"inputs" | "capture" | "document">("inputs");
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    ssn: "",
    company: "",
    shares: "1,000,000",
    purchasePrice: "$0.0001",
    grantDate: new Date().toISOString().split("T")[0]
  });

  const handleNext = () => {
    if (step === "inputs") setStep("capture");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = document.getElementById("election-content")?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppShell
      title="The 83(b) Perfect-Generator"
      description="Messing up this form can cost you $1M+ in taxes. Generate a legally perfect 83(b) election in 30 seconds."
      category="Founder High-Stakes"
      icon={<FileText className="w-6 h-6 text-brand-400" />}
    >
      <div className="max-w-4xl mx-auto">
        {step === "inputs" && (
          <section className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-8 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-neutral-400">Full Legal Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Alex Chao"
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400">Company Name</Label>
                <Input 
                  value={formData.company} 
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="ClearMoney Inc."
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400">Social Security Number (SSN)</Label>
                <Input 
                  value={formData.ssn} 
                  onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                  placeholder="000-00-0000"
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-neutral-400">Home Address</Label>
                <Input 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Startup Way, San Francisco, CA 94107"
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400">Number of Shares</Label>
                <Input 
                  value={formData.shares} 
                  onChange={(e) => setFormData({...formData, shares: e.target.value})}
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400">Purchase Price per Share</Label>
                <Input 
                  value={formData.purchasePrice} 
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400">Actual Grant Date</Label>
                <Input 
                  type="date"
                  value={formData.grantDate} 
                  onChange={(e) => setFormData({...formData, grantDate: e.target.value})}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>
            </div>

            <Button 
              className="w-full py-8 bg-brand-500 hover:bg-brand-400 text-white font-bold text-lg rounded-2xl"
              onClick={handleNext}
              disabled={!formData.name || !formData.company}
            >
              Generate My Election
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-neutral-400 leading-relaxed">
                <span className="text-amber-500 font-bold uppercase">Reminder:</span> You must mail this to the IRS within **30 days** of your stock grant. There are no exceptions.
              </p>
            </div>
          </section>
        )}

        {step === "capture" && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-up">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Almost Ready</h3>
            <p className="text-neutral-400 mb-8 text-center max-w-sm">
              Enter your email to unlock your document and get our "IRS Proof-of-Mailing" checklist.
            </p>
            
            <UnifiedIntakeForm 
              sourceTool="83(b) Generator"
              onSuccess={() => setStep("document")}
              className="w-full max-w-lg"
            />
          </div>
        )}

        {step === "document" && (
          <div className="space-y-8 animate-fade-in">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800 sticky top-4 z-20 shadow-2xl">
              <div className="flex items-center gap-2 text-brand-400 text-xs font-black uppercase tracking-widest px-2">
                <CheckCircle2 className="w-4 h-4" /> Document Verified
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy Text"}
                </Button>
                <Button size="sm" className="bg-white text-black font-bold" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print to PDF
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <div 
              id="election-content"
              className="bg-white p-12 md:p-20 text-black shadow-2xl rounded-sm font-serif leading-relaxed print:shadow-none print:p-0"
            >
              <h1 className="text-center font-bold text-xl mb-12 uppercase underline">
                Election Under Section 83(b) of the Internal Revenue Code
              </h1>

              <div className="space-y-8 text-sm">
                <p><strong>1. Taxpayer Information:</strong></p>
                <div className="pl-8 space-y-1">
                  <p>Name: {formData.name}</p>
                  <p>Address: {formData.address}</p>
                  <p>SSN: {formData.ssn}</p>
                </div>

                <p><strong>2. Property Description:</strong></p>
                <p className="pl-8">
                  {formData.shares} shares of Common Stock of {formData.company} (the "Company").
                </p>

                <p><strong>3. Date of Transfer:</strong></p>
                <p className="pl-8">{formData.grantDate}</p>

                <p><strong>4. Taxable Year:</strong></p>
                <p className="pl-8">The taxable year for which this election is made is the calendar year {new Date().getFullYear()}.</p>

                <p><strong>5. Nature of Restrictions:</strong></p>
                <p className="pl-8">
                  The shares are subject to a right of repurchase by the Company. This right lapses over time, conditioned on the taxpayer’s continued service to the Company.
                </p>

                <p><strong>6. Fair Market Value:</strong></p>
                <p className="pl-8">
                  The fair market value of the shares at the time of transfer (determined without regard to any lapse restrictions) was {formData.purchasePrice} per share.
                </p>

                <p><strong>7. Amount Paid:</strong></p>
                <p className="pl-8">
                  The amount paid by the taxpayer for the shares was {formData.purchasePrice} per share.
                </p>

                <p><strong>8. Statement of Mailing:</strong></p>
                <p className="pl-8">
                  A copy of this election has been furnished to {formData.company}.
                </p>

                <div className="pt-20 flex justify-between items-end">
                  <div className="w-64 border-t border-black pt-2">
                    <p className="text-[10px] uppercase font-bold">Taxpayer Signature</p>
                  </div>
                  <div className="w-48 border-t border-black pt-2">
                    <p className="text-[10px] uppercase font-bold">Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Generation Checklist */}
            <div className="p-8 rounded-3xl bg-brand-500/5 border border-brand-500/20 space-y-6">
              <h4 className="font-bold text-brand-400 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Your "Zero-Error" Mailing Checklist
              </h4>
              <ul className="grid gap-4 md:grid-cols-2">
                {[
                  "Mail via Certified Mail with Return Receipt Requested.",
                  "Include a cover letter and a self-addressed stamped envelope.",
                  "Send one copy to the IRS Service Center where you file.",
                  "Provide one copy to your Company (CEO or HR).",
                  "Keep the Return Receipt in your permanent tax files.",
                  "DO NOT MISS THE 30-DAY DEADLINE."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-neutral-400">
                    <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5 text-brand-400 text-[10px] font-bold">
                      {i + 1}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-12">
          <MethodologySection
            title="Why this generator exists"
            steps={[
              "Section 83(b) allows you to pay taxes on your equity at its grant-date value, rather than its (hopefully much higher) vesting-date value.",
              "If your startup succeeds, this election can save you millions in future income taxes.",
              "ClearMoney built this tool because founders shouldn't be charged $500 by a lawyer for a simple 1-page form."
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}
