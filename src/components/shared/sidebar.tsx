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
    ShieldAlert,
    UserCircle,
    Star,
    ShoppingBag,
    History,
    PlayCircle,
    MessageSquare,
    CalendarClock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const userRole = user?.role || "ceo";
    const isSolo = user?.isSoloOperator ?? true;

    const roleLinks = {
        ceo: [
            { title: "Overview", href: "/business", icon: LayoutDashboard },
            { title: "Bookings", href: "/bookings", icon: Calendar },
            ...(isSolo
                ? [{ title: "My Availability", href: "/business/profile", icon: CalendarClock }]
                : [{ title: "Staff Management", href: "/staff", icon: Users }]
            ),
            ...(!isSolo ? [
                { title: "Wallet & Payroll", href: "/wallet", icon: Wallet },
            ] : []),
            { title: "Inventory", href: "/inventory", icon: Package },
            { title: "Orders", href: "/business/orders", icon: ShoppingBag },
            { title: "Reviews", href: "/reviews", icon: Star },
            { title: "Inbox", href: "/inbox", icon: MessageSquare },
            { title: "Active Session", href: "/active-job", icon: Clock },
            { title: "Business Profile", href: "/business/profile", icon: Settings },
        ],
        customer: [
            { title: "Explore Services", href: "/search", icon: Search },
            { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
            { title: "My Bookings", href: "/customer", icon: Calendar },
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
            { title: "Verification Queue", href: "/admin/verification", icon: ShieldAlert },
            { title: "User Management", href: "/admin/users", icon: Users },
            { title: "Disputes", href: "/admin/disputes", icon: ShieldCheck },
        ],
    };

    const sidebarItems = roleLinks[userRole as keyof typeof roleLinks] || roleLinks.ceo;

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-[--border] bg-glass-surface dark:bg-[#0f111a] backdrop-blur-xl lg:flex fixed left-0 top-0 z-40 shadow-glass">
            <div className="flex h-16 items-center px-5 border-b border-[--border]">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-8 w-8 bg-primary rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-150 shadow-md">
                        <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-foreground">The Guild</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
                <nav className="grid gap-1 px-3">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold"
                                        : "text-foreground/65 hover:bg-primary/8 hover:text-primary"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-4.5 w-4.5 shrink-0 transition-colors",
                                    isActive ? "text-secondary" : "text-foreground/45",
                                    item.title === "Active Session" && "animate-pulse text-primary"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 mt-auto border-t border-[--border]">
                {userRole === "ceo" && (
                    <div className="bg-accent/5 border border-accent/15 rounded-xl p-3.5 mb-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wide mb-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified SME
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">
                            CAC verified &amp; eligible for escrow payments.
                        </p>
                    </div>
                )}
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-500/8 group">
                    <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
