"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { register, login, user: currentUser } = useAuth();
  
  const businessSlug = params.businessSlug as string;
  const inviteCode = params.code as string;

  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await api.get<any>(`/auth/staff/join/${businessSlug}/${inviteCode}/`);
        setInvitation(response);
        setFormData(prev => ({ ...prev, email: response.email }));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Invitation not found or expired.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvite();
  }, [businessSlug, inviteCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!currentUser) {
        // Register new user as staff
        await register({
          ...formData,
          role: "staff"
        });
        // Registration automatically completes the join on backend if logic is updated
        // But for now let's call the join endpoint explicitly after auth
      }

      // Explicitly accept invitation
      await api.post(`/auth/staff/join/${businessSlug}/${inviteCode}/`);
      toast.success(`Successfully joined ${invitation?.businessName}!`);
      setSuccess(true);
      setTimeout(() => router.push("/home"), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to join business.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
        <GlassCard className="p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Button onClick={() => router.push("/")} className="w-full h-12 rounded-xl bg-primary text-white font-bold">
            Back to Home
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
        <GlassCard className="p-8 max-w-md w-full text-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h1>
          <p className="text-gray-500 mb-8 font-medium">
            You have successfully joined <span className="text-primary font-bold">{invitation?.businessName}</span> as a {invitation?.jobTitle}.
          </p>
          <p className="text-xs text-gray-400">Redirecting to your dashboard...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-xl mb-6 overflow-hidden">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Join {invitation?.businessName}</h1>
          <p className="text-foreground/60 font-medium mt-2">
            You've been invited to join the team as a <span className="text-primary font-bold">{invitation?.jobTitle}</span>.
          </p>
        </div>

        <GlassCard className="p-8 border-white/40 shadow-2xl">
          <form onSubmit={handleJoin} className="space-y-6">
            {!currentUser ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    <Input
                      placeholder="Adedolapo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="pl-11 h-14 rounded-xl bg-gray-50 border-gray-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    <Input
                      type="email"
                      readOnly
                      value={formData.email}
                      className="pl-11 h-14 rounded-xl bg-gray-100 border-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider px-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-11 h-14 rounded-xl bg-gray-50 border-gray-100"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl flex items-center gap-6 mb-4">
                <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <UserCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-bold text-primary">Joining as {currentUser.name}</p>
                  <p className="text-sm font-medium text-gray-500">Currently logged in as {currentUser.email}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
            >
              {isSubmitting ? "Processing..." : currentUser ? "Accept & Join Team" : "Create Account & Join"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            By joining, you agree to The Guild's professional terms of service.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
