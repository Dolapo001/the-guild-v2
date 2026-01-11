"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Bell,
    Search,
    Menu,
    ShieldCheck,
    Sparkles,
    LogOut,
    User,
    Settings,
    RefreshCw,
    CheckCircle2,
    Info,
    AlertCircle,
    Calendar as CalendarIcon,
    LayoutDashboard,
    Calendar,
    Users,
    Package,
    Wallet,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

const pathMap: Record<string, string> = {
    "/business": "Overview",
    "/customer": "Overview",
    "/bookings": "Bookings",
    "/inventory": "Inventory & Marketplace",
    "/wallet": "Wallet & Financials",
    "/staff": "Workforce Management",
    "/staff-portal": "Staff Portal",
    "/reviews": "Reviews & Ratings",
    "/marketplace": "Marketplace",
    "/search": "Search Results",
    "/business/profile": "Business Profile",
    "/business/orders": "Order Management",
    "/business-profile/verification": "Business Verification",
    "/active-job": "Active Session",
    "/job-history": "Job History",
    "/inbox": "Inbox",
    "/profile": "Profile",
};

export function TopNav() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => setMounted(true), []);

    const getTitle = () => {
        return pathMap[pathname] || "Dashboard";
    };

    const isVerified = user?.role === "ceo" && user?.verificationStatus === "verified";
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

    const notifications = [
        { id: 1, title: "New Booking Request", time: "2 mins ago", icon: CalendarIcon, color: "text-primary" },
        { id: 2, title: "System Update", time: "1 hour ago", icon: Info, color: "text-blue-500" },
        { id: 3, title: "Verification Approved", time: "5 hours ago", icon: CheckCircle2, color: "text-green-500" },
    ];

    if (!mounted) return null;

    return (
        <header className="h-16 border-b border-glass-border bg-glass-surface dark:bg-[#0f111a] backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm">
            {/* Left Side: Dynamic Title & Verification Badge */}
            <div className="flex items-center gap-4 lg:gap-8">
                {/* Mobile Menu Trigger */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                                <Menu className="h-6 w-6 text-foreground" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 border-r border-glass-border bg-glass-surface dark:bg-[#0f111a] backdrop-blur-xl">
                            <div className="flex h-20 items-center px-6 border-b border-glass-border">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 bg-primary rounded-lg overflow-hidden shadow-lg">
                                        <img src="/logo.png" alt="The Guild Logo" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-foreground">The Guild</span>
                                </div>
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
                                                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-secondary" : "text-foreground/30")} />
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                            <div className="p-4 mt-auto border-t border-glass-border">
                                <Button
                                    onClick={logout}
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <h1 className="text-lg font-extrabold text-foreground tracking-tight">{getTitle()}</h1>
                    {isVerified && (
                        <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-2 py-0.5 rounded-lg border border-accent/20">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:block">Verified Business</span>
                        </div>
                    )}
                </div>

                {/* Integrated Search Bar */}
                <div className="hidden lg:flex items-center relative group w-80">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-secondary' : 'text-foreground/20 group-focus-within:text-primary'}`} />
                    <Input
                        placeholder="Ask for what you need..."
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setIsSearching(false)}
                        className={`pl-10 h-10 bg-muted/50 border-glass-border rounded-xl transition-all text-sm ${isSearching ? 'ring-2 ring-secondary/20 border-secondary/50 w-96' : 'focus:ring-primary/10 w-80'}`}
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
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted transition-colors">
                            <Bell className="h-5 w-5 text-foreground/40" />
                            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent border-2 border-background" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-2 border-glass-border bg-card/95 backdrop-blur-xl shadow-premium rounded-2xl">
                        <DropdownMenuLabel className="px-4 py-3 text-sm font-extrabold text-foreground uppercase tracking-widest">Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-glass-border" />
                        <div className="py-2">
                            {notifications.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted cursor-pointer transition-colors">
                                    <div className={cn("h-8 w-8 rounded-lg bg-muted flex items-center justify-center shadow-sm shrink-0", n.color)}>
                                        <n.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                                        <p className="text-[10px] font-medium text-foreground/40 mt-0.5">{n.time}</p>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator className="bg-glass-border" />
                        <Button variant="ghost" className="w-full h-10 text-xs font-bold text-foreground/60 hover:bg-muted">
                            Mark all as read
                        </Button>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-px bg-glass-border mx-1 hidden md:block" />

                {/* User Profile Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-11 px-2 md:pl-2 md:pr-4 rounded-xl hover:bg-muted transition-colors gap-3">
                            <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt={user?.name} />
                                <AvatarFallback className="bg-primary text-white text-[10px] font-bold">{user?.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-foreground hidden md:block">{user?.name?.split(' ')[0]}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 border-glass-border bg-card/95 backdrop-blur-xl shadow-premium rounded-2xl">
                        <div className="px-4 py-4 mb-2">
                            <p className="text-sm font-extrabold text-foreground">{user?.name}</p>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">
                                {user?.role === "ceo" ? "CEO @ Glow Spa" : user?.role === "staff" ? "Senior Professional" : "Premium Member"}
                            </p>
                        </div>
                        <DropdownMenuSeparator className="bg-glass-border" />
                        <Link href="/profile">
                            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors">
                                <UserCircle className="h-4 w-4 text-foreground/40" />
                                <span className="text-sm font-bold text-foreground">Profile Settings</span>
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                            onClick={() => { }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 text-foreground/40" />
                            <span className="text-sm font-bold text-foreground">Switch Role (Dev)</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-glass-border" />
                        <DropdownMenuItem
                            onClick={logout}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/5 text-red-500 cursor-pointer transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-bold">Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>

    );
}
