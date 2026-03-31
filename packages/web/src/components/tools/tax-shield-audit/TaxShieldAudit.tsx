"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UnifiedIntakeForm } from "@/components/shared/UnifiedIntakeForm";
import { useStrataClient } from "@/lib/strata/client";
import { cn } from "@/lib/utils";

interface TaxShieldAuditProps {
  showShell?: boolean;
}

type AuditStep = "upload" | "processing" | "results" | "capture";
const ALLOWED_UPLOAD_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function TaxShieldAudit({ showShell = true }: TaxShieldAuditProps) {
  void showShell;
  const strataClient = useStrataClient();
  const [step, setStep] = useState<AuditStep>("upload");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startAudit = useCallback(async (uploadedFile: File) => {
    if (!ALLOWED_UPLOAD_TYPES.includes(uploadedFile.type)) {
      setError("Please upload a PDF, PNG, or JPG file.");
      return;
    }
    if (uploadedFile.size > MAX_UPLOAD_BYTES) {
      setError("Please upload a file smaller than 20 MB.");
      return;
    }

    setStep("processing");
    setProgress(10);
    setError(null);
    setSessionId(null);
    setAuditData(null);
    
    try {
      const response = await strataClient.uploadPublicAuditDocument(uploadedFile, uploadedFile.name);
      setSessionId(response.session_id);
    } catch (err: any) {
      console.error("Upload failed", err);
      setError(err.message || "Failed to upload document");
      setStep("upload");
    }
  }, [strataClient]);

  // Polling logic
  useEffect(() => {
    if (!sessionId || step !== "processing") return;

    const pollStatus = async () => {
      try {
        const data = await strataClient.getPublicAuditStatus(sessionId);
        setProgress(data.progress || 50);
        
        if (data.status === "success") {
          setAuditData(data.trace_payload);
          setStep("results");
          clearInterval(pollInterval);
        } else if (data.status === "error") {
          setError(data.error_message || "Audit failed");
          setStep("upload");
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    };

    void pollStatus();
    const pollInterval = setInterval(pollStatus, 2000);
    return () => clearInterval(pollInterval);
  }, [sessionId, step, strataClient]);

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
    if (droppedFile && ALLOWED_UPLOAD_TYPES.includes(droppedFile.type)) {
      startAudit(droppedFile);
    } else {
      setError("Please upload a PDF, PNG, or JPG file.");
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
                Drag and drop your W-2, Schedule C, or tax screenshot here. We support PDF, PNG, and JPG uploads.
              </p>
            </div>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="pt-4">
              <label className="cursor-pointer">
                <span className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors inline-block">
                  Choose File
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,image/png,image/jpeg"
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
              Extracting income signals and checking for common tax opportunities.
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
                <h4 className="text-5xl font-black text-slate-900 tracking-tight">
                  ${auditData?.deterministic?.total_impact?.toLocaleString() || "0"}
                </h4>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {Math.round((auditData?.confidence_score || 0.9) * 100)}% Confidence Score
                  </p>
                  <p className="text-xs text-slate-500">Based on the current public-rule preview</p>
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
              <FileText className="w-4 h-4 text-emerald-500" /> Decision Trace (Lineage)
            </h4>
            <div className="space-y-4">
              {auditData?.rules_applied?.map((r: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-white">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">
                      {r.passed ? "Verified" : `+$${r.threshold?.toLocaleString() || "???"}`}
                    </p>
                  </div>
                </div>
              ))}
              {(!auditData?.rules_applied || auditData.rules_applied.length === 0) && (
                <p className="text-slate-400 text-sm italic">No specific shields identified in this document scan.</p>
              )}
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
            onSuccess={() => undefined}
            className="w-full max-w-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
