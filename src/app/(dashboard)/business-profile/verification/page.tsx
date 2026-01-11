"use client";

import { useState, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    Upload,
    FileText,
    AlertCircle,
    CheckCircle2,
    Info,
    ArrowRight,
    Building2,
    UserCheck,
    ScanLine,
    Sparkles,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type VerificationStatus = "unverified" | "scanning" | "pending" | "verified" | "error";

export default function VerificationPage() {
    const [status, setStatus] = useState<VerificationStatus>("unverified");
    const [cacNumber, setCacNumber] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            startScanning();
        }
    };

    const startScanning = () => {
        setStatus("scanning");
        setErrorMessage("");

        // Simulate AI OCR Extraction
        setTimeout(() => {
            setBusinessName("Glow Spa Lekki");
            setCacNumber("RC-102938");
            setStatus("unverified");
            // Show success toast simulation (using a simple alert for now or just visual change)
        }, 3000);
    };

    const simulateMismatch = () => {
        setStatus("error");
        setErrorMessage("Name on ID does not match CAC Certificate. Please ensure all documents belong to the same entity.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cacNumber) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStatus("pending");
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">Business Verification</h1>
                    <p className="text-foreground/50 font-medium">Verify your business to unlock full marketplace access and build trust with clients.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateMismatch}
                    className="text-red-500 border-red-500/20 hover:bg-red-500/5 font-bold rounded-xl"
                >
                    Simulate Mismatch
                </Button>
            </motion.div>

            <AnimatePresence mode="wait">
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="text-sm font-bold text-red-500">{errorMessage}</p>
                    </motion.div>
                )}

                {status === "unverified" || status === "scanning" || status === "error" ? (
                    <motion.div
                        key="unverified"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-center gap-4 mb-8">
                            <AlertCircle className="h-6 w-6 text-amber-500" />
                            <div>
                                <p className="font-bold text-amber-600">Verification Required</p>
                                <p className="text-sm font-medium text-amber-600/70">Unverified businesses are limited to 5 bookings per month. Verify now to lift all limits.</p>
                            </div>
                        </div>

                        <GlassCard className="p-10 border-white/40 shadow-glass">
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-primary" /> Business Name
                                        </label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Extracted from document..."
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                className="h-12 rounded-xl bg-white/50 border-glass-border font-bold text-primary focus:ring-primary/20"
                                            />
                                            {businessName === "Glow Spa Lekki" && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-lg">
                                                    <Sparkles className="h-3 w-3" /> Maestro Extracted
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> CAC Registration Number
                                        </label>
                                        <div className="relative">
                                            <Input
                                                placeholder="RC-123456"
                                                value={cacNumber}
                                                onChange={(e) => setCacNumber(e.target.value)}
                                                required
                                                className="h-12 rounded-xl bg-white/50 border-glass-border font-bold text-primary focus:ring-primary/20"
                                            />
                                            {cacNumber === "RC-102938" && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-lg">
                                                    <Sparkles className="h-3 w-3" /> Maestro Extracted
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-primary" /> Certificate of Incorporation
                                        </label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-glass-border rounded-2xl p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer group relative overflow-hidden"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                            {status === "scanning" ? (
                                                <div className="py-4 space-y-4">
                                                    <ScanLine className="h-10 w-10 text-primary mx-auto animate-pulse" />
                                                    <p className="text-sm font-bold text-primary animate-pulse">Maestro Scanning Document...</p>
                                                    <motion.div
                                                        className="absolute left-0 right-0 h-1 bg-primary/40 z-10"
                                                        animate={{ top: ["0%", "100%", "0%"] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-foreground/20 mx-auto mb-4 group-hover:text-primary transition-colors" />
                                                    <p className="text-sm font-bold text-primary">Click to upload or drag and drop</p>
                                                    <p className="text-[10px] font-bold text-foreground/30 uppercase mt-1">PDF, JPG or PNG (Max 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                            <UserCheck className="h-3.5 w-3.5 text-primary" /> Director's ID (NIN/Passport)
                                        </label>
                                        <div className="border-2 border-dashed border-glass-border rounded-2xl p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer group">
                                            <Upload className="h-8 w-8 text-foreground/20 mx-auto mb-4 group-hover:text-primary transition-colors" />
                                            <p className="text-sm font-bold text-primary">Click to upload or drag and drop</p>
                                            <p className="text-[10px] font-bold text-foreground/30 uppercase mt-1">PDF, JPG or PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-primary/5">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !cacNumber || status === "scanning"}
                                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-lg shadow-xl shadow-primary/20"
                                    >
                                        {isSubmitting ? "Submitting Documents..." : "Submit for Verification"}
                                    </Button>
                                    <p className="text-center text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                                        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                                        Secure Document Processing
                                    </p>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                ) : null}

                {status === "pending" && (
                    <motion.div
                        key="pending"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-4">
                            <Info className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-bold text-primary">Verification in Progress</p>
                                <p className="text-sm font-medium text-primary/70">Our team is currently verifying your CAC documents. This usually takes 24-48 hours.</p>
                            </div>
                        </div>

                        <GlassCard className="p-12 text-center space-y-8 border-white/40">
                            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto relative">
                                <FileText className="h-10 w-10 text-primary" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-primary mb-2">Documents Received</h3>
                                <p className="text-foreground/60 font-medium max-w-md mx-auto">
                                    We've received your registration details for <span className="text-primary font-bold">{cacNumber}</span>. You'll receive an email once the process is complete.
                                </p>
                            </div>
                            <Button variant="outline" className="h-12 rounded-xl border-glass-border font-bold text-primary" onClick={() => setStatus("verified")}>
                                Simulate Approval (Demo Only)
                            </Button>
                        </GlassCard>
                    </motion.div>
                )}

                {status === "verified" && (
                    <motion.div
                        key="verified"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex items-center gap-4">
                            <CheckCircle2 className="h-6 w-6 text-accent" />
                            <div>
                                <p className="font-bold text-accent">Business Verified</p>
                                <p className="text-sm font-medium text-accent/70">Full marketplace access unlocked. You are now a trusted partner on The Guild.</p>
                            </div>
                        </div>

                        <GlassCard className="p-12 text-center space-y-8 border-white/40 bg-gradient-to-br from-accent/5 to-primary/5">
                            <div className="h-24 w-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="h-12 w-12 text-accent" />
                            </div>
                            <div>
                                <Badge className="bg-accent text-white border-0 px-4 py-1.5 font-bold mb-4">FULL ACCESS UNLOCKED</Badge>
                                <h3 className="text-3xl font-extrabold text-primary mb-2">Congratulations!</h3>
                                <p className="text-foreground/60 font-medium max-w-md mx-auto">
                                    Your business is now fully verified. You can now accept unlimited bookings and your profile will feature the "Verified" shield.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                {[
                                    { label: "Bookings", value: "Unlimited" },
                                    { label: "Trust Score", value: "High" },
                                    { label: "Visibility", value: "Priority" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/40 border border-white/60">
                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="font-extrabold text-primary">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                            <Button className="bg-primary text-white rounded-xl h-14 px-10 font-bold shadow-xl shadow-primary/20">
                                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
