"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_STAFF_TASKS, MOCK_BOOKINGS } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle2,
    Clock,
    MapPin,
    Play,
    Star,
    TrendingUp,
    User,
    ChevronRight,
    AlertCircle,
    XCircle,
    Calendar,
    Sparkles,
    MessageSquare,
    Phone,
    Mail,
    ExternalLink,
    Maximize2,
    X,
    Timer,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

// Helper to format time elapsed
const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function StaffPortal() {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'today' | 'month'>('today');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState(MOCK_STAFF_TASKS);
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);
    const [selectedTask, setSelectedTask] = useState<typeof MOCK_STAFF_TASKS[0] | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [declineModalOpen, setDeclineModalOpen] = useState(false);
    const [requestToDecline, setRequestToDecline] = useState<string | null>(null);
    const [declineReason, setDeclineReason] = useState("");
    const [declineNote, setDeclineNote] = useState("");

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter bookings specifically requested for this staff (mocking staffId 's1' for Sarah Johnson)
    const myRequests = bookings.filter(b => b.staffId === 's1' && b.status === "Pending Acceptance");

    useEffect(() => {
        if (selectedTask?.status === "in-progress") {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedTime(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [selectedTask?.status, selectedTask?.id]);

    const updateTaskStatus = (id: string, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        if (selectedTask?.id === id) {
            setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const handleAcceptRequest = (id: string) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Confirmed" } : b));
        const booking = bookings.find(b => b.id === id);
        if (booking) {
            setTasks(prev => [...prev, {
                id: `t${Date.now()}`,
                service: booking.service,
                customer: booking.customer,
                date: new Date().toISOString().split('T')[0],
                time: booking.time.split(', ')[1],
                duration: "60 Mins",
                endTime: "01:00 PM",
                status: "pending",
                price: booking.price,
                customerNote: "No specific notes provided.",
                referenceImage: "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=400&auto=format&fit=crop",
                contact: { phone: "08012345678", email: "customer@example.com", whatsapp: "2348012345678" }
            }]);
        }
    };

    const handleConfirmDecline = () => {
        if (requestToDecline) {
            setBookings(prev => prev.filter(b => b.id !== requestToDecline));
            setDeclineModalOpen(false);
            setRequestToDecline(null);
            setDeclineReason("");
            setDeclineNote("");
            // In a real app, send JOB_DECLINED event to backend here
        }
    };

    const filteredTasks = tasks.filter(t => t.date === selectedDate);

    if (!mounted) return null;

    return (
        <div className="space-y-10 min-h-screen pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">Staff Portal</h1>
                    <p className="text-gray-300 font-medium mt-1">Welcome back, {user?.name || "Professional"}.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setViewMode('today')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                viewMode === 'today' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                viewMode === 'month' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Month View
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-accent/20 text-accent px-5 py-2.5 rounded-2xl border border-accent/30 shadow-lg shadow-accent/10">
                        <Star className="h-5 w-5 fill-accent" />
                        <span className="font-bold text-lg">4.9 Rating</span>
                    </div>
                </div>
            </motion.div>

            {/* My Requests Section */}
            {myRequests.length > 0 && (
                <section className="space-y-4">
                    <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-secondary" /> New Requests for You
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {myRequests.map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <GlassCard className="p-6 border-secondary/30 bg-secondary/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                                {request.customer[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-lg">{request.customer}</p>
                                                <p className="text-xs font-medium text-gray-300">{request.service}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-extrabold text-white">₦{request.price.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{request.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleAcceptRequest(request.id)}
                                            className="flex-1 bg-primary text-white font-bold rounded-xl h-12 shadow-xl shadow-primary/20"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setRequestToDecline(request.id);
                                                setDeclineModalOpen(true);
                                            }}
                                            className="flex-1 border-white/10 text-red-400 hover:bg-red-500/10 font-bold rounded-xl h-12"
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {viewMode === 'month' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="p-8 border-white/10 bg-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-extrabold text-white">January 2026</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5">
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5">
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-[10px] font-extrabold text-gray-500 uppercase tracking-widest py-2">
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: 31 }).map((_, i) => {
                                        const day = i + 1;
                                        const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
                                        const hasJobs = tasks.some(t => t.date === dateStr);
                                        const isSelected = selectedDate === dateStr;
                                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={cn(
                                                    "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border relative group",
                                                    isSelected
                                                        ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white"
                                                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10",
                                                    isToday && !isSelected && "border-primary/50 text-primary"
                                                )}
                                            >
                                                <span className="text-sm font-bold">{day}</span>
                                                {hasJobs && (
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        isSelected ? "bg-white" : "bg-secondary"
                                                    )} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">
                            {viewMode === 'today' ? "Today's Schedule" : `Schedule for ${selectedDate}`}
                        </h3>
                        <div className="relative space-y-4">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/5 -z-10" />
                            {filteredTasks.length > 0 ? filteredTasks.map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <GlassCard
                                        className={cn(
                                            "p-6 border-white/10 flex items-center gap-6 cursor-pointer hover:bg-white/15 transition-all group",
                                            task.status === "in-progress" ? "ring-2 ring-primary bg-primary/5" : "bg-white/10"
                                        )}
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <div className={cn(
                                            "h-14 w-14 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 border shadow-lg",
                                            task.status === "completed" ? "bg-accent text-white border-accent/50" :
                                                task.status === "in-progress" ? "bg-primary text-white border-primary/50 animate-pulse" :
                                                    "bg-white/5 text-gray-300 border-white/10"
                                        )}>
                                            {task.time.split(' ')[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{task.service}</h4>
                                                    <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5 mt-1">
                                                        <User className="h-3.5 w-3.5" /> {task.customer}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border",
                                                    task.status === "completed" ? "bg-accent/10 text-accent border-accent/20" :
                                                        task.status === "in-progress" ? "bg-primary/10 text-primary border-primary/20" :
                                                            "bg-white/5 text-gray-500 border-white/10"
                                                )}>
                                                    {task.status}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
                                    </GlassCard>
                                </motion.div>
                            )) : (
                                <div className="py-20 text-center">
                                    <p className="text-gray-500 font-bold">No jobs scheduled for this date.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Details Panel */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Job Details</h3>
                    <AnimatePresence mode="wait">
                        {selectedTask ? (
                            <motion.div
                                key={selectedTask.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <GlassCard className="p-8 border-white/10 bg-white/10 space-y-8 relative overflow-hidden">
                                    {/* Status Background Glow */}
                                    {selectedTask.status === 'in-progress' && (
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
                                    )}

                                    <div className="text-center">
                                        <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
                                            <User className="h-10 w-10 text-primary" />
                                        </div>
                                        <h4 className="text-2xl font-extrabold text-white">{selectedTask.customer}</h4>
                                        <p className="text-sm font-bold text-gray-400 mt-1">{selectedTask.service}</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Duration */}
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                                                <Clock className="h-3 w-3" /> Service Duration
                                            </div>
                                            <p className="text-sm font-bold text-white">
                                                {selectedTask.time} - {selectedTask.endTime} • {selectedTask.duration}
                                            </p>
                                        </div>

                                        {/* Customer Note */}
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                                                <MessageSquare className="h-3 w-3" /> Customer Note
                                            </div>
                                            <p className="text-sm font-medium text-gray-300 italic leading-relaxed">
                                                "{selectedTask.customerNote}"
                                            </p>
                                        </div>

                                        {/* Reference Image */}
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                                                <Maximize2 className="h-3 w-3" /> Reference Style
                                            </div>
                                            <div
                                                className="relative h-32 w-full rounded-xl overflow-hidden cursor-pointer group"
                                                onClick={() => setIsLightboxOpen(true)}
                                            >
                                                <img src={selectedTask.referenceImage} alt="Reference" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Maximize2 className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Section */}
                                    <div className="pt-4 space-y-4">
                                        {/* Timer / Status Control */}
                                        <div className="space-y-3">
                                            {selectedTask.status === "pending" && (
                                                <Button
                                                    onClick={() => updateTaskStatus(selectedTask.id, "in-progress")}
                                                    className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 text-lg"
                                                >
                                                    <Play className="mr-2 h-6 w-6 fill-white" /> Start Job
                                                </Button>
                                            )}
                                            {selectedTask.status === "in-progress" && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                                        <Timer className="h-5 w-5 text-primary animate-pulse" />
                                                        <span className="text-2xl font-mono font-bold text-white">{formatTime(elapsedTime)}</span>
                                                    </div>
                                                    <Button
                                                        onClick={() => updateTaskStatus(selectedTask.id, "completed")}
                                                        className="w-full h-14 rounded-2xl bg-accent text-white font-bold shadow-xl shadow-accent/20 text-lg"
                                                    >
                                                        <CheckCircle2 className="mr-2 h-6 w-6" /> Complete Job
                                                    </Button>
                                                </div>
                                            )}
                                            {selectedTask.status === "completed" && (
                                                <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center space-y-2">
                                                    <div className="flex items-center justify-center gap-2 text-accent">
                                                        <CheckCircle2 className="h-6 w-6" />
                                                        <span className="text-lg font-extrabold">Job Completed</span>
                                                    </div>
                                                    <p className="text-2xl font-extrabold text-white">Earned ₦{selectedTask.price.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Contact Dialog */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
                                                    Contact Customer
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-sm">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-extrabold text-center mb-6">Contact {selectedTask.customer}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <Button
                                                        asChild
                                                        className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center justify-start px-6 gap-4"
                                                    >
                                                        <a href={`tel:${selectedTask.contact.phone}`}>
                                                            <Phone className="h-5 w-5" />
                                                            <div className="text-left">
                                                                <p className="text-[10px] uppercase tracking-widest opacity-70">Call Mobile</p>
                                                                <p className="text-sm">{selectedTask.contact.phone}</p>
                                                            </div>
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-start px-6 gap-4"
                                                    >
                                                        <a href={`https://wa.me/${selectedTask.contact.whatsapp}`} target="_blank">
                                                            <MessageSquare className="h-5 w-5" />
                                                            <div className="text-left">
                                                                <p className="text-[10px] uppercase tracking-widest opacity-70">WhatsApp</p>
                                                                <p className="text-sm">Message Customer</p>
                                                            </div>
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(selectedTask.contact.email);
                                                            alert("Email copied to clipboard!");
                                                        }}
                                                        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold flex items-center justify-start px-6 gap-4"
                                                    >
                                                        <Mail className="h-5 w-5 text-gray-400" />
                                                        <div className="text-left">
                                                            <p className="text-[10px] uppercase tracking-widest opacity-70">Email Address</p>
                                                            <p className="text-sm">{selectedTask.contact.email}</p>
                                                        </div>
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <GlassCard className="p-12 text-center border-dashed border-white/10 bg-white/5">
                                <AlertCircle className="h-12 w-12 text-white/10 mx-auto mb-4" />
                                <p className="text-sm font-bold text-gray-500">Select a job to view details and start working.</p>
                            </GlassCard>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Decline Modal */}
            <Dialog open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
                <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
                            <XCircle className="h-7 w-7 text-red-500" /> Decline Job Request
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-amber-200 leading-relaxed">
                                Declining too many jobs may affect your Maestro Ranking and future visibility.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Reason for Decline</label>
                            <div className="grid gap-2">
                                {[
                                    "Schedule Conflict",
                                    "Personal Emergency",
                                    "Client Mismatch / Safety",
                                    "Service Not Offered"
                                ].map((reason) => (
                                    <button
                                        key={reason}
                                        onClick={() => setDeclineReason(reason)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all font-bold text-sm",
                                            declineReason === reason
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                        )}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Additional Context (Optional)</label>
                            <Textarea
                                placeholder="e.g., I am sick today..."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:ring-primary/20"
                                value={declineNote}
                                onChange={(e) => setDeclineNote(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeclineModalOpen(false)}
                            className="flex-1 text-gray-500 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDecline}
                            disabled={!declineReason}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 shadow-xl shadow-red-600/20"
                        >
                            Confirm Decline
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                            <X className="h-10 w-10" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="max-w-4xl w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={selectedTask.referenceImage} alt="Reference Full" className="h-full w-full object-cover" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
