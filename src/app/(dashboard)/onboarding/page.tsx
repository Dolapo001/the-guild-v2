"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Building2,
    MapPin,
    LayoutGrid,
    ShieldCheck,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Upload,
    Lock,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
    { id: "profile", title: "Business Profile", icon: Building2 },
    { id: "location", title: "Location", icon: MapPin },
    { id: "categories", title: "Categories", icon: LayoutGrid },
    { id: "verification", title: "Verification", icon: ShieldCheck },
    { id: "review", title: "Review", icon: FileText },
];

const CAC_REGEX = /^RC-\d{5,7}$/;

export default function OnboardingPage() {
    const { setVerificationStatus } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        category: "",
        cacNumber: "",
    });

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setVerificationStatus("pending");
        router.push("/home");
    };

    const isStepValid = () => {
        if (currentStep === 0) return formData.name && formData.description;
        if (currentStep === 1) return formData.address;
        if (currentStep === 2) return formData.category;
        if (currentStep === 3) return CAC_REGEX.test(formData.cacNumber);
        return true;
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12">
            <GlassCard className="w-full max-w-4xl p-0 overflow-hidden border-white/40 shadow-2xl">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Sidebar Progress */}
                    <div className="w-full md:w-72 bg-primary/5 border-r border-glass-border p-8 space-y-8">
                        <div>
                            <h2 className="text-xl font-extrabold text-primary">Onboarding</h2>
                            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Complete your setup</p>
                        </div>
                        <div className="space-y-6">
                            {STEPS.map((step, i) => (
                                <div key={step.id} className="flex items-center gap-4">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-foreground/30 border border-glass-border'
                                        }`}>
                                        {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                    </div>
                                    <span className={`text-sm font-bold ${i <= currentStep ? 'text-primary' : 'text-foreground/30'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1"
                            >
                                <div className="mb-10">
                                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                        {(() => {
                                            const Icon = STEPS[currentStep].icon;
                                            return <Icon className="h-6 w-6 text-primary" />;
                                        })()}
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-primary">{STEPS[currentStep].title}</h3>
                                    <p className="text-foreground/50 font-medium">Please provide the details below to proceed.</p>
                                </div>

                                <div className="space-y-6">
                                    {currentStep === 0 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Business Name</label>
                                                <Input
                                                    placeholder="e.g. Glow Spa Lekki"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="h-12 rounded-xl bg-white/50 border-glass-border"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Description</label>
                                                <textarea
                                                    placeholder="Tell us about your services..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full min-h-[120px] rounded-2xl border border-glass-border bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Business Address</label>
                                                <Input
                                                    placeholder="12 Adeola Odeku St, VI, Lagos"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="h-12 rounded-xl bg-white/50 border-glass-border"
                                                />
                                            </div>
                                            <div className="aspect-video rounded-2xl bg-primary/5 border border-glass-border flex flex-col items-center justify-center text-center p-8">
                                                <MapPin className="h-10 w-10 text-primary/20 mb-4" />
                                                <p className="text-sm font-bold text-primary">Interactive Map Placeholder</p>
                                                <p className="text-xs font-medium text-foreground/40">In a production app, you would pin your exact location here.</p>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {["Beauty", "Cleaning", "Catering", "Events"].map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                    className={`p-6 rounded-2xl border transition-all text-left ${formData.category === cat
                                                            ? 'bg-primary/5 border-primary shadow-sm'
                                                            : 'bg-white/40 border-glass-border hover:border-primary/30'
                                                        }`}
                                                >
                                                    <p className="font-bold text-primary">{cat}</p>
                                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Professional Services</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-8">
                                            <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 flex items-center gap-3">
                                                <Lock className="h-5 w-5 text-accent" />
                                                <p className="text-xs font-bold text-accent">Your data is encrypted and handled securely.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">CAC Registration Number</label>
                                                <Input
                                                    placeholder="RC-123456"
                                                    value={formData.cacNumber}
                                                    onChange={(e) => setFormData({ ...formData, cacNumber: e.target.value })}
                                                    className="h-12 rounded-xl bg-white/50 border-glass-border"
                                                />
                                                {!CAC_REGEX.test(formData.cacNumber) && formData.cacNumber && (
                                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Invalid format. Use RC-XXXXXX</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="border-2 border-dashed border-glass-border rounded-2xl p-6 text-center hover:bg-primary/5 transition-colors cursor-pointer group">
                                                    <Upload className="h-6 w-6 text-foreground/20 mx-auto mb-2 group-hover:text-primary transition-colors" />
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">CAC Certificate</p>
                                                </div>
                                                <div className="border-2 border-dashed border-glass-border rounded-2xl p-6 text-center hover:bg-primary/5 transition-colors cursor-pointer group">
                                                    <Upload className="h-6 w-6 text-foreground/20 mx-auto mb-2 group-hover:text-primary transition-colors" />
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Owner ID</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 4 && (
                                        <div className="space-y-6">
                                            <GlassCard className="p-6 border-primary/10 bg-primary/[0.02] space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Business Name</p>
                                                        <p className="font-bold text-primary">{formData.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Category</p>
                                                        <p className="font-bold text-primary">{formData.category}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Address</p>
                                                    <p className="font-bold text-primary">{formData.address}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">CAC Number</p>
                                                    <p className="font-bold text-primary">{formData.cacNumber}</p>
                                                </div>
                                            </GlassCard>
                                            <p className="text-xs font-medium text-foreground/40 text-center">By submitting, you agree to our Terms of Service and Privacy Policy.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 pt-8 border-t border-glass-border flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="h-12 rounded-xl font-bold text-primary"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={!isStepValid()}
                                className="h-12 rounded-xl bg-primary text-white px-8 font-bold shadow-lg shadow-primary/20"
                            >
                                {currentStep === STEPS.length - 1 ? "Submit for Approval" : "Continue"} <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
