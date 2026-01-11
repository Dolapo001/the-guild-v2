"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Users,
    ChevronRight,
    ChevronLeft,
    Check,
    Building2,
    MapPin,
    ShieldCheck,
    Upload,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = [
    { id: 1, title: "Identity", icon: Building2 },
    { id: 2, title: "Operation", icon: Users },
    { id: 3, title: "Logistics", icon: MapPin },
    { id: 4, title: "Verification", icon: ShieldCheck },
];

export default function BusinessOnboarding() {
    const router = useRouter();
    const { updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: "",
        category: "Beauty",
        description: "",
        isSolo: true,
        address: "",
        city: "Lagos",
        isMobile: false,
        cacDocument: null as File | null,
    });

    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleFinish = () => {
        updateUser({
            isSoloOperator: formData.isSolo,
            verificationStatus: "verified", // Set to verified for demo purposes
        });
        router.push("/business");
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {STEPS.map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2",
                                step >= s.id
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 border-white/10 text-white/20"
                            )}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                step >= s.id ? "text-primary" : "text-white/20"
                            )}>{s.title}</span>
                        </div>
                    ))}
                    {/* Connecting Lines */}
                    <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-10 px-12">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((step - 1) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <GlassCard className="p-8 md:p-12 border-white/10 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white mb-2">Tell us about your craft.</h2>
                                    <p className="text-white/40 font-medium">Let's start with the basics of your business.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">Business Name</label>
                                        <Input
                                            placeholder="e.g. Glow Spa"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">Category</label>
                                        <select
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Beauty">Beauty & Wellness</option>
                                            <option value="Logistics">Logistics & Delivery</option>
                                            <option value="Cleaning">Cleaning Services</option>
                                            <option value="Repairs">Home Repairs</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">Description</label>
                                        <textarea
                                            placeholder="Tell us what makes your service special..."
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white mb-2">How do you operate?</h2>
                                    <p className="text-white/40 font-medium">This helps us customize your dashboard experience.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        onClick={() => setFormData({ ...formData, isSolo: true })}
                                        className={cn(
                                            "relative p-8 rounded-3xl border-2 transition-all cursor-pointer group",
                                            formData.isSolo
                                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                                : "bg-white/5 border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {formData.isSolo && (
                                            <div className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                                            formData.isSolo ? "bg-primary text-white" : "bg-white/10 text-white/40"
                                        )}>
                                            <User className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Solo Professional</h3>
                                        <p className="text-sm text-white/40 leading-relaxed font-medium">
                                            I work alone. I manage my own bookings and perform the services myself.
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => setFormData({ ...formData, isSolo: false })}
                                        className={cn(
                                            "relative p-8 rounded-3xl border-2 transition-all cursor-pointer group",
                                            !formData.isSolo
                                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                                : "bg-white/5 border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {!formData.isSolo && (
                                            <div className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                                            !formData.isSolo ? "bg-primary text-white" : "bg-white/10 text-white/40"
                                        )}>
                                            <Users className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Team / Agency</h3>
                                        <p className="text-sm text-white/40 leading-relaxed font-medium">
                                            I manage a team. I have staff members or riders who fulfill orders.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white mb-2">Location & Logistics</h2>
                                    <p className="text-white/40 font-medium">Where can customers find you?</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">Business Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                                            <Input
                                                placeholder="Enter your physical location"
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 font-bold"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">City</label>
                                        <select
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        >
                                            <option value="Lagos">Lagos</option>
                                            <option value="Abuja">Abuja</option>
                                            <option value="Port Harcourt">Port Harcourt</option>
                                            <option value="Ibadan">Ibadan</option>
                                        </select>
                                    </div>

                                    <div
                                        onClick={() => setFormData({ ...formData, isMobile: !formData.isMobile })}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                            formData.isMobile ? "bg-secondary/10 border-secondary" : "bg-white/5 border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center",
                                                formData.isMobile ? "bg-secondary text-white" : "bg-white/10 text-white/40"
                                            )}>
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">I offer mobile services</h4>
                                                <p className="text-xs text-white/40 font-medium">I can travel to the customer's location.</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            formData.isMobile ? "bg-secondary border-secondary" : "border-white/10"
                                        )}>
                                            {formData.isMobile && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white mb-2">Let's get you verified.</h2>
                                    <p className="text-white/40 font-medium">Verified businesses earn 3x more and build trust faster.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                                        <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                            <Upload className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Upload CAC Document</h4>
                                            <p className="text-sm text-white/40 font-medium">PDF, JPG or PNG (Max 5MB)</p>
                                        </div>
                                        <Button variant="outline" className="mt-2 border-white/10 font-bold">Select File</Button>
                                    </div>

                                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                                        <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                                        <p className="text-xs text-white/60 leading-relaxed font-medium">
                                            Your data is encrypted and used only for verification purposes. Verification usually takes 24-48 hours.
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            onClick={handleFinish}
                                            className="text-sm font-bold text-white/40 hover:text-white transition-colors underline underline-offset-4"
                                        >
                                            Skip for now, I'll do it later
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center gap-4 mt-12 pt-8 border-t border-white/5">
                        {step > 1 && (
                            <Button
                                onClick={prevStep}
                                variant="ghost"
                                className="h-14 px-8 rounded-2xl font-bold text-white/60 hover:text-white hover:bg-white/5"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Back
                            </Button>
                        )}
                        <Button
                            onClick={step === 4 ? handleFinish : nextStep}
                            className="flex-1 h-14 rounded-2xl bg-primary text-white font-extrabold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                            {step === 4 ? "Complete Setup" : "Continue"} <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
