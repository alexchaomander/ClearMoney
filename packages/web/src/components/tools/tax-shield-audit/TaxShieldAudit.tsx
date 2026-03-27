"use client";

import React, { useState, useCallback } from "react";
import { 
  Upload, 
  FileText, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UnifiedIntakeForm } from "@/components/shared/UnifiedIntakeForm";
import { cn } from "@/lib/utils";

interface TaxShieldAuditProps {
  showShell?: boolean;
}

type AuditStep = "upload" | "processing" | "results" | "capture";

/**
 * TaxShieldAudit - "Shot #3" for the viral launch.
 * High-signal tool that scans tax docs to find missing deductions.
 */
export function TaxShieldAudit({ showShell = true }: TaxShieldAuditProps) {
  const [step, setStep] = useState<AuditStep>("upload");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const startAudit = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
    setStep("processing");
    
    // Simulate processing
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setStep("results"), 500);
      }
      setProgress(currentProgress);
    }, 400);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      startAudit(droppedFile);
    }
  };

  return (
    <div className="space-y-12">
      {step === "upload" && (
        <div 
          className={cn(
            "relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all animate-fade-up",
            isDragging ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-white hover:border-slate-300"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Upload your W-2 or Schedule C</h3>
              <p className="text-slate-500">
                Drag and drop your document here. Our AI will audit it for missing tax shields in seconds.
              </p>
            </div>
            
            <div className="pt-4">
              <label className="cursor-pointer">
                <span className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors inline-block">
                  Choose File
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && startAudit(e.target.files[0])}
                />
              </label>
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> 256-bit AES Encrypted & Ephemeral
            </p>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="text-center space-y-8 py-12 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div 
              className="absolute inset-0 border-4 border-emerald-500 rounded-full transition-all duration-300" 
              style={{ clipPath: `inset(0 0 0 0 round 50%)`, borderTopColor: 'transparent', transform: `rotate(${progress * 3.6}deg)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">Auditing your tax shields...</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Scanning for missed 83(b) elections, QSBS eligibility, and RSU optimization.
            </p>
          </div>
          
          <div className="max-w-xs mx-auto">
            <Progress value={progress} className="h-2 bg-slate-100" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              {progress < 40 ? "Extracting Data..." : progress < 80 ? "Running Deterministic Rules..." : "Generating Trace..."}
            </p>
          </div>
        </div>
      )}

      {step === "results" && (
        <div className="animate-fade-up space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Card className="flex-1 p-8 bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
                <CheckCircle2 className="w-4 h-4" /> Audit Complete
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-sm font-medium">Estimated Tax Shields Found</p>
                <h4 className="text-5xl font-black text-slate-900 tracking-tight">$12,450</h4>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">92% Confidence Score</p>
                  <p className="text-xs text-slate-500">Based on verified Schedule C rules</p>
                </div>
              </div>
            </Card>

            <div className="w-full md:w-80 space-y-4">
              <Button 
                onClick={() => setStep("capture")}
                className="w-full py-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/20"
              >
                Get My Move-List
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-center text-xs text-slate-400">
                Unlock the full Decision Trace and specific execution steps.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Partial Decision Trace (Un-redacted)
            </h4>
            <div className="space-y-4">
              {[
                { rule: "QSBS 1202 Eligibility", result: "Qualified", impact: "$0 Capital Gains" },
                { rule: "Home Office Deduction", result: "Underspent", impact: "+$2,100 Shield" },
                { rule: "RSU Tax Withholding", result: "Inefficient", impact: "+$4,200 Cash" }
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-bold text-white">{r.rule}</p>
                    <p className="text-xs text-slate-400">{r.result}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">{r.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "capture" && (
        <div className="animate-fade-up flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Claim Your Math</h3>
          <p className="text-slate-500 mb-12 text-center max-w-sm">
            Join the waitlist to unlock your full tax audit and get 1-click execution for these shields.
          </p>
          
          <UnifiedIntakeForm 
            sourceTool="AI Tax Shield Audit"
            onSuccess={() => console.log("Joined waitlist")}
            className="w-full max-w-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
