"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Clock,
    MapPin,
    User,
    ShieldCheck,
    MessageCircle,
    Star,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowRight,
    Loader2,
    CreditCard,
    AlertCircle,
    FileText,
    Camera
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function BookingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [availableStaff, setAvailableStaff] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await bookingService.getBookingDetails(id as string);
                setBooking(data);
            } catch (err) {
                console.error("Failed to fetch booking details", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const fetchStaff = async () => {
        try {
            const list = await (await import("@/services/staff.service")).staffService.getStaffList();
            setAvailableStaff(list);
        } catch (err) {
            console.error("Failed to fetch staff", err);
        }
    };

    const handleAssignStaff = async (staffUid: string) => {
        if (!booking) return;
        const toastId = toast.loading("Assigning professional...");
        setUpdating(true);
        try {
            const updated = await bookingService.assignStaff(booking.uid, staffUid);
            setBooking(updated);
            setIsAssignModalOpen(false);
            toast.success("Professional assigned successfully!", { id: toastId });
        } catch (err: any) {
            console.error("Assignment failed", err);
            toast.error(err.message || "Failed to assign staff. They might have a conflict.", { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!booking) return;
        const toastId = toast.loading(`Updating status to ${newStatus}...`);
        setUpdating(true);
        try {
            const updated = await bookingService.updateBookingStatus(booking.uid, newStatus);
            setBooking(updated);
            toast.success(`Booking ${newStatus.toLowerCase()}!`, { id: toastId });
        } catch (err) {
            console.error("Status update failed", err);
            toast.error("Failed to update status.", { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="font-bold text-foreground/40 uppercase tracking-widest">Loading Booking Details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-20">
                <p className="text-xl font-bold text-primary">Booking not found.</p>
                <Button onClick={() => router.back()} className="mt-4 bg-primary text-white">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="group text-primary/60 hover:text-primary font-bold transition-all"
                >
                    <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Button>
                <div className="flex gap-3">
                    <Badge className={cn(
                        "px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest",
                        booking.status === 'COMPLETED' ? "bg-accent text-white" : "bg-primary text-white"
                    )}>
                        {booking.status}
                    </Badge>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Job Particulars */}
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8 border-white/40">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-primary mb-2">{booking.serviceName || booking.service}</h1>
                                <p className="text-foreground/50 font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> {booking.date} • <Clock className="h-4 w-4" /> {booking.startTime}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-1">Total Fee</p>
                                <p className="text-3xl font-black text-primary">₦{(Number(booking.totalPrice) || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 border-t border-glass-border pt-8">
                            <div>
                                <h3 className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em] mb-4">Location</h3>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-primary/5 text-primary">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary/80">Premium Session</p>
                                        <p className="text-sm font-medium text-foreground/50 leading-relaxed">
                                            {booking.locationName || "Lagos Island, Nigeria"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em] mb-4">Service Details</h3>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-primary/5 text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground/50 leading-relaxed italic">
                                        "{booking.specialNote || "Standard service request with no additional special instructions provided by the customer."}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Timeline / Progress */}
                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-xl font-bold text-primary mb-8">Appointment Timeline</h3>
                        <div className="space-y-6">
                            {[
                                { status: 'PENDING', label: 'Booking Requested', desc: 'Awaiting CEO assignment/confirmation', icon: Clock },
                                { status: 'CONFIRMED', label: 'Pro Assigned', desc: 'Service professional confirmed for the slot', icon: CheckCircle2 },
                                { status: 'IN_PROGRESS', label: 'Session Started', desc: 'The session is currently being performed', icon: Camera },
                                { status: 'COMPLETED', label: 'Job Finished', desc: 'Service completed and pending final review', icon: ShieldCheck },
                            ].map((step, i) => {
                                const isDone = booking.status === step.status || (i < 3 && booking.status === 'COMPLETED');
                                const isCurrent = booking.status === step.status;

                                return (
                                    <div key={i} className="flex gap-6 relative">
                                        {i < 3 && <div className={cn("absolute left-5 top-10 w-0.5 h-10 bg-glass-border", isDone && "bg-primary/40")} />}
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
                                            isDone ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/40 border-glass-border text-foreground/20"
                                        )}>
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        <div className="pt-1">
                                            <p className={cn("font-bold", isDone ? "text-primary" : "text-foreground/30")}>{step.label}</p>
                                            <p className="text-xs font-medium text-foreground/40">{step.desc}</p>
                                        </div>
                                        {isCurrent && (
                                            <div className="ml-auto">
                                                <Badge className="bg-primary/10 text-primary border-primary/20 animate-pulse">ACTIVE</Badge>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: People & Reviews */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <GlassCard className="p-8 border-white/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-primary/40 hover:text-primary"><AlertCircle className="h-4 w-4" /></Button>
                        </div>
                        <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6">Customer</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-xl">
                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">{(booking.customerName || "C")[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-black text-primary">{booking.customerName || "Customer"}</p>
                                <p className="text-xs font-bold text-foreground/40">{booking.walkinName ? "Walk-in Guest" : "Verified Member"}</p>
                            </div>
                        </div>
                        
                        {(booking.walkinPhone || (booking as any).customerDetails?.phone) && (
                            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Contact Info</p>
                                <p className="text-sm font-bold text-primary">{booking.walkinPhone || (booking as any).customerDetails?.phone}</p>
                                {((booking as any).customerDetails?.email) && (
                                    <p className="text-xs font-medium text-foreground/50 mt-1">{(booking as any).customerDetails?.email}</p>
                                )}
                            </div>
                        )}

                        <Button 
                            disabled={!!booking.walkinName}
                            className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group-disabled:opacity-50"
                        >
                            <MessageCircle className="h-5 w-5" />
                            {booking.walkinName ? "Chat Unavailable" : "Open Chat"}
                        </Button>
                    </GlassCard>

                    {/* Staff Info */}
                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6">Assigned Pro</h3>
                        {booking.staff ? (
                            <div className="space-y-6">
                                <Link 
                                    href={`/staff/${booking.staff}`}
                                    className="flex items-center gap-4 group cursor-pointer hover:no-underline"
                                >
                                    <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-xl transition-transform group-hover:scale-105">
                                        <AvatarImage src={(booking as any).staffAvatar} />
                                        <AvatarFallback className="bg-primary text-white text-xl font-black">{(booking.staffName || "P")[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-lg font-black text-primary group-hover:underline underline-offset-4">{booking.staffName || "Professional"}</p>
                                            <ArrowRight className="h-4 w-4 text-primary/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-black text-primary">4.9</span>
                                            </div>
                                            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Top Performer</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Recent Review</p>
                                    <p className="text-xs font-medium text-foreground/60 italic leading-relaxed">
                                        "Did an amazing job with the session. Very professional and detail-oriented. Highly recommended!"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <p className="text-red-500 font-bold text-sm mb-4">No staff assigned yet!</p>
                                <Dialog open={isAssignModalOpen} onOpenChange={(open) => {
                                    if (open) fetchStaff();
                                    setIsAssignModalOpen(open);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-red-500 text-white font-bold px-6 h-10 rounded-xl shadow-lg shadow-red-500/20">
                                            Assign Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                                        <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-extrabold text-primary">Assign Professional</DialogTitle>
                                            </DialogHeader>
                                            
                                            <div className="space-y-4">
                                                <div 
                                                    onClick={() => handleAssignStaff(booking.businessOwnerUid || '')}
                                                    className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all flex items-center gap-4 group"
                                                >
                                                    <Avatar className="h-12 w-12 rounded-xl border-2 border-primary/20">
                                                        <AvatarFallback className="bg-primary text-white font-black">M</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-black text-primary">Mastereo (Owner)</p>
                                                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Premium Service Delivery</p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-primary/40 group-hover:translate-x-1 transition-all" />
                                                </div>

                                                <div className="px-1 pt-2">
                                                    <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Available Team</h4>
                                                </div>

                                                <div className="space-y-2">
                                                    {availableStaff.map((s) => (
                                                        <div 
                                                            key={s.uid}
                                                            onClick={() => handleAssignStaff(s.uid)}
                                                            className="p-3 rounded-2xl border border-glass-border hover:border-primary/30 hover:bg-white/50 cursor-pointer transition-all flex items-center gap-4 group"
                                                        >
                                                            <Avatar className="h-10 w-10 rounded-xl border border-glass-border shadow-sm">
                                                                <AvatarImage src={s.avatar} />
                                                                <AvatarFallback className="font-black text-xs">{s.username[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-primary">{s.username}</p>
                                                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{s.role}</p>
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    ))}
                                                    {availableStaff.length === 0 && (
                                                        <p className="text-xs text-center py-4 text-foreground/40 italic">Fetching team availability...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </GlassCard>

                    {/* Management Actions */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] px-1">CEO Actions</h3>
                        {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <div className="space-y-4">
                                {booking.status === 'PENDING' && (
                                    <Button 
                                        onClick={() => handleStatusUpdate('CONFIRMED')}
                                        className="w-full bg-primary text-white font-black h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Confirm Order
                                    </Button>
                                )}
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        if (confirm("Are you sure you want to cancel this appointment?")) {
                                            handleStatusUpdate('CANCELLED');
                                        }
                                    }}
                                    className="w-full border-glass-border text-red-500 font-black h-12 rounded-xl hover:bg-red-500/5 transition-all"
                                >
                                    Cancel Appointment
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
