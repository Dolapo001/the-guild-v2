"use client";

import { Bell, Search, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { motion } from "framer-motion";

export function Topbar() {
    const { user } = useAuth();
    const isVerified = user?.verificationStatus === "verified";
    const [isSearching, setIsSearching] = useState(false);

    return (
        <header className="h-20 border-b border-glass-border bg-white/20 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
            <div className="flex-1 max-w-xl relative group">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-secondary' : 'text-foreground/30 group-focus-within:text-primary'}`} />
                <Input
                    placeholder="Ask for what you need (e.g., 'Cheap bridal makeup in Lekki')"
                    onFocus={() => setIsSearching(true)}
                    onBlur={() => setIsSearching(false)}
                    className={`pl-10 h-11 bg-white/40 border-glass-border rounded-xl transition-all ${isSearching ? 'ring-2 ring-secondary/20 border-secondary/50' : 'focus:ring-primary/10'}`}
                />
                {isSearching && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
                    >
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Intelligence
                        </span>
                        <Sparkles className="h-3 w-3 text-secondary animate-pulse" />
                    </motion.div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {isVerified && (
                    <div className="hidden md:flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-right-4">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Verified Business</span>
                    </div>
                )}
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-white/20">
                    <Bell className="h-5 w-5 text-foreground/60" />
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <div className="h-8 w-px bg-glass-border mx-2" />
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-primary leading-none mb-1">Glow Spa Lekki</p>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-accent uppercase tracking-wider">
                            <ShieldCheck className="h-3 w-3" />
                            Verified Business
                        </div>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=100&auto=format&fit=crop" alt="Glow Spa" />
                        <AvatarFallback className="bg-primary text-white text-xs">GS</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
