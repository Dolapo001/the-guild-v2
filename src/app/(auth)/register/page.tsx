"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShieldCheck,
    Mail,
    Lock,
    User,
    Briefcase,
    Users,
    ArrowRight,
    ChevronLeft,
    Key
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Step = "role" | "details" | "invite";

export default function RegisterPage() {
    const { login } = useAuth();
    const [step, setStep] = useState<Step>("role");
    const [role, setRole] = useState<"customer" | "ceo" | "staff" | null>(null);
    const [inviteCode, setInviteCode] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;
        setIsLoading(true);
        await login(formData.email, role);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-6 shadow-xl shadow-primary/20">
                        <ShieldCheck className="h-8 w-8 text-secondary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-primary tracking-tight">Create Account</h1>
                    <p className="text-foreground/50 font-medium mt-2">Join the future of Nigerian service commerce.</p>
                </div>

                <GlassCard className="p-8 border-white/40 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {step === "role" && (
                            <motion.div
                                key="role"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid gap-4">
                                    {[
                                        { id: "customer", title: "I want to Book Services", desc: "Find and book top-rated professionals.", icon: User },
                                        { id: "ceo", title: "I own a Business", desc: "Manage bookings, staff, and growth.", icon: Briefcase },
                                        { id: "staff", title: "I am a Staff Member", desc: "Track your schedule and earnings.", icon: Users },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setRole(item.id as any)}
                                            className={`p-6 rounded-2xl border text-left transition-all flex items-center gap-6 ${role === item.id
                                                    ? 'bg-primary/5 border-primary shadow-sm'
                                                    : 'bg-white/40 border-glass-border hover:border-primary/30'
                                                }`}
                                        >
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${role === item.id ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary">{item.title}</p>
                                                <p className="text-xs font-medium text-foreground/40">{item.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    disabled={!role}
                                    onClick={() => setStep(role === "staff" ? "invite" : "details")}
                                    className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
                                >
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === "invite" && (
                            <motion.div
                                key="invite"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <button onClick={() => setStep("role")} className="flex items-center gap-2 text-[10px] font-extrabold text-primary uppercase tracking-widest hover:underline mb-4">
                                    <ChevronLeft className="h-3 w-3" /> Back to Role Selection
                                </button>
                                <div className="space-y-4">
                                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Key className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-primary">Enter Invite Code</h3>
                                    <p className="text-sm font-medium text-foreground/50 leading-relaxed">
                                        Staff accounts require an invite code from your business owner to join their workspace.
                                    </p>
                                    <Input
                                        placeholder="EX: GUILD-1234-ABCD"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        className="h-14 rounded-xl bg-white/50 border-glass-border font-mono text-center text-lg tracking-widest"
                                    />
                                </div>
                                <Button
                                    disabled={inviteCode.length < 5}
                                    onClick={() => setStep("details")}
                                    className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
                                >
                                    Verify & Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === "details" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <button onClick={() => setStep(role === "staff" ? "invite" : "role")} className="flex items-center gap-2 text-[10px] font-extrabold text-primary uppercase tracking-widest hover:underline mb-8">
                                    <ChevronLeft className="h-3 w-3" /> Back
                                </button>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                                            <Input
                                                placeholder="Adedolapo"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border"
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
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
                                    >
                                        {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-8 border-t border-glass-border text-center">
                        <p className="text-sm font-medium text-foreground/40">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
