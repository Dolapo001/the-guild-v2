"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Package,
    Wallet,
    Settings,
    LogOut,
    ShieldCheck,
    Search,
    Heart,
    Clock,
    Briefcase,
    UserCircle,
    Star,
    ShoppingBag,
    History,
    PlayCircle,
    MessageSquare,
    CalendarClock,
    AlertTriangle,
    Building2,
    BarChart3,
    ScrollText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SidebarContent({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const userRole = user?.role || "ceo";
    const isSolo = user?.isSoloOperator ?? true;

    const roleLinks = {
        ceo: [
            { title: "Overview", href: "/home", icon: LayoutDashboard },
            { title: "Bookings", href: "/bookings", icon: Calendar },
            ...(isSolo
                ? [{ title: "Wallet", href: "/wallet", icon: Wallet }]
                : [{ title: "Staff Management", href: "/staff", icon: Users }]
            ),
            ...(!isSolo ? [
                { title: "Wallet & Payroll", href: "/wallet", icon: Wallet },
            ] : []),
            { title: "Inventory", href: "/inventory", icon: Package },
            { title: "Orders", href: "/home/orders", icon: ShoppingBag },
            { title: "Reviews", href: "/reviews", icon: Star },
            { title: "Inbox", href: "/inbox", icon: MessageSquare },
            { title: "Active Session", href: "/active-job", icon: Clock },
            { title: "Business Profile", href: "/profile", icon: Settings },
        ],
        customer: [
            { title: "My Bookings", href: "/customer", icon: Calendar },
            { title: "Explore Services", href: "/search", icon: Search },
            { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
            { title: "Favorites", href: "/favorites", icon: Heart },
            { title: "Recent Activities", href: "/customer/activities", icon: History },
            { title: "Wallet", href: "/wallet", icon: Wallet },
            { title: "Inbox", href: "/inbox", icon: MessageSquare },
            { title: "Profile", href: "/profile", icon: UserCircle },
        ],
        staff: [
            { title: "Dashboard", href: "/staff-portal", icon: LayoutDashboard },
            { title: "Active Session", href: "/active-job", icon: PlayCircle },
            { title: "Job History", href: "/job-history", icon: History },
            { title: "Wallet", href: "/wallet", icon: Wallet },
            { title: "Inbox", href: "/inbox", icon: MessageSquare },
            { title: "Profile", href: "/profile", icon: UserCircle },
        ],
        admin: [
            { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { title: "Business Verification", href: "/admin/businesses", icon: Building2 },
            { title: "Reviews", href: "/admin/reviews", icon: Star },
            { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
            { title: "Audit Trail", href: "/admin/audit", icon: ScrollText },
        ],
    };

    const sidebarItems = roleLinks[userRole as keyof typeof roleLinks] || roleLinks.ceo;

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="flex h-20 items-center px-6">
                <Link href="/" className="flex items-center gap-2.5 group" onClick={onItemClick}>
                    <div className="h-9 w-9 bg-indigo-500 rounded-lg overflow-hidden group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                        <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-100">The Guild</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="grid gap-1 px-3">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={onItemClick}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 rounded-l-none pl-[10px]"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-4.5 w-4.5 transition-colors",
                                    isActive ? "text-indigo-400" : "text-slate-500",
                                    item.title === "Active Session" && "animate-pulse"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 mt-auto">
                {userRole === "ceo" && (
                    <div className={cn(
                        "rounded-xl p-4 mb-4 border transition-all",
                        user?.verificationStatus === 'verified'
                            ? "bg-emerald-500/5 border-emerald-500/10"
                            : "bg-amber-500/5 border-amber-500/10"
                    )}>
                        {user?.verificationStatus === 'verified' ? (
                            <>
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Verified SME
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight font-medium">
                                    Your business is CAC verified and eligible for escrow payments.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Unverified SME
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight font-medium mb-3">
                                    Complete verification to unlock escrow payments and high-tier visibility.
                                </p>
                                <Link
                                    href="/verification"
                                    onClick={onItemClick}
                                    className="block text-center text-[10px] font-black text-amber-400 border border-amber-500/20 rounded-lg py-1.5 hover:bg-amber-500 hover:text-black transition-all uppercase tracking-tighter"
                                >
                                    Verify Now
                                </Link>
                            </>
                        )}
                    </div>
                )}
                <button
                  onClick={() => {
                    logout();
                    onItemClick?.();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-400 transition-all hover:bg-red-500/5 hover:text-red-400 group"
                >
                    <LogOut className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-white/5 bg-[#0c0d12] lg:flex fixed left-0 top-0 z-40">
            <SidebarContent />
        </aside>
    );
}