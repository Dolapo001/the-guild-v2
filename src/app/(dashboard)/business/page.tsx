"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    AlertTriangle,
    UserPlus,
    Check,
    X,
    ChevronRight,
    Search,
    Calendar,
    Clock,
    User,
    ShieldCheck,
    ArrowRight,
    Star,
    Info,
    TrendingUp,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_STAFF, MOCK_BOOKINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Task 1: Action Center Alerts
const INITIAL_ALERTS = [
    {
        id: 1,
        type: 'AI_APPROVAL',
        text: "Maestro matched Sarah for Deep Tissue (2 PM).",
        jobId: "JOB-102",
        staffName: "Sarah Johnson",
        service: "Deep Tissue Massage",
        time: "Today, 2:00 PM",
        client: "Alice Johnson"
    },
    {
        id: 2,
        type: 'DECLINE_ALERT',
        text: "Bob declined Job #882 (Sick leave). Michael is available.",
        jobId: "JOB-882",
        staffName: "Bob Smith",
        replacementName: "Michael Chen",
        service: "Swedish Massage",
        time: "Today, 4:30 PM",
        client: "Mark Davis"
    },
    {
        id: 3,
        type: 'MANUAL_REQUEST',
        text: "New Booking: Bridal Makeup. No staff assigned.",
        jobId: "JOB-995",
        service: "Bridal Makeup",
        time: "Jan 14, 10:00 AM",
        client: "Sophia Lee"
    }
];


export default function BusinessDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.role === 'ceo' && user.verificationStatus === 'unverified') {
                router.push('/onboarding/business');
            }
        }
    }, [user, router]);

    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [staffList, setStaffList] = useState(MOCK_STAFF.map(s => ({
        ...s,
        isBusy: s.id === 's3', // Mocking Chioma as busy
        matchScore: s.id === 's1' ? 98 : s.id === 's2' ? 85 : 45
    })));

    const isSolo = user?.isSoloOperator ?? true;

    const handleApproveAI = (alertId: number) => {
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            // Update Job Status
            setAlerts(prev => prev.filter(a => a.id !== alertId));
            // Sync with bookings list
            setBookings(prev => prev.map(b =>
                (b.id === alert.jobId || b.service === alert.service)
                    ? { ...b, status: "Confirmed", staffId: 's1' }
                    : b
            ));
            console.log(`Approved ${alert.staffName} for ${alert.jobId}`);
        }
    };

    const handleOpenAssign = (job: any) => {
        setSelectedJob(job);
        setIsAssignModalOpen(true);
    };

    const confirmAssignment = (staff: any) => {
        if (!staff) return;
        if (staff.isBusy) {
            if (!confirm(`Warning: ${staff.name} has a conflicting appointment. Overbook anyway?`)) {
                return;
            }
        }

        // Update state
        setAlerts(prev => prev.filter(a => a.jobId !== selectedJob.jobId));
        // Sync with bookings list
        setBookings(prev => prev.map(b =>
            (b.id === selectedJob.jobId || b.service === selectedJob.service)
                ? { ...b, status: "Confirmed", staffId: staff.id }
                : b
        ));
        setIsAssignModalOpen(false);
        setSelectedJob(null);

        // Mock notifications
        alert(`Assignment Confirmed! ${staff.name} has been notified.`);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary tracking-tight">
                            {isSolo ? "My Studio Dashboard" : "Business Dashboard"}
                        </h1>
                        <p className="text-foreground/50 font-medium">
                            {isSolo ? "Manage your schedule and earnings." : "Manage your operations and staff assignments."}
                        </p>
                    </div>
                    {isSolo && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Solo Operator
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <GlassCard className="px-4 py-2 flex items-center gap-2 border-accent/20 bg-accent/5">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Verified SME</span>
                    </GlassCard>
                </div>
            </div>

            {isSolo ? (
                /* VIEW 1: SOLO OPERATOR DASHBOARD */
                <div className="space-y-8">
                    {/* Top Widget: Active Job Timer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassCard className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold animate-pulse">
                                    <Clock className="h-3 w-3" /> LIVE SESSION
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                    <Sparkles className="h-10 w-10 text-primary" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-extrabold text-primary mb-1">Deep Tissue Massage</h3>
                                    <p className="text-foreground/50 font-bold flex items-center justify-center md:justify-start gap-2">
                                        <User className="h-4 w-4" /> Client: Alice Johnson • <Clock className="h-4 w-4" /> 45:12 remaining
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                                        <Button className="bg-primary text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-primary/20">
                                            Complete Session
                                        </Button>
                                        <Button variant="outline" className="border-glass-border text-primary font-bold rounded-xl h-11 px-6">
                                            Pause
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Middle Row: Today's Schedule & Quick Actions */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <GlassCard className="p-8 border-white/40 h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-primary">Today's Schedule</h3>
                                    <Link href="/bookings">
                                        <Button variant="ghost" className="text-xs font-bold text-primary/60 hover:text-primary hover:underline transition-all">
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {bookings.slice(0, 3).map((booking, i) => (
                                        <Link
                                            key={i}
                                            href={`/bookings/${booking.id}`}
                                            className="flex items-center justify-between group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    {booking.customer[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary text-sm">{booking.customer}</p>
                                                    <p className="text-[10px] font-medium text-foreground/40">{booking.service} • {booking.time}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        <div className="space-y-6">
                            <GlassCard className="p-8 border-white/40">
                                <h3 className="text-lg font-bold text-primary mb-6">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/10">
                                        Create Walk-in Booking
                                    </Button>
                                    <Button variant="outline" className="w-full border-glass-border text-primary font-bold h-12 rounded-xl">
                                        Go Offline
                                    </Button>
                                </div>
                            </GlassCard>
                            <GlassCard className="p-8 border-white/40 bg-accent/5 border-accent/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs font-bold text-accent uppercase tracking-widest">Daily Goal</p>
                                </div>
                                <p className="text-2xl font-extrabold text-primary">₦45,000 / ₦60,000</p>
                                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent rounded-full" style={{ width: '75%' }} />
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Bottom Row: Financial Overview */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { title: "Today's Revenue", value: "₦45,000", change: "+12%", icon: CreditCard, color: "text-primary" },
                            { title: "Tips Earned", value: "₦8,500", change: "+5%", icon: Sparkles, color: "text-secondary" },
                            { title: "Avg. Rating", value: "4.9", change: "+0.1", icon: Star, color: "text-amber-500" }
                        ].map((stat, i) => (
                            <GlassCard key={i} className="p-6 border-white/40 hover:bg-white/60 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-2.5 rounded-xl bg-white/5", stat.color)}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">{stat.title}</p>
                                <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            ) : (
                /* VIEW 2: TEAM MANAGER DASHBOARD */
                <div className="space-y-8">
                    {/* Top Widget: Action Center */}
                    <AnimatePresence>
                        {alerts.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-sm font-extrabold text-red-500 flex items-center gap-2 uppercase tracking-widest">
                                        <AlertTriangle className="h-4 w-4" /> Action Required ({alerts.length})
                                    </h3>
                                </div>
                                <div className="grid gap-4">
                                    {alerts.map((alert) => (
                                        <GlassCard
                                            key={alert.id}
                                            className={cn(
                                                "p-5 border-l-4 flex flex-col md:flex-row items-center justify-between gap-6 transition-all",
                                                alert.type === 'AI_APPROVAL' ? "border-l-amber-500 bg-amber-500/5" :
                                                    alert.type === 'DECLINE_ALERT' ? "border-l-red-500 bg-red-500/5" :
                                                        "border-l-blue-500 bg-blue-500/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                                    alert.type === 'AI_APPROVAL' ? "bg-amber-500/20 text-amber-500" :
                                                        alert.type === 'DECLINE_ALERT' ? "bg-red-500/20 text-red-500" :
                                                            "bg-blue-500/20 text-blue-500"
                                                )}>
                                                    {alert.type === 'AI_APPROVAL' ? <Sparkles className="h-6 w-6" /> :
                                                        alert.type === 'DECLINE_ALERT' ? <AlertTriangle className="h-6 w-6" /> :
                                                            <UserPlus className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary">{alert.text}</p>
                                                    <p className="text-xs font-medium text-foreground/40">{alert.service} • {alert.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 shrink-0">
                                                {alert.type === 'AI_APPROVAL' ? (
                                                    <>
                                                        <Button
                                                            onClick={() => handleApproveAI(alert.id)}
                                                            className="bg-primary text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-primary/20"
                                                        >
                                                            <Check className="mr-2 h-4 w-4" /> Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleOpenAssign(alert)}
                                                            className="border-glass-border text-primary font-bold rounded-xl h-10 px-6"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </>
                                                ) : alert.type === 'DECLINE_ALERT' ? (
                                                    <>
                                                        <Button
                                                            onClick={() => confirmAssignment(staffList.find(s => s.name === alert.replacementName))}
                                                            className="bg-primary text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-primary/20"
                                                        >
                                                            Assign {alert.replacementName?.split(' ')[0]}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleOpenAssign(alert)}
                                                            className="border-glass-border text-primary font-bold rounded-xl h-10 px-6"
                                                        >
                                                            Find Others
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleOpenAssign(alert)}
                                                        className="bg-primary text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-primary/20"
                                                    >
                                                        Assign Staff
                                                    </Button>
                                                )}
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Middle Row: Staff Performance & Revenue Charts */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <GlassCard className="p-8 border-white/40">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-primary">Revenue Overview</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-bold">Weekly</Badge>
                                        <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20">Monthly</Badge>
                                    </div>
                                </div>
                                <div className="h-64 w-full bg-primary/5 rounded-2xl flex items-end justify-between p-6 gap-2">
                                    {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            className="w-full bg-primary/20 rounded-t-lg hover:bg-primary/40 transition-colors relative group"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                ₦{h * 1000}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                        <GlassCard className="p-8 border-white/40">
                            <h3 className="text-xl font-bold text-primary mb-6">Staff Performance</h3>
                            <div className="space-y-6">
                                {MOCK_STAFF.slice(0, 3).map((staff, i) => (
                                    <Link
                                        key={i}
                                        href={`/staff/${staff.id}`}
                                        className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                                    >
                                        <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                            <AvatarImage src={staff.image} />
                                            <AvatarFallback>{staff.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-primary">{staff.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${staff.rating * 20}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-primary">{staff.rating}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/staff">
                                <Button className="w-full mt-8 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold border-0 h-12 rounded-xl transition-all shadow-lg shadow-primary/5">
                                    Manage Workforce
                                </Button>
                            </Link>
                        </GlassCard>
                    </div>

                    {/* Bottom Row: Upcoming Schedule (All Staff) */}
                    <GlassCard className="p-8 border-white/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-primary">Upcoming Schedule</h3>
                            <Link href="/bookings">
                                <Button variant="ghost" className="text-xs font-bold text-primary/60 hover:text-primary hover:underline transition-all">
                                    View All
                                </Button>
                            </Link>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {bookings.slice(0, 4).map((booking, i) => (
                                <Link
                                    key={i}
                                    href={`/bookings/${booking.id}`}
                                    className="flex items-center justify-between group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            {booking.customer[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">{booking.customer}</p>
                                            <p className="text-xs font-medium text-foreground/40">{booking.service} • {booking.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs font-bold text-primary">₦{booking.price.toLocaleString()}</p>
                                            <p className="text-[10px] font-medium text-foreground/40">{booking.status}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Staff Assignment Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <GlassCard className="border-white/40 shadow-2xl p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-primary flex items-center gap-2">
                                <UserPlus className="h-6 w-6 text-secondary" /> Assign Professional
                            </DialogTitle>
                        </DialogHeader>

                        {selectedJob && (
                            <div className="space-y-8">
                                {/* Job Summary */}
                                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-2">Job Summary</p>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-primary text-lg">{selectedJob.service}</h4>
                                            <p className="text-sm font-medium text-foreground/50">{selectedJob.time} • Client: {selectedJob.client}</p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                                            {selectedJob.jobId}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Staff List */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Smart Sort: Recommended Professionals</p>
                                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {staffList.sort((a, b) => b.matchScore - a.matchScore).map((staff) => (
                                            <div
                                                key={staff.id}
                                                onClick={() => confirmAssignment(staff)}
                                                className={cn(
                                                    "p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden",
                                                    staff.isBusy
                                                        ? "bg-gray-500/5 border-white/5 opacity-60 grayscale"
                                                        : "bg-white/40 border-glass-border hover:border-primary/30 hover:bg-white/60",
                                                    staff.matchScore >= 95 && !staff.isBusy && "ring-2 ring-amber-500/30 border-amber-500/30 bg-amber-500/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <Avatar className={cn(
                                                            "h-12 w-12 rounded-2xl border-2 shadow-sm transition-all",
                                                            staff.matchScore >= 95 ? "border-amber-500 scale-110" : "border-white"
                                                        )}>
                                                            <AvatarImage src={staff.image} />
                                                            <AvatarFallback>{staff.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {staff.isBusy ? (
                                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-red-500 border-2 border-white rounded-full" />
                                                        ) : (
                                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-primary">{staff.name}</p>
                                                            {staff.matchScore >= 95 && (
                                                                <Badge className="bg-amber-500 text-white border-0 text-[8px] font-extrabold px-1.5 py-0">
                                                                    ✨ TOP PICK
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{staff.role}</span>
                                                            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                                                                <Star className="h-2.5 w-2.5 fill-amber-500" /> {staff.rating}
                                                            </span>
                                                        </div>
                                                        {staff.isBusy && (
                                                            <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" /> Busy (Has job at 10:15 AM)
                                                            </p>
                                                        )}
                                                        {staff.matchScore >= 95 && (
                                                            <p className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                                                                <Sparkles className="h-3 w-3" /> {staff.matchScore}% Match
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    <Button
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest",
                                                            staff.isBusy ? "bg-gray-500/20 text-gray-500" : "bg-primary text-white"
                                                        )}
                                                    >
                                                        {staff.isBusy ? "Overbook" : "Assign"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 rounded-xl font-bold text-foreground/40"
                                onClick={() => setIsAssignModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </GlassCard>
                </DialogContent>
            </Dialog>
        </div>
    );
}
