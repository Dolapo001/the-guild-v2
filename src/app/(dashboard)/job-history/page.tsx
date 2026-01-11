"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Briefcase,
    Wallet,
    Star,
    Search,
    Calendar,
    ChevronRight,
    CheckCircle2,
    Clock,
    TrendingUp,
    Filter,
    X,
    Receipt,
    ShoppingBag,
    User,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Mock History Data
const MOCK_HISTORY = [
    {
        id: "h1",
        service: "Deep Tissue Massage",
        client: "Alice Johnson",
        date: "Jan 12, 2026",
        time: "09:00 AM",
        duration: "90 Mins",
        endTime: "10:30 AM",
        price: 12000,
        tip: 2000,
        status: "Paid",
        rating: 5,
        comment: "Best massage ever! Alice was very professional.",
        upsells: [
            { name: "Aromatherapy Oil", price: 3500 }
        ]
    },
    {
        id: "h2",
        service: "Swedish Massage",
        client: "Bob Smith",
        date: "Jan 11, 2026",
        time: "11:00 AM",
        duration: "60 Mins",
        endTime: "12:00 PM",
        price: 10000,
        tip: 0,
        status: "Clearing",
        rating: 4,
        comment: "Very relaxing session. Highly recommended.",
        upsells: []
    },
    {
        id: "h3",
        service: "Facial Treatment",
        client: "Chioma Okeke",
        date: "Jan 10, 2026",
        time: "02:00 PM",
        duration: "45 Mins",
        endTime: "02:45 PM",
        price: 8000,
        tip: 1500,
        status: "Paid",
        rating: null,
        comment: null,
        upsells: [
            { name: "Organic Face Mask", price: 4500 }
        ]
    },
    {
        id: "h4",
        service: "Body Scrub",
        client: "David Lee",
        date: "Jan 08, 2026",
        time: "04:30 PM",
        duration: "60 Mins",
        endTime: "05:30 PM",
        price: 10000,
        tip: 0,
        status: "Paid",
        rating: 5,
        comment: "Excellent service. My skin feels amazing!",
        upsells: []
    }
];

export default function JobHistoryPage() {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("This Week");
    const [selectedJob, setSelectedJob] = useState<typeof MOCK_HISTORY[0] | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredJobs = MOCK_HISTORY.filter(job =>
        job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: "Total Jobs", value: "142", icon: Briefcase, color: "text-primary" },
        { label: "Total Earnings", value: "₦850,000", icon: Wallet, color: "text-accent" },
        { label: "Average Rating", value: "4.9 ⭐", icon: Star, color: "text-amber-500" },
    ];

    if (!mounted) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-extrabold tracking-tight text-white">My Job History</h1>
                <p className="text-gray-400 font-medium mt-1">Track your past work, earnings, and client feedback.</p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <GlassCard key={i} className="p-6 border-white/10 bg-white/10">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5">
                                <stat.icon className={cn("h-7 w-7", stat.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Filter Bar */}
            <GlassCard className="p-4 border-white/10 bg-white/5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by client name or service..."
                            className="pl-10 bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {["This Week", "This Month", "All Time"].map((filter) => (
                            <Button
                                key={filter}
                                variant={timeFilter === filter ? "default" : "outline"}
                                onClick={() => setTimeFilter(filter)}
                                className={cn(
                                    "rounded-xl h-12 px-6 font-bold transition-all",
                                    timeFilter === filter
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "border-white/10 text-gray-400 hover:bg-white/5"
                                )}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* History List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                layout
                            >
                                <GlassCard
                                    className="p-6 border-white/10 bg-white/10 hover:bg-white/15 transition-all cursor-pointer group"
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="grid md:grid-cols-3 gap-6 items-center">
                                        {/* Left: Job Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Briefcase className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-extrabold text-white">{job.service}</h4>
                                                <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5" /> {job.client}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                    {job.date} • {job.time}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Middle: Review */}
                                        <div className="flex flex-col justify-center">
                                            {job.rating ? (
                                                <div className="space-y-1">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={cn("h-3.5 w-3.5", i < job.rating! ? "fill-amber-500 text-amber-500" : "text-gray-600")} />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-300 italic line-clamp-1">"{job.comment}"</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">No rating yet</p>
                                            )}
                                        </div>

                                        {/* Right: Financials & Status */}
                                        <div className="flex items-center justify-between md:justify-end gap-8">
                                            <div className="text-right">
                                                <p className="text-lg font-extrabold text-emerald-500">₦{job.price.toLocaleString()}</p>
                                                {job.tip > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                                        <Sparkles className="h-2.5 w-2.5" /> +₦{job.tip.toLocaleString()} Tip
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border",
                                                    job.status === "Paid"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    {job.status === "Paid" ? "✅ Paid" : "⏳ Clearing"}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center"
                        >
                            <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Calendar className="h-10 w-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">History Empty</h3>
                            <p className="text-gray-400 mt-2">You haven't completed any jobs in this period.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Job Receipt Modal */}
            <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
                <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold text-center flex items-center justify-center gap-3">
                            <Receipt className="h-8 w-8 text-primary" /> Job Receipt
                        </DialogTitle>
                    </DialogHeader>

                    {selectedJob && (
                        <div className="py-6 space-y-8">
                            <div className="text-center space-y-1">
                                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Service Provided</p>
                                <h4 className="text-xl font-extrabold text-white">{selectedJob.service}</h4>
                                <p className="text-sm font-medium text-primary">with {selectedJob.client}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">Start Time</p>
                                    <p className="text-sm font-bold text-white">{selectedJob.time}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">End Time</p>
                                    <p className="text-sm font-bold text-white">{selectedJob.endTime}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Financial Breakdown</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 font-medium">Base Service Fee</span>
                                        <span className="font-bold text-white">₦{selectedJob.price.toLocaleString()}</span>
                                    </div>
                                    {selectedJob.upsells.map((extra, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-medium">{extra.name} (Upsell)</span>
                                            <span className="font-bold text-white">₦{extra.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {selectedJob.tip > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-amber-500 font-bold">Client Tip</span>
                                            <span className="font-bold text-amber-500">₦{selectedJob.tip.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-white/10 pt-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-extrabold text-white">Final Payout</span>
                                        <span className="text-2xl font-extrabold text-emerald-500">
                                            ₦{(selectedJob.price + selectedJob.tip + selectedJob.upsells.reduce((acc, curr) => acc + curr.price, 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-500">Payment Status: {selectedJob.status}</p>
                                    <p className="text-[10px] font-medium text-emerald-500/60">Funds processed via Secure Escrow</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setSelectedJob(null)}
                                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                            >
                                Close Receipt
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
