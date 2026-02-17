"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  FileJson, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Search,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useValidateAttestation } from "@/lib/strata/hooks";
import { cn } from "@/lib/utils";

export default function VerificationPortalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const validateMutation = useValidateAttestation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".json")) {
        setError("Please upload a valid JSON attestation file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          setJsonContent(content);
        } catch (err) {
          setError("Failed to parse JSON file.");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleVerify = () => {
    if (jsonContent) {
      validateMutation.mutate(jsonContent);
    }
  };

  const reset = () => {
    setFile(null);
    setJsonContent(null);
    setError(null);
    validateMutation.reset();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      <nav className="relative z-10 border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold">Strata <span className="text-emerald-400">Verify</span></span>
          </Link>
          <div className="text-xs text-neutral-500 uppercase tracking-widest font-bold hidden sm:block">
            Strata Verification Protocol v1.0
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Verification Portal</h1>
          <p className="text-neutral-400 text-lg">
            Upload a Strata-signed attestation to verify its authenticity and validity.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!validateMutation.data ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Dropzone */}
              <div 
                className={cn(
                  "relative group rounded-3xl border-2 border-dashed transition-all p-12 text-center",
                  file 
                    ? "border-emerald-500 bg-emerald-500/5" 
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/30"
                )}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".json,application/json"
                />
                
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                    file ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500"
                  )}>
                    {file ? <FileJson className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  
                  {file ? (
                    <div>
                      <p className="text-xl font-medium text-white mb-1">{file.name}</p>
                      <p className="text-sm text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-medium text-white mb-2">Drop attestation file here</p>
                      <p className="text-sm text-neutral-500">or click to browse from your computer</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={!file || validateMutation.isPending}
                className="w-full py-5 rounded-2xl bg-white text-neutral-950 font-bold text-lg hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3"
              >
                {validateMutation.isPending ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Search className="w-5 h-5" />
                    </motion.div>
                    Verifying Signature...
                  </>
                ) : (
                  <>
                    Verify Attestation
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "rounded-3xl border p-10 text-center shadow-2xl",
                validateMutation.data.valid 
                  ? "bg-emerald-950/20 border-emerald-800/50" 
                  : "bg-rose-950/20 border-rose-800/50"
              )}
            >
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8",
                validateMutation.data.valid ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}>
                {validateMutation.data.valid ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <h2 className="text-3xl font-serif mb-4">
                {validateMutation.data.valid ? "Verified Authentic" : "Verification Failed"}
              </h2>
              
              {validateMutation.data.valid ? (
                <>
                  <p className="text-emerald-100 text-lg mb-8 leading-relaxed max-w-md mx-auto">
                    This document is a legitimate financial attestation signed by the Strata Platform.
                  </p>
                  
                  <div className="bg-neutral-900/50 rounded-2xl p-6 mb-8 text-left border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-2">Claim Statement</div>
                    <div className="text-xl font-medium text-white mb-6">
                      {validateMutation.data.statement}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">
                          <Calendar className="w-3 h-3" /> Issued
                        </div>
                        <div className="text-sm text-neutral-300">
                          {new Date(validateMutation.data.issued_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">
                          <Clock className="w-3 h-3" /> Expires
                        </div>
                        <div className="text-sm text-neutral-300">
                          {new Date(validateMutation.data.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-rose-200 text-lg mb-8 leading-relaxed max-w-md mx-auto">
                  The signature on this document is invalid or the attestation has expired. 
                  Do not rely on the information contained in this file.
                </p>
              )}

              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Verify another file
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="mt-32 grid md:grid-cols-2 gap-8 text-sm">
          <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/20">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              How it works
            </h3>
            <p className="text-neutral-500 leading-relaxed">
              Strata Verify uses Ed25519 digital signatures to validate that a financial claim was issued by our platform after direct bank authentication.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/20">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Trust by Default
            </h3>
            <p className="text-neutral-500 leading-relaxed">
              Recipients of this attestation do not see account numbers or history, reducing their PII liability while providing high-assurance proof.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-neutral-900 py-12 text-center text-neutral-600 text-xs uppercase tracking-widest">
        © 2026 ClearMoney & Strata Platform · SVP-1 Standard
      </footer>
    </div>
  );
}
