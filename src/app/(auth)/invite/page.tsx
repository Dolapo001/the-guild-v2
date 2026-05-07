"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Mail, 
  Hash, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Building2,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InviteValidationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError(null);

    try {
      const data = await authService.validateInvitation(email, code);
      setInvitationData(data);
      toast.success("Invitation verified!");
    } catch (err: any) {
      console.error("Validation failed:", err);
      setError(err.message || "Invalid invitation. Please check your details.");
      toast.error("Validation failed.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = () => {
    // Redirect to register with pre-filled email and invitation token
    if (invitationData?.token) {
      router.push(`/register?email=${encodeURIComponent(invitationData.email)}&invite=${invitationData.token}&role=staff`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {!invitationData ? (
            <motion.div
              key="validate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="p-8 md:p-12 space-y-8 border-slate-200/50 shadow-2xl bg-white/95">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Join The Guild</h1>
                  <p className="text-slate-500 font-medium">Enter your invitation details to join your team.</p>
                </div>

                <form onSubmit={handleValidate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:border-primary focus:ring-primary/20 font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Invitation Code</label>
                      <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={code}
                          onChange={(e) => setCode(e.target.value.toUpperCase())}
                          className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:border-primary focus:ring-primary/20 font-black tracking-widest"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                    </motion.div>
                  )}

                  <Button 
                    type="submit"
                    disabled={isValidating || !email || !code}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isValidating ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>Verify Invitation <ChevronRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
                  Lost your code? Contact your manager.
                </p>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="p-8 md:p-12 space-y-8 border-emerald-200/50 shadow-2xl bg-white/95 text-center">
                <div className="h-20 w-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <UserCheck className="h-10 w-10 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Invitation Confirmed</h2>
                  <p className="text-slate-500 font-medium">You've been invited to join an elite team.</p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</p>
                      <p className="text-lg font-black text-slate-900">{invitationData.business_name}</p>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <ShieldCheck className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Designated Role</p>
                      <p className="text-lg font-black text-slate-900">{invitationData.job_title}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleJoin}
                  className="w-full h-16 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Join the Team <ChevronRight className="ml-2 h-6 w-6" />
                </Button>

                <button 
                  onClick={() => setInvitationData(null)}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                >
                  Not you? Use a different code
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
