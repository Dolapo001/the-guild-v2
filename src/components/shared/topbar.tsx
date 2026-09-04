"use client";

import { Bell, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useState } from "react";
import { motion } from "framer-motion";

export function Topbar() {
 const { user } = useAuth();
 const isVerified = user?.verificationStatus === "verified";
 const [isSearching, setIsSearching] = useState(false);

 return (
 <header className="h-20 border-b border-white/5 bg-[#08090e] sticky top-0 z-30 px-6 flex items-center justify-between">
 <div className="flex-1 max-w-xl relative group">
 <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-amber-400' : 'text-slate-500 group-focus-within:text-indigo-400'}`} />
 <Input
 placeholder="Ask for what you need (e.g., 'Cheap bridal makeup in Lekki')"
 onFocus={() => setIsSearching(true)}
 onBlur={() => setIsSearching(false)}
 className={`pl-10 h-11 rounded-xl transition-all ${isSearching ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}
 />
 {isSearching && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
 >
 <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
 Maestro Intelligence
 </span>
 <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
 </motion.div>
 )}
 </div>

 <div className="flex items-center gap-6">
 {isVerified && (
 <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20">
 <ShieldCheck className="h-4 w-4" />
 <span className="text-xs font-bold uppercase tracking-wider">Verified Business</span>
 </div>
 )}

 <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-white/5">
 <Bell className="h-5 w-5 text-slate-400" />
 <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-[#08090e]" />
 <span className="sr-only">Notifications</span>
 </Button>
 <div className="h-8 w-px bg-white/5 mx-2" />
 <div className="flex items-center gap-3">
 <div className="text-right hidden sm:block">
 <p className="text-sm font-bold text-slate-200 leading-none mb-1">{user?.profile?.business?.name || user?.name || user?.username}</p>
 <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
 <ShieldCheck className="h-3 w-3" />
 Verified Business
 </div>
 </div>
 <Avatar className="h-10 w-10 border-2 border-white/10 shadow-sm">
 <AvatarImage src={user?.profile?.business?.imageUrl || user?.avatar} alt={user?.profile?.business?.name} />
 <AvatarFallback className="bg-indigo-500 text-white text-xs">{(user?.profile?.business?.name || user?.username || "GS").substring(0, 2).toUpperCase()}</AvatarFallback>
 </Avatar>
 </div>
 </div>
 </header>
 );
}