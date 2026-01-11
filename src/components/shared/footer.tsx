"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Smartphone, Apple, Play, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Custom hook for PWA Install logic
function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback for already installed or not supported
            alert("You are using the web version. Add to Home Screen via your browser menu.");
        }
    };

    return { handleInstall, showIOSInstructions, setShowIOSInstructions };
}

export function Footer() {
    const { handleInstall, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();

    const navigation = {
        platform: [
            { name: "Explore Services", href: "/search" },
            { name: "Marketplace", href: "/marketplace" },
            { name: "How it Works", href: "/#how-it-works" },
            { name: "Safety", href: "/safety" },
        ],
        business: [
            { name: "Become a Vendor", href: "/register?role=business" },
            { name: "Business Dashboard", href: "/business" },
            { name: "Verification", href: "/business/profile" },
            { name: "Pricing", href: "/pricing" },
        ],
        legal: [
            { name: "Privacy Policy", href: "/legal/privacy" },
            { name: "Terms of Service", href: "/legal/terms" },
        ]
    };

    return (
        <footer className="py-24 px-6 border-t border-black/5 dark:border-white/5 bg-white dark:bg-slate-950 relative z-10">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
                <div className="space-y-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">The Guild</span>
                    </Link>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Nigeria's premier verified service marketplace. Building trust, one service at a time.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-widest text-xs">Platform</h4>
                    <ul className="space-y-4">
                        {navigation.platform.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors font-medium">
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-widest text-xs">For Business</h4>
                    <ul className="space-y-4">
                        {navigation.business.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors font-medium">
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-8">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-widest text-xs">Download App</h4>
                    <div className="space-y-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleInstall}
                            className="h-14 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center px-5 gap-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <Apple className="h-7 w-7 text-slate-900 dark:text-white group-hover:text-primary transition-colors" />
                            <div className="text-left">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Download on the</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">App Store</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleInstall}
                            className="h-14 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center px-5 gap-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <Play className="h-6 w-6 text-slate-900 dark:text-white group-hover:text-primary transition-colors fill-current" />
                            <div className="text-left">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Get it on</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Google Play</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 The Guild. All rights reserved.</p>
                <div className="flex gap-8">
                    {navigation.legal.map((item) => (
                        <Link key={item.name} href={item.href} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* iOS Instructions Modal */}
            <AnimatePresence>
                {showIOSInstructions && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-black/5 dark:border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60" />

                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>

                            <div className="space-y-6">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Smartphone className="h-8 w-8" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Install The Guild</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Follow these steps to add the app to your home screen:</p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white shrink-0">1</div>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium pt-1">
                                            Tap the <span className="font-bold text-primary">Share</span> icon in the bottom bar of Safari.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white shrink-0">2</div>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium pt-1">
                                            Scroll down and tap <span className="font-bold text-primary">Add to Home Screen</span>.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowIOSInstructions(false)}
                                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 mt-4"
                                >
                                    Got it
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </footer>
    );
}
