"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    ShieldCheck,
    Sparkles,
    ArrowRight,
    Smartphone,
    Lock,
    CheckCircle,
    Wallet,
    Users,
    Menu,
    Star,
    History,
    PlayCircle,
    MessageSquare,
    Heart,
    UserCircle,
    ChevronRight,
    Clock,
    Info,
    AlertCircle,
    X,
    LayoutDashboard,
    Package,
    Settings,
    Briefcase,
    ShieldAlert,
    CheckCircle2,
    Search,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Footer } from "@/components/shared/footer";
import { PWARedirect } from "@/components/shared/pwa-redirect";
import { cn } from "@/lib/utils";

// --- Components ---

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4",
                isScrolled
                    ? "bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-10 w-10 rounded-xl bg-primary overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">The Guild</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {["Features", "For Business", "Marketplace"].map((item) => (
                        <Link
                            key={item}
                            href={item === "For Business" ? "/register?role=ceo" : `/${item.toLowerCase().replace(' ', '-')}`}
                            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/register" className="hidden md:block">
                        <Button className="bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-full px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            Get Started
                        </Button>
                    </Link>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-slate-900 dark:text-white">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-white dark:bg-slate-950 border-black/5 dark:border-white/10">
                            <div className="flex flex-col gap-8 mt-12">
                                <div className="flex flex-col gap-6">
                                    {["Features", "For Business", "Marketplace"].map((item) => (
                                        <Link
                                            key={item}
                                            href={item === "For Business" ? "/register?role=ceo" : `/${item.toLowerCase().replace(' ', '-')}`}
                                            className="text-xl font-bold text-slate-900 dark:text-white"
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                                <div className="pt-8 border-t border-black/5 dark:border-white/10 space-y-4">
                                    <Button variant="ghost" className="w-full justify-start font-bold text-slate-900 dark:text-white text-lg px-0">Login</Button>
                                    <Link href="/register" className="block">
                                        <Button className="w-full bg-primary text-white font-bold h-14 rounded-2xl">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.nav>
    );
};

const PhoneHero = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-[320px] h-[640px] mx-auto">
            {/* Phone Frame */}
            <div className="absolute inset-0 bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden z-10">
                {/* Screen Content */}
                <div className="relative h-full w-full bg-[#020617] p-6 pt-12">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-4 w-12 bg-white/10 rounded-full" />
                        <div className="flex gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-white/20" />
                            <div className="h-2 w-2 rounded-full bg-white/20" />
                            <div className="h-2 w-4 rounded-full bg-emerald-500" />
                        </div>
                    </div>

                    {/* App Interface */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-white/10 rounded-full" />
                            <div className="h-8 w-48 bg-white/20 rounded-full" />
                        </div>

                        {/* Search Bar Animation */}
                        <motion.div
                            animate={{ scale: step === 0 ? 1.05 : 1 }}
                            className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 gap-3"
                        >
                            <Search className="h-4 w-4 text-slate-500" />
                            <div className="h-3 w-32 bg-white/10 rounded-full" />
                        </motion.div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: step >= 1 ? 1 : 0.3 }}
                                    className="h-24 bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-white/10" />
                                    <div className="h-2 w-12 bg-white/10 rounded-full" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Result Card Animation */}
                        <AnimatePresence mode="wait">
                            {step >= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <GlassCard className="p-4 border-white/10 bg-white/5 backdrop-blur-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                                                <img src="/images/landing/avatar_1.png" alt="Sarah" className="object-cover h-full w-full" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-bold text-white">Sarah Johnson</p>
                                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium">Deep Tissue Specialist</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-white">₦15,000</p>
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                                    <span className="text-[10px] text-slate-400 font-bold">4.9</span>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {step === 3 && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-widest">Booking Confirmed</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* UI Placeholders */}
                        <div className="space-y-4 pt-4 opacity-20">
                            <div className="h-2 w-2/3 bg-white rounded-full" />
                            <div className="h-2 w-full bg-white rounded-full" />
                            <div className="h-2 w-1/2 bg-white rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Confetti Effect (Behind Phone) */}
            <AnimatePresence>
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-20 pointer-events-none z-[-1]"
                    >
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: 0,
                                    y: 0,
                                    scale: 0,
                                    rotate: 0
                                }}
                                animate={{
                                    x: (Math.random() - 0.5) * 400,
                                    y: (Math.random() - 0.5) * 400,
                                    scale: Math.random() * 1.5,
                                    rotate: Math.random() * 360
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "absolute top-1/2 left-1/2 h-2 w-2 rounded-sm",
                                    ["bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-blue-500"][i % 4]
                                )}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const HowItWorksCarousel = () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        {
            title: "Book Instantly",
            desc: "Choose a verified pro or product from our curated marketplace.",
            icon: Smartphone,
            color: "text-primary",
            bg: "bg-primary/10",
            glow: "shadow-primary/20",
            accent: "from-primary to-primary/80"
        },
        {
            title: "Escrow Protection",
            desc: "Funds held safely in escrow until the job is completed to your satisfaction.",
            icon: Lock,
            color: "text-secondary",
            bg: "bg-secondary/10",
            glow: "shadow-secondary/20",
            accent: "from-secondary to-secondary/80"
        },
        {
            title: "Service Completed",
            desc: "Pro finishes the work, and you confirm your happiness with the result.",
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            glow: "shadow-emerald-500/20",
            accent: "from-emerald-500 to-teal-600"
        },
        {
            title: "Pro Paid",
            desc: "Funds are released instantly to the pro's wallet. Everyone wins.",
            icon: Wallet,
            color: "text-blue-600",
            bg: "bg-blue-600/10",
            glow: "shadow-blue-600/20",
            accent: "from-blue-600 to-cyan-600"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const step = steps[activeStep];

    return (
        <div className="max-w-5xl mx-auto px-6">
            <GlassCard className="p-10 md:p-16 border-white/10 dark:border-white/5 relative overflow-hidden shadow-2xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-[40px]">
                {/* Background Glow */}
                <div className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full transition-all duration-1000 opacity-20",
                    step.bg.replace('/10', '/40')
                )} />

                <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="flex justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0.8, opacity: 0, rotate: 15 }}
                                className={cn(
                                    "h-40 w-40 md:h-64 md:w-64 rounded-[3rem] flex items-center justify-center shadow-2xl transition-all duration-700 relative group",
                                    step.bg, step.glow
                                )}
                            >
                                <div className={cn("absolute inset-0 rounded-[3rem] bg-gradient-to-br opacity-20 group-hover:opacity-40 transition-opacity", step.accent)} />
                                <step.icon className={cn("h-20 w-20 md:h-32 md:w-32 relative z-10", step.color)} />

                                {/* Floating Particles */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-4 -right-4 h-12 w-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center"
                                >
                                    <Sparkles className={cn("h-6 w-6", step.color)} />
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -30, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <p className={cn("text-sm font-extrabold uppercase tracking-[0.3em]", step.color)}>Step 0{activeStep + 1}</p>
                                    <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">{step.title}</h3>
                                </div>
                                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Bar */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden cursor-pointer"
                                        onClick={() => setActiveStep(i)}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: activeStep === i ? "100%" : activeStep > i ? "100%" : "0%" }}
                                            transition={{ duration: activeStep === i ? 4 : 0.5, ease: "linear" }}
                                            className={cn("h-full bg-gradient-to-r", steps[i].accent)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">The Guild Workflow</p>
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest">0{activeStep + 1} / 04</p>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

const MaestroShowcase = () => {
    return (
        <section className="py-48 px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 blur-[160px] rounded-full -z-10" />

            <div className="max-w-5xl mx-auto text-center space-y-20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative inline-block"
                >
                    {/* Pulsing Orb with multiple layers */}
                    <div className="absolute inset-0 bg-secondary/30 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-secondary/20 blur-[80px] rounded-full animate-ping" />

                    <div className="relative h-40 w-40 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-secondary/80 via-secondary to-secondary/60 flex items-center justify-center shadow-[0_0_80px_rgba(255,183,77,0.4)] border-4 border-white/20">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="relative z-10"
                        >
                            <Sparkles className="h-20 w-20 md:h-32 md:w-32 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                        </motion.div>

                        {/* Orbiting Particles */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <div
                                    className="h-3 w-3 rounded-full bg-white shadow-[0_0_10px_white] absolute top-0 left-1/2 -translate-x-1/2"
                                    style={{ opacity: 0.3 + (i * 0.1) }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary dark:text-secondary text-xs font-extrabold uppercase tracking-[0.3em]"
                    >
                        <Zap className="h-4 w-4 fill-current" />
                        Maestro Intelligence
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Smart Matching. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary/80 via-secondary to-secondary/60 text-glow-amber">Zero Guesswork.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
                        Maestro AI analyzes thousands of data points—from location and availability to verified skill scores—to find your perfect match in seconds.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 pt-12">
                        {[
                            { label: "Real-time Capacity Verification", icon: CheckCircle2 },
                            { label: "Location-Optimized Matching", icon: CheckCircle2 },
                            { label: "Quality-First Selection Logic", icon: CheckCircle2 }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                <item.icon className="h-6 w-6 text-emerald-500" />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState<"customers" | "solo" | "teams">("customers");

    const tabContent = {
        customers: {
            title: "For Customers",
            subtitle: "The safest way to hire.",
            desc: "Access a curated guild of verified professionals. From home services to high-end consulting, every transaction is protected by our secure escrow system.",
            features: ["CAC Verified Pros", "Secure Escrow Payments", "AI-Powered Matching"],
            image: "/images/landing/customers.png"
        },
        solo: {
            title: "For Solo Pros",
            subtitle: "Your business, amplified.",
            desc: "Focus on your craft while we handle the rest. Get instant payouts, manage your schedule with an active job timer, and build a verified reputation.",
            features: ["Instant Payouts", "Active Job Timer", "Verified Badge"],
            image: "/images/landing/solo.png"
        },
        teams: {
            title: "For Teams & Agencies",
            subtitle: "Scale with precision.",
            desc: "Manage your entire workforce from one dashboard. Track staff performance, automate payroll, and handle complex logistics with ease.",
            features: ["Staff Management", "Automated Payroll", "Logistics Tracking"],
            image: "/images/landing/teams.png"
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-700 overflow-x-hidden">
            <PWARedirect />
            <AmbientBackground />
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 lg:pt-48 pb-24 px-6">
                    {/* Floating Decorative Elements */}
                    <div className="absolute top-1/4 left-10 w-12 h-12 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-3xl animate-bounce -z-10" />
                    <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-secondary/10 rounded-full border border-secondary/20 backdrop-blur-3xl animate-pulse -z-10" />

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-primary/80 text-xs font-extrabold uppercase tracking-[0.2em] shadow-premium-violet"
                            >
                                <Sparkles className="h-4 w-4 animate-pulse" />
                                Nigeria's Premium Verified Marketplace
                            </motion.div>

                            <div className="space-y-6">
                                <h1 className="text-6xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                                    <span className="block">Verified</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-glow">Excellence.</span>
                                    <span className="block text-slate-400 dark:text-slate-500">Delivered.</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                                    The safest way to book top-tier artisans and buy premium products in Nigeria. <span className="text-secondary font-bold">Powered by Maestro AI.</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <Link href="/search">
                                    <Button className="h-16 px-12 bg-primary text-white text-xl font-bold rounded-full shadow-[0_20px_40px_-10px_rgba(26,35,126,0.5)] hover:scale-105 transition-all group">
                                        Find a Pro <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/register?role=ceo">
                                    <Button variant="outline" className="h-16 px-10 border-black/10 dark:border-white/10 bg-white/5 dark:bg-white/5 text-lg font-bold rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-900 dark:text-white backdrop-blur-xl">
                                        Become a Vendor
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 pt-8">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-14 w-14 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-xl">
                                            <img src={`/images/landing/avatar_${i}.png`} alt="User" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3 w-3 text-secondary fill-secondary" />)}
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Trusted by 12,000+ Nigerians</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Maestro AI Floating Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-12 -left-12 z-20 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-secondary/30 shadow-[0_0_30px_rgba(255,183,77,0.2)] hidden lg:flex items-center gap-3"
                            >
                                <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">Maestro AI</p>
                                    <p className="text-xs font-bold text-white">Smart Match Active</p>
                                </div>
                            </motion.div>

                            <PhoneHero />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-32 bg-white/30 dark:bg-slate-900/30 border-y border-black/5 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-6 space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">The Living Story</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Experience a seamless journey from booking to payout.</p>
                        </div>
                        <HowItWorksCarousel />
                    </div>
                </section>

                {/* Choose Your Path Section */}
                <section className="py-32 px-6">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Choose Your Path</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Tailored experiences for every role in the ecosystem.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {(["customers", "solo", "teams"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-8 py-4 rounded-2xl text-sm font-extrabold uppercase tracking-widest transition-all",
                                        activeTab === tab
                                            ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {tabContent[tab].title}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid lg:grid-cols-2 gap-12 items-center"
                            >
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-primary font-extrabold uppercase tracking-[0.3em] text-xs">{tabContent[activeTab].subtitle}</p>
                                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{tabContent[activeTab].title}</h3>
                                        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {tabContent[activeTab].desc}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {tabContent[activeTab].features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:scale-105 transition-transform">
                                        Get Started as {tabContent[activeTab].title.split(' ')[1]}
                                    </Button>
                                </div>

                                <div className="relative aspect-video rounded-[40px] overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl">
                                    <img src={tabContent[activeTab].image} alt={activeTab} className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                <MaestroShowcase />

                {/* Final CTA */}
                <section className="py-48 px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">Ready to experience the gold standard?</h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">Join the guild of excellence today. Whether you're booking or building, we've got you covered.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href="/register">
                                <Button className="h-16 px-12 bg-primary text-white text-xl font-bold rounded-full shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                                    Join The Guild Now
                                </Button>
                            </Link>
                            <Link href="/marketplace">
                                <Button variant="outline" className="h-14 px-10 border-black/10 dark:border-white/10 bg-white/5 text-lg font-bold rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                                    Browse Marketplace
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
