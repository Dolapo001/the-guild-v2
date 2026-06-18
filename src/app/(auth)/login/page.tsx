"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { toast } from "sonner";

export default function LoginPage() {
  const { login, verifyMfa, mfaPending, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    try {
      if (mfaPending) {
        await verifyMfa(code);
        toast.success("Verified! Welcome back.");
      } else {
        const { mfaRequired } = await login(email, password);
        if (mfaRequired) {
          toast.info("Enter the verification code sent to you.");
        } else {
          toast.success("Welcome back! Login successful.");
        }
      }
    } catch (err: any) {
      const msg = err?.message || "Login failed.";
      setLocalError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-6 shadow-xl shadow-primary/20 overflow-hidden">
            <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Welcome Back</h1>
          <p className="text-foreground/50 font-medium mt-2">Sign in to manage your business pulse.</p>
        </div>

        <GlassCard className="p-8 border-white/40 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!mfaPending && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border focus:ring-primary/10"
                    />
                  </div>
                </div>
              </>
            )}

            {mfaPending && (
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Verification Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    autoFocus
                    className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border focus:ring-primary/10 tracking-[0.4em] font-bold"
                  />
                </div>
                <p className="text-[10px] font-medium text-foreground/40 px-1">Enter the 6-digit code sent to your email / authenticator.</p>
              </div>
            )}

            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-600 text-center"
                role="alert"
              >
                {displayError}
              </motion.div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              {isLoading
                ? (mfaPending ? "Verifying..." : "Signing in...")
                : (mfaPending ? "Verify Code" : "Sign In")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-glass-border text-center">
            <p className="text-sm font-medium text-foreground/40">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">Create one now</Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
