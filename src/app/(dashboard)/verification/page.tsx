"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { maestroService } from "@/services/maestro.service";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2,
  Building2,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-2", className)}>
    {children}
  </p>
);

export default function VerificationPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [cacNumber, setCacNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const businesses = await maestroService.getMyBusinesses();
        if (businesses && businesses.length > 0) {
          setBusiness(businesses[0]);
          setCacNumber(businesses[0].cacNumber || "");
        }
      } catch (err) {
        console.error("Failed to fetch business:", err);
      }
    };
    fetchBusiness();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.uid) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('cac_number', cacNumber);
      if (file) {
        formData.append('verification_document', file);
      }
      
      await maestroService.submitVerification(business.uid, formData);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!business) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Loading Business Context...</p>
      </div>
    );
  }

  const isVerified = user?.verificationStatus === 'verified';

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${isVerified ? 'bg-accent/10' : 'bg-amber-500/10'}`}>
              {isVerified ? <ShieldCheck className="h-8 w-8 text-accent" /> : <ShieldAlert className="h-8 w-8 text-amber-600" />}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase">Trust & Verification</h1>
              <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest mt-1">
                Security Standard: {isVerified ? 'Enterprise Verified' : 'Standard Onboarding'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-10 md:grid-cols-5">
        <div className="md:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full"
              >
                <GlassCard className="p-12 text-center space-y-8 border-accent/20 bg-accent/5">
                  <div className="h-32 w-32 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-2xl">
                    <CheckCircle2 className="h-16 w-16 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-primary">Submission Received!</h2>
                    <p className="text-foreground/60 font-medium leading-relaxed max-w-sm mx-auto">
                      Your documents are being reviewed by our compliance team. Verification usually takes 24-48 hours.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="h-14 px-10 rounded-2xl border-accent/20 text-accent font-bold"
                    onClick={() => window.location.href = '/profile'}
                  >
                    Return to Profile
                  </Button>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard className="p-10 space-y-10">
                  <div className="space-y-2 border-b border-glass-border pb-6">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight">CAC Document Submission</h3>
                    <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Official Registration Details</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Registered RC Number</FormLabel>
                      <div className="relative group">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input 
                          placeholder="e.g. RC 1234567"
                          value={cacNumber}
                          onChange={(e) => setCacNumber(e.target.value)}
                          disabled={isVerified}
                          className="h-16 pl-14 rounded-[1.5rem] bg-white/40 border-glass-border focus:border-primary font-black"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">CAC Certificate (Image/PDF)</FormLabel>
                      <div 
                        className={`relative h-64 w-full rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden group ${
                          file ? 'border-primary/40 bg-primary/5' : 'border-glass-border hover:border-primary/20 bg-slate-50/50'
                        }`}
                        onClick={() => !isVerified && document.getElementById('cac-upload')?.click()}
                      >
                        {preview ? (
                          <div className="relative h-full w-full">
                            {file?.type.includes('pdf') ? (
                              <div className="h-full w-full flex flex-col items-center justify-center bg-primary/10">
                                <FileText className="h-16 w-16 text-primary" />
                                <span className="text-xs font-bold text-primary mt-4">{file.name}</span>
                              </div>
                            ) : (
                              <Image src={preview} alt="CAC Preview" fill className="object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="h-10 w-10 text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="h-8 w-8 text-primary/40" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-black text-primary/60 uppercase">Click to upload document</p>
                              <p className="text-[10px] font-bold text-foreground/30 mt-1 uppercase tracking-widest">Max file size: 5MB</p>
                            </div>
                          </>
                        )}
                        <input 
                          id="cac-upload"
                          type="file" 
                          className="hidden" 
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                              setFile(selectedFile);
                              if (selectedFile.type.includes('image')) {
                                setPreview(URL.createObjectURL(selectedFile));
                              } else {
                                setPreview('pdf');
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-xs font-bold text-red-600 uppercase tracking-tight">{error}</p>
                      </div>
                    )}

                    <Button 
                      type="submit"
                      disabled={isSubmitting || isVerified || !cacNumber}
                      className="w-full h-16 bg-primary text-white font-black text-lg rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Submit for Verification"}
                    </Button>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-2 space-y-8">
          <GlassCard className="p-8 space-y-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <h4 className="text-sm font-black text-primary uppercase tracking-widest">Why get verified?</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-tight">Escrow Access</p>
                  <p className="text-[10px] font-medium text-foreground/40 mt-1">Unlock secure automated payments for high-value services.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-tight">Elite Visibility</p>
                  <p className="text-[10px] font-medium text-foreground/40 mt-1">Rank higher in discovery results with the 'Verified' badge.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-tight">Trust & Safety</p>
                  <p className="text-[10px] font-medium text-foreground/40 mt-1">Customers prioritize businesses with official recognition.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8 space-y-4 border-amber-500/10">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Important Note</p>
            </div>
            <p className="text-[10px] font-medium text-foreground/40 leading-relaxed italic">
              Ensure your RC Number matches exactly as registered with the CAC. Inaccurate details may lead to verification rejection.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

