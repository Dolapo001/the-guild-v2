"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Calendar,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    ShieldCheck,
    ChevronRight,
    AlertCircle,
    Info,
    ArrowRight,
    UserPlus,
    CheckCircle2,
    X,
    Sparkles,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_BOOKINGS, MOCK_STAFF } from "@/lib/mock-data";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const stats = [
    {
        title: "Total Revenue",
        value: "₦ 2,450,000",
        change: "+12.5%",
        trend: "up",
        icon: CreditCard,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Active Bookings",
        value: "24",
        change: "+4.2%",
        trend: "up",
        icon: Calendar,
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
    {
        title: "Staff Active",
        value: "12",
        change: "0%",
        trend: "neutral",
        icon: Users,
        color: "text-accent",
        bg: "bg-accent/10",
    },
    {
        title: "Pending Verifications",
        value: "2",
        change: "-1",
        trend: "down",
        icon: AlertCircle,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
];

export default function DashboardHome() {
    const { user } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    const unassignedBookings = bookings.filter(b => b.status === "Unassigned");

    useEffect(() => {
        if (user?.role === "ceo" && user?.verificationStatus === "unverified") {
            router.push("/onboarding");
        }
    }, [user, router]);

    const handleAssign = (booking: any) => {
        setSelectedBooking(booking);
        setIsAssignModalOpen(true);
    };

    const confirmAssignment = (staffId: string) => {
        setBookings(prev => prev.map(b =>
            b.id === selectedBooking.id
                ? { ...b, staffId, status: "Confirmed" }
                : b
        ));
        setIsAssignModalOpen(false);
        setSelectedBooking(null);
    };

    return (
        <div className="space-y-10">
            {/* Verification Status Banners */}
            {user?.verificationStatus === "pending" && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-primary" />
                        <p className="text-sm font-bold text-primary">Your documents are under review. Full marketplace access is restricted.</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-0 font-bold">PENDING</Badge>
                </motion.div>
            )}

            {/* Unassigned Bookings Alert */}
            {unassignedBookings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="bg-secondary/10 border-secondary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-secondary/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                                <UserPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-primary">Action Required: {unassignedBookings.length} Unassigned Bookings</h3>
                                <p className="text-sm font-medium text-primary/60">Customers are waiting for you to assign a professional to their requests.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleAssign(unassignedBookings[0])}
                                className="bg-primary text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-primary/20"
                            >
                                Assign Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">Good Morning, Glow Spa</h1>
                    <p className="text-foreground/50 font-medium">
                        Here is your business pulse for today, Jan 8th 2026.
                    </p>
                </motion.div>
                <div className="flex items-center gap-3">
                    <GlassCard className="px-4 py-2 flex items-center gap-2 border-accent/20 bg-accent/5">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Verified SME</span>
                    </GlassCard>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="p-6 border-white/40 hover:bg-white/60 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div
                                    className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend === "up"
                                        ? "bg-green-500/10 text-green-600"
                                        : stat.trend === "down"
                                            ? "bg-red-500/10 text-red-600"
                                            : "bg-foreground/5 text-foreground/40"
                                        }`}
                                >
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                    ) : stat.trend === "down" ? (
                                        <ArrowDownRight className="mr-1 h-3 w-3" />
                                    ) : null}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-1">
                                    {stat.title}
                                </p>
                                <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="lg:col-span-2 p-8 border-white/40">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-primary">Revenue Overview</h3>
                            <p className="text-sm text-foreground/40 font-medium">Monthly earnings performance</p>
                        </div>
                        <GlassCard className="px-3 py-1.5 text-xs font-bold text-primary/60">
                            Last 30 Days
                        </GlassCard>
                    </div>
                    <div className="h-[320px] w-full bg-primary/[0.02] rounded-2xl border border-primary/5 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Mock Chart Visualization */}
                        <div className="absolute inset-0 flex items-end justify-around px-8 pb-4">
                            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                    className="w-8 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg opacity-20"
                                />
                            ))}
                        </div>
                        <TrendingUp className="h-12 w-12 text-primary/10 mb-2" />
                        <p className="text-sm font-bold text-primary/20 uppercase tracking-widest">Analytics Pulse</p>
                    </div>
                </GlassCard>

                <GlassCard className="p-8 border-white/40">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-primary">Live Bookings</h3>
                            <p className="text-sm text-foreground/40 font-medium">Today's schedule</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <ChevronRight className="h-5 w-5 text-foreground/40" />
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {bookings.map((booking, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        {booking.customer[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">{booking.customer}</p>
                                        <p className="text-xs text-foreground/40 font-medium">{booking.service}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary">₦{booking.price.toLocaleString()}</p>
                                    <Badge className={`text-[8px] font-extrabold uppercase px-1.5 py-0 border-0 ${booking.status === "Unassigned" ? "bg-secondary text-primary" : "bg-green-500/10 text-green-600"
                                        }`}>
                                        {booking.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-8 bg-primary/5 hover:bg-primary/10 text-primary font-bold border-0 shadow-none h-12 rounded-xl">
                        View Full Schedule
                    </Button>
                </GlassCard>
            </div>

            {/* Assignment Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-primary flex items-center gap-2">
                                <UserPlus className="h-6 w-6 text-secondary" /> Assign Professional
                            </DialogTitle>
                        </DialogHeader>

                        {selectedBooking && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Booking Details</p>
                                    <p className="font-bold text-primary">{selectedBooking.service}</p>
                                    <p className="text-sm font-medium text-foreground/50">{selectedBooking.customer} • {selectedBooking.time}</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Available Staff</p>
                                    <div className="grid gap-3">
                                        {MOCK_STAFF.map((staff) => (
                                            <div
                                                key={staff.id}
                                                onClick={() => confirmAssignment(staff.id)}
                                                className="p-4 rounded-2xl border border-glass-border bg-white/40 hover:border-primary/30 hover:bg-white/60 transition-all cursor-pointer group flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 rounded-xl border-2 border-white shadow-sm">
                                                        <AvatarImage src={staff.image} />
                                                        <AvatarFallback>{staff.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-primary">{staff.name}</p>
                                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{staff.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex items-center gap-0.5 text-accent">
                                                        <Star className="h-3 w-3 fill-accent" />
                                                        <span className="text-xs font-bold">{staff.rating}</span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary" onClick={() => setIsAssignModalOpen(false)}>
                            Cancel
                        </Button>
                    </GlassCard>
                </DialogContent>
            </Dialog>
        </div>
    );
}
