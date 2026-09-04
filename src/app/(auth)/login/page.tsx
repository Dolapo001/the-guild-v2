"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, verifyMfa, mfaPending, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; code?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email);
  const emailError = touched.email && !emailValid ? "Enter a valid email address" : null;
  const passwordError = touched.password && password.length === 0 ? "Password is required" : null;
  const codeError = touched.code && code.replace(/\D/g, "").length < 6 ? "Enter the 6-digit code" : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (mfaPending) {
      setTouched((t) => ({ ...t, code: true }));
      if (code.replace(/\D/g, "").length < 6) return;
    } else {
      setTouched({ email: true, password: true });
      if (!emailValid || password.length === 0) return;
    }
    setIsLoading(true);
    try {
      if (mfaPending) {
        await verifyMfa(code);
        toast.success("Verified! Welcome back.");
      } else {
        const { mfaRequired } = await login(email, password);
        if (mfaRequired) toast.info("Enter the verification code sent to you.");
        else toast.success("Welcome back! Login successful.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setLocalError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#08090e]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500 mb-6 shadow-xl shadow-indigo-500/20 overflow-hidden">
            <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-h1 text-slate-100">Welcome back</h1>
          <p className="text-body text-slate-400 mt-2">Sign in to manage your business pulse.</p>
        </div>

        <GlassCard className="p-8 shadow-e4">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {!mfaPending && (
              <>
                <TextField label="Email address" type="email" autoComplete="email" icon={Mail} value={email} onChange={setEmail} onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={emailError} valid={emailValid} />
                <TextField label="Password" type="password" autoComplete="current-password" icon={Lock} value={password} onChange={setPassword} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={passwordError} />
              </>
            )}
            {mfaPending && (
              <TextField label="Verification code" inputMode="numeric" autoComplete="one-time-code" icon={ShieldCheck} value={code} onChange={setCode} onBlur={() => setTouched((t) => ({ ...t, code: true }))} error={codeError} helper="Enter the 6-digit code sent to your email / authenticator." className="[&_input]:tracking-[0.4em] [&_input]:font-bold" autoFocus />
            )}
            {displayError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-input bg-error/10 border border-error/20 text-small font-bold text-error text-center" role="alert">
                {displayError}
              </motion.div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform">
              {isLoading ? (mfaPending ? "Verifying..." : "Signing in...") : mfaPending ? "Verify code" : "Sign in"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-small text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-indigo-400 font-bold hover:underline">Create one now</Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}