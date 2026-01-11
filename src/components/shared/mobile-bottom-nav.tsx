"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Calendar,
    PlayCircle,
    Wallet,
    Menu,
    ShoppingBag,
    LayoutDashboard,
    UserCircle,
    Settings,
    RefreshCw,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const role = user?.role || "customer";

    const getHomeHref = () => {
        if (role === "ceo") return "/business";
        if (role === "staff") return "/staff-portal";
        return "/customer";
    };

    const navItems = [
        {
            label: "Home",
            icon: role === "customer" ? Home : LayoutDashboard,
            href: getHomeHref()
        },
        {
            label: "Schedule",
            icon: Calendar,
            href: "/bookings"
        },
        {
            label: role === "staff" ? "Active" : "Market",
            icon: role === "staff" ? PlayCircle : ShoppingBag,
            href: role === "staff" ? "/active-job" : "/marketplace",
            isFloating: true
        },
        {
            label: "Wallet",
            icon: Wallet,
            href: "/wallet"
        },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-white/10 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    if (item.isFloating) {
                        return (
                            <Link key={item.label} href={item.href} className="relative -top-4">
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all",
                                        isActive
                                            ? "bg-primary text-white ring-4 ring-primary/20"
                                            : "bg-primary/80 text-white/80"
                                    )}
                                >
                                    <item.icon className="h-7 w-7" />
                                </motion.div>
                                <span className={cn(
                                    "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest",
                                    isActive ? "text-primary text-glow" : "text-white/40"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 w-16"
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-all",
                                isActive ? "text-primary scale-110" : "text-white/40"
                            )} />
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest transition-all",
                                isActive ? "text-primary text-glow" : "text-white/40"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Menu Drawer */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center justify-center gap-1 w-16">
                            <Menu className="h-5 w-5 text-white/40" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[70vh] rounded-t-[32px] bg-slate-950 border-white/10 p-0 overflow-hidden">
                        <div className="h-1.5 w-12 bg-white/20 rounded-full mx-auto mt-4 mb-8" />
                        <SheetHeader className="px-6 text-left">
                            <SheetTitle className="text-2xl font-extrabold text-white tracking-tight">Account & Settings</SheetTitle>
                        </SheetHeader>

                        <div className="px-4 py-8 space-y-2">
                            <Link href="/profile" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <UserCircle className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">Profile Settings</p>
                                    <p className="text-xs text-white/40">Manage your personal information</p>
                                </div>
                            </Link>

                            <Link href="/settings" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">App Settings</p>
                                    <p className="text-xs text-white/40">Notifications, theme, and security</p>
                                </div>
                            </Link>

                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                    <RefreshCw className="h-6 w-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white">Switch Role</p>
                                    <p className="text-xs text-white/40">Switch between Customer and Pro</p>
                                </div>
                            </button>

                            <div className="pt-8">
                                <Button
                                    onClick={logout}
                                    variant="destructive"
                                    className="w-full h-14 rounded-2xl font-bold text-lg"
                                >
                                    <LogOut className="mr-2 h-5 w-5" /> Sign Out
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
