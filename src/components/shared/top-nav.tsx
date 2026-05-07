"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { notificationService, Notification } from "@/services/notification.service";
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
import { SidebarContent } from "./sidebar";

const pathMap: Record<string, string> = {
  "/home": "Overview",
  "/customer": "Overview",
  "/bookings": "Bookings",
  "/inventory": "Inventory & Marketplace",
  "/wallet": "Wallet & Financials",
  "/staff": "Workforce Management",
  "/staff-portal": "Staff Portal",
  "/reviews": "Reviews & Ratings",
  "/marketplace": "Marketplace",
  "/search": "Search Results",
  "/profile": "Profile & Settings",
  "/home/orders": "Order Management",
  "/business-profile/verification": "Business Verification",
  "/active-job": "Active Session",
  "/job-history": "Job History",
  "/inbox": "Inbox",
};

export function TopNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && user) {
      fetchNotifications();
    }
  }, [mounted, user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const getTitle = () => {
    return pathMap[pathname] || "Dashboard";
  };

  const isVerified = user?.role === "ceo" && (user?.verification_status === "verified" || user?.verificationStatus === "verified");
  const displayName = user?.name ?? user?.username;

  const handleMarkRead = async (uid: string) => {
    try {
      await notificationService.markAsRead(uid);
      // Optimistic update
      setNotifications(prev => prev.map(n => n.uid === uid ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const businessLogo = (user as any)?.profile?.business?.logo;
  const avatarUrl = user?.avatar || (user?.role === "ceo" && businessLogo ? businessLogo : null);

  if (!mounted) return null;

  return (
    <header className="h-16 border-b border-glass-border bg-glass-surface backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between shadow-sm pt-safe">
      {/* Left Side: Back Button (Mobile) or Dynamic Title (Desktop) */}
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                <Menu className="h-6 w-6 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r-glass-border bg-glass-surface backdrop-blur-xl">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <h1 className="text-lg font-extrabold text-foreground tracking-tight">{getTitle()}</h1>
          {isVerified && (
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-2 py-0.5 rounded-lg border border-accent/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:block">Verified Business</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Page Title (Mobile Only) */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
        <h1 className="text-sm font-extrabold text-foreground uppercase tracking-[0.2em]">{getTitle()}</h1>
      </div>

      {/* Integrated Search Bar (Desktop) - Hidden for SME Owners */}
      {user?.role !== "ceo" && (
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group w-80">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-secondary' : 'text-foreground/20 group-focus-within:text-primary'}`} />
          <Input
            placeholder="Ask for what you need..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </form>
      )}

      {/* Right Side: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted transition-colors">
              <Bell className={cn("h-5 w-5", unreadCount > 0 ? "text-primary" : "text-foreground/40")} />
              {unreadCount > 0 && (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent border-2 border-background animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 border-glass-border bg-card/95 backdrop-blur-xl shadow-premium rounded-2xl">
            <DropdownMenuLabel className="px-4 py-3 text-sm font-extrabold text-foreground uppercase tracking-widest">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-glass-border" />
            <div className="py-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-foreground/30 italic">No notifications yet.</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <DropdownMenuItem 
                    key={n.uid} 
                    onClick={() => handleMarkRead(n.uid)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors",
                      n.is_read ? "opacity-50 grayscale-[0.5]" : "bg-primary/5 shadow-sm"
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-lg bg-muted flex items-center justify-center shadow-sm shrink-0")}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">{n.title}</p>
                      <p className="text-[10px] font-medium text-foreground/50 mt-0.5">{n.message}</p>
                      <p className="text-[10px] font-medium text-foreground/30 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1" />}
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator className="bg-glass-border" />
            <Button 
              variant="ghost" 
              onClick={handleMarkAllRead}
              className="w-full h-10 text-xs font-bold text-foreground/60 hover:bg-muted"
            >
              Mark all as read
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-px bg-glass-border mx-1 hidden md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 px-2 md:pl-2 md:pr-4 rounded-xl hover:bg-muted transition-colors gap-3">
              <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                <AvatarImage src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"} alt={displayName} />
                <AvatarFallback className="bg-primary text-white text-[10px] font-bold">{(displayName)?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold text-foreground hidden md:block">{displayName?.split(' ')[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 border-glass-border bg-card/95 backdrop-blur-xl shadow-premium rounded-2xl">
            <div className="px-4 py-4 mb-2">
              <p className="text-sm font-extrabold text-foreground">{displayName}</p>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">
                {user?.role === "ceo" ? "Business Owner" : user?.role === "staff" ? "Senior Professional" : "Premium Member"}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-glass-border" />
            <Link href="/profile">
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors">
                <UserCircle className="h-4 w-4 text-foreground/40" />
                <span className="text-sm font-bold text-foreground">Profile Settings</span>
              </DropdownMenuItem>
            </Link>
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
