"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
    PlayCircle,
    Pause,
    Square,
    Shield,
    Plus,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    User,
    Clock,
    Timer,
    AlertTriangle,
    CheckSquare,
    Square as SquareIcon,
    Info,
    ArrowRight,
    Sparkles,
    ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper to format time
const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function ActiveJobPage() {
    const [mounted, setMounted] = useState(false);
    const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused'>('running');
    const [elapsedTime, setElapsedTime] = useState(2712); // 45:12
    const [showUpsell, setShowUpsell] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [notesOpen, setNotesOpen] = useState(true);
    const [checklist, setChecklist] = useState([
        { id: 1, text: "Client Checked In", completed: true },
        { id: 2, text: "Consultation Done", completed: true },
        { id: 3, text: "Service Completed", completed: false },
        { id: 4, text: "Workspace Cleaned", completed: false },
    ]);
    const [addedExtras, setAddedExtras] = useState<any[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (jobStatus === 'running') {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [jobStatus]);

    const toggleCheck = (id: number) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

    const handleAddExtra = (item: any) => {
        setAddedExtras(prev => [...prev, item]);
        setShowUpsell(false);
    };

    // Slide to confirm logic
    const x = useMotionValue(0);
    const background = useTransform(x, [0, 200], ["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.8)"]);
    const opacity = useTransform(x, [0, 150], [1, 0]);

    const handleDragEnd = () => {
        if (x.get() > 180) {
            setShowSummary(true);
            setJobStatus('paused');
        }
        x.set(0);
    };

    if (!mounted) return null;

    if (jobStatus === 'idle') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="h-32 w-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                        <PlayCircle className="h-16 w-16 text-gray-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">No active job</h2>
                        <p className="text-gray-400 mt-2 max-w-xs mx-auto">Go to your Dashboard to accept a request or start a scheduled job.</p>
                    </div>
                    <Button asChild className="bg-primary text-white font-bold rounded-2xl h-14 px-8 shadow-xl shadow-primary/20">
                        <a href="/staff-portal">Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" /></a>
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header Cockpit */}
            <GlassCard className="p-6 border-white/10 bg-white/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" />
                            <AvatarFallback>AJ</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white">Alice Johnson</h2>
                            <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" /> Premium Member
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group">
                                    <Shield className="h-7 w-7 group-hover:scale-110 transition-transform" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-sm">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-extrabold text-center text-red-500 flex items-center justify-center gap-3">
                                        <AlertTriangle className="h-8 w-8" /> SOS Alert
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 text-center py-4">
                                    <p className="text-gray-300 font-medium">This will immediately alert the business manager and start recording audio for your safety.</p>
                                    <Button className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-xl shadow-red-600/20">
                                        Confirm Emergency
                                    </Button>
                                    <Button variant="ghost" className="w-full text-gray-500 font-bold">Cancel</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </GlassCard>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Center Stage: Timer & Controls */}
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-12 border-white/10 bg-white/5 text-center relative overflow-hidden">
                        {/* Background Glow */}
                        <div className={cn(
                            "absolute inset-0 blur-[120px] rounded-full transition-colors duration-1000",
                            jobStatus === 'running' ? "bg-primary/10" : "bg-amber-500/10"
                        )} />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-center gap-3 text-gray-400 uppercase tracking-[0.3em] font-extrabold text-xs">
                                <Timer className={cn("h-4 w-4", jobStatus === 'running' && "animate-pulse text-primary")} />
                                {jobStatus === 'running' ? "Session in Progress" : "Session Paused"}
                            </div>

                            <h1 className="text-8xl md:text-9xl font-mono font-extrabold text-white tracking-tighter">
                                {formatTime(elapsedTime)}
                            </h1>

                            <div className="flex flex-col items-center gap-8">
                                <div className="flex gap-4">
                                    {jobStatus === 'running' ? (
                                        <Button
                                            onClick={() => setJobStatus('paused')}
                                            className="h-20 w-20 rounded-3xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform"
                                        >
                                            <Pause className="h-10 w-10 fill-white" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setJobStatus('running')}
                                            className="h-20 w-20 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            <PlayCircle className="h-10 w-10 fill-white" />
                                        </Button>
                                    )}
                                </div>

                                {/* Slide to Complete */}
                                <div className="relative w-full max-w-xs h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center p-1 overflow-hidden">
                                    <motion.div
                                        style={{ background }}
                                        className="absolute inset-0 z-0"
                                    />
                                    <motion.div
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 240 }}
                                        style={{ x }}
                                        onDragEnd={handleDragEnd}
                                        className="relative z-20 h-14 w-14 bg-white rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg group/handle"
                                    >
                                        <CheckCircle2 className="h-7 w-7 text-emerald-600 group-active/handle:scale-90 transition-transform" />
                                    </motion.div>
                                    <motion.p
                                        style={{ opacity }}
                                        className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-400 pointer-events-none"
                                    >
                                        Complete Job
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Job Stream */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Job Stream</h3>
                            <div className="h-px flex-1 bg-white/5 mx-4" />
                        </div>

                        <GlassCard className="p-8 border-white/10 bg-white/5 space-y-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-extrabold text-primary uppercase tracking-widest">Service</p>
                                    <h4 className="text-xl font-extrabold text-white">Deep Tissue Massage</h4>
                                    <p className="text-sm font-medium text-gray-400">90 Minutes • Standard Room</p>
                                </div>
                                <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    <Clock className="h-6 w-6 text-gray-500" />
                                </div>
                            </div>

                            {/* Upsell Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Quick Actions (Upsell)</p>
                                    <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-xl border-primary/20 bg-primary/5 text-primary font-bold hover:bg-primary hover:text-white transition-all">
                                                <Plus className="mr-1.5 h-4 w-4" /> Add Item
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-extrabold">Add Service/Product</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-6">
                                                {[
                                                    { name: "Aromatherapy Oil", price: 3500, icon: Sparkles },
                                                    { name: "Hot Stone Add-on", price: 5000, icon: Info },
                                                    { name: "Organic Face Mask", price: 4500, icon: ShoppingBag },
                                                ].map((item, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleAddExtra(item)}
                                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all group text-left"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                                <item.icon className="h-6 w-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white">{item.name}</p>
                                                                <p className="text-xs text-gray-500">Premium Add-on</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-extrabold text-primary">₦{item.price.toLocaleString()}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <AnimatePresence>
                                    {addedExtras.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            {addedExtras.map((extra, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        <span className="text-sm font-bold text-white">{extra.name}</span>
                                                    </div>
                                                    <span className="text-sm font-extrabold text-emerald-500">+₦{extra.price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Sidebar: Checklist & Notes */}
                <div className="space-y-8">
                    {/* SOP Checklist */}
                    <GlassCard className="p-6 border-white/10 bg-white/5 space-y-6">
                        <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <CheckSquare className="h-3.5 w-3.5" /> Service Checklist (SOP)
                        </h3>
                        <div className="space-y-3">
                            {checklist.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => toggleCheck(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all border",
                                        item.completed
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <SquareIcon className="h-5 w-5" />}
                                    <span className={cn("text-sm font-bold", item.completed && "line-through opacity-50")}>
                                        {item.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Client Notes */}
                    <GlassCard className="border-white/10 bg-white/5 overflow-hidden">
                        <button
                            onClick={() => setNotesOpen(!notesOpen)}
                            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Client Notes
                            </h3>
                            {notesOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                        </button>
                        <AnimatePresence>
                            {notesOpen && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 pt-0">
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                            <p className="text-sm font-bold text-amber-200 leading-relaxed">
                                                ⚠️ Sensitive skin. Low pressure on shoulders. Prefers lavender oil if available.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>
                </div>
            </div>

            {/* Completion Summary Modal */}
            <Dialog open={showSummary} onOpenChange={setShowSummary}>
                <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold text-center mb-2">Job Summary</DialogTitle>
                        <p className="text-center text-gray-400 font-medium">Review the session details before closing.</p>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                            <span className="text-gray-400 font-bold">Total Time</span>
                            <span className="text-xl font-mono font-extrabold text-white">{formatTime(elapsedTime)}</span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Extras Added</p>
                            {addedExtras.length > 0 ? (
                                addedExtras.map((extra, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-300">{extra.name}</span>
                                        <span className="text-sm font-extrabold text-white">₦{extra.price.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm font-bold text-gray-600 italic">No extras added during session.</p>
                            )}
                        </div>

                        <div className="h-px bg-white/10" />

                        <div className="flex justify-between items-center">
                            <span className="text-lg font-extrabold text-white">Total Earnings</span>
                            <span className="text-2xl font-extrabold text-primary">₦{(15000 + addedExtras.reduce((acc, curr) => acc + curr.price, 0)).toLocaleString()}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-col gap-3">
                        <Button
                            onClick={() => {
                                setShowSummary(false);
                                setJobStatus('idle');
                            }}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
                        >
                            Request Payment Release
                        </Button>
                        <Button variant="ghost" onClick={() => setShowSummary(false)} className="text-gray-500 font-bold">
                            Back to Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
