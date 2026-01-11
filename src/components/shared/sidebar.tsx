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
        <aside className="hidden h-screen w-64 flex-col border-r border-glass-border bg-glass-surface dark:bg-[#0f111a] backdrop-blur-xl lg:flex fixed left-0 top-0 z-40 shadow-premium">
            <div className="flex h-20 items-center px-6">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-9 w-9 bg-primary rounded-lg overflow-hidden group-hover:scale-110 transition-transform shadow-lg">
                        <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">The Guild</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="grid gap-1.5 px-3">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-foreground/50 hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-secondary" : "text-foreground/30",
                                    item.title === "Active Session" && "animate-pulse text-primary"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 mt-auto">
                {userRole === "ceo" && (
                    <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider mb-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified SME
                        </div>
                        <p className="text-[10px] text-foreground/40 leading-tight font-medium">
                            Your business is CAC verified and eligible for escrow payments.
                        </p>
                    </div>
                )}
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/5 group">
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
