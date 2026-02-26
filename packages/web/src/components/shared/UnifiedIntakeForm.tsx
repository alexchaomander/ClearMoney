"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  UserCircle, 
  TrendingUp, 
  Zap, 
  Users,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UnifiedIntakeFormProps {
  sourceTool: string;
  onSuccess?: (referralCode: string) => void;
  className?: string;
}

type FormStep = "initial" | "profile" | "success";

/**
 * UnifiedIntakeForm - The "Capture Engine" for the Mini-Product Flywheel.
 * Collects Email, Role, Net Worth, and Tier Interest (The Hard Signals).
 */
export function UnifiedIntakeForm({ 
  sourceTool, 
  onSuccess,
  className 
}: UnifiedIntakeFormProps) {
  const [step, setStep] = useState<FormStep>("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    role: "Professional",
    netWorthBracket: "250k-1M",
    interestedTier: "Individual",
    referralCode: ""
  });

  const roles = ["Founder", "Professional", "HNW Individual", "Other"];
  const nwBrackets = ["<250k", "250k-1M", "1M-5M", "5M+"];
  const tiers = [
    { id: "Free", label: "Free Tools", desc: "Just the calculators" },
    { id: "Individual", label: "Individual ($29/mo)", desc: "Full Dashboard + AI" },
    { id: "Founder Pro", label: "Founder Pro ($79/mo)", desc: "The Operating Room" }
  ];

  const handleSubmitInitial = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("profile");
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRATA_API_URL || "http://localhost:8000"}/api/v1/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          net_worth_bracket: formData.netWorthBracket,
          interested_tier: formData.interestedTier,
          source_tool: sourceTool
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to join waitlist");
      }

      const data = await response.json();
      setFormData({ ...formData, referralCode: data.referral_code });
      setStep("success");
      if (onSuccess) onSuccess(data.referral_code);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    const url = `${window.location.origin}/?ref=${formData.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === "success") {
    return (
      <Card className={cn("p-8 text-center bg-neutral-900 border-brand-500/20", className)}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-brand-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
        <p className="text-neutral-400 mb-8">
          We'll notify you as soon as the {sourceTool} is ready for full access.
        </p>
        
        <div className="p-6 bg-neutral-950 rounded-xl border border-neutral-800 mb-6">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Your Viral Referral Link
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800 text-sm text-neutral-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
              {`${typeof window !== 'undefined' ? window.location.host : 'clearmoney.com'}/?ref=${formData.referralCode}`}
            </div>
            <Button size="icon" variant="outline" onClick={copyReferral}>
              {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-neutral-500 mt-4 italic">
            Move up the list for every friend who signs up.
          </p>
        </div>

        <Button 
          variant="link" 
          className="text-brand-400"
          onClick={() => window.location.href = "/"}
        >
          Explore more tools
        </Button>
      </Card>
    );
  }

  return (
    <Card className={cn("p-8 bg-neutral-900 border-neutral-800 overflow-hidden relative", className)}>
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 blur-3xl rounded-full" />
      
      {step === "initial" ? (
        <form onSubmit={handleSubmitInitial} className="relative">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">See the Math</h3>
            <p className="text-sm text-neutral-400">
              Enter your email to unlock the full decision trace and action plan for this tool.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-400">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="alex@startup.com" 
                  required
                  className="pl-10 bg-neutral-950 border-neutral-800 focus:border-brand-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white py-6">
              Unlock My Decision Trace
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-[10px] text-neutral-600 mt-4 text-center">
            By joining, you agree to receive math-driven financial insights. No spam. Ever.
          </p>
        </form>
      ) : (
        <div className="relative animate-fade-in">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Zap className="w-3 h-3" />
              Final Step
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Personalize Your Experience</h3>
            <p className="text-sm text-neutral-400">Help us prioritize the features you need most.</p>
          </div>

          <div className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-neutral-400 text-xs flex items-center gap-2">
                <UserCircle className="w-3 h-3" /> Which best describes you?
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left",
                      formData.role === r 
                        ? "bg-brand-500/10 border-brand-500 text-brand-400" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Net Worth Selection */}
            <div className="space-y-3">
              <Label className="text-neutral-400 text-xs flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Approximate Net Worth (Optional)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {nwBrackets.map((nw) => (
                  <button
                    key={nw}
                    type="button"
                    onClick={() => setFormData({ ...formData, netWorthBracket: nw })}
                    className={cn(
                      "px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                      formData.netWorthBracket === nw 
                        ? "bg-brand-500/10 border-brand-500 text-brand-400" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                    )}
                  >
                    {nw}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Interest */}
            <div className="space-y-3">
              <Label className="text-neutral-400 text-xs flex items-center gap-2">
                <Users className="w-3 h-3" /> Which tier interests you?
              </Label>
              <div className="space-y-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, interestedTier: t.id })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all text-left flex justify-between items-center",
                      formData.interestedTier === t.id 
                        ? "bg-brand-500/10 border-brand-500" 
                        : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                    )}
                  >
                    <div>
                      <div className={cn(
                        "text-sm font-bold",
                        formData.interestedTier === t.id ? "text-brand-400" : "text-white"
                      )}>{t.label}</div>
                      <div className="text-[10px] text-neutral-500">{t.desc}</div>
                    </div>
                    {formData.interestedTier === t.id && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <Button 
              onClick={handleSubmitFinal} 
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-6"
            >
              {loading ? "Joining..." : "Get Priority Access"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
