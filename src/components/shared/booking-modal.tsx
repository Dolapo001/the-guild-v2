"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Calendar as CalendarIcon,
    Clock,
    ShieldCheck,
    X,
    Star,
    Sparkles,
    UploadCloud,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Service, MOCK_STAFF } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service;
    initialStaffId?: string | null;
    mode?: 'book' | 'reschedule';
    initialData?: Partial<BookingState>;
}

type Step = "services" | "datetime" | "customization" | "staff" | "summary" | "success";

export interface BookingState {
    selectedServices: string[];
    date: Date | undefined;
    timeSlot: string | null;
    staffId: string; // 'AUTO' or specific ID
    customImage: string | null;
    specialNote: string;
    assignedStaffId?: string; // For AI assignment
    ticketId?: string;
}

const getRandomStaff = () => {
    return MOCK_STAFF[Math.floor(Math.random() * MOCK_STAFF.length)];
};

export function BookingModal({ isOpen, onClose, service, initialStaffId, mode = 'book', initialData }: BookingModalProps) {
    const [step, setStep] = useState<Step>("services");
    const [isLoading, setIsLoading] = useState(false);

    const [bookingState, setBookingState] = useState<BookingState>({
        selectedServices: [],
        date: undefined,
        timeSlot: null,
        staffId: initialStaffId || 'AUTO',
        customImage: null,
        specialNote: '',
        ticketId: ''
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (mode === 'reschedule' && initialData) {
                setStep("datetime"); // Start at datetime for rescheduling
                setBookingState({
                    selectedServices: initialData.selectedServices || [],
                    date: undefined, // Clear date/time for rescheduling
                    timeSlot: null,
                    staffId: initialData.staffId || initialStaffId || 'AUTO',
                    customImage: initialData.customImage || null,
                    specialNote: initialData.specialNote || '',
                    ticketId: initialData.ticketId || `#GLV-${Math.floor(Math.random() * 10000)}`
                });
            } else {
                setStep("services");
                setBookingState({
                    selectedServices: [],
                    date: undefined,
                    timeSlot: null,
                    staffId: initialStaffId || 'AUTO',
                    customImage: null,
                    specialNote: '',
                    ticketId: `#GLV-${Math.floor(Math.random() * 10000)}`
                });
            }
        }
    }, [isOpen, initialStaffId, mode, initialData]);

    const displayedStaffId = bookingState.staffId === 'AUTO'
        ? bookingState.assignedStaffId
        : bookingState.staffId;

    const selectedStaffMember = MOCK_STAFF.find(s => s.id === displayedStaffId);

    const isCEOSelected = selectedStaffMember?.isOwner;
    const priceMultiplier = isCEOSelected ? 1.5 : 1; // 50% premium for CEO

    const totalAmount = service.services
        .filter(s => bookingState.selectedServices.includes(s.name))
        .reduce((acc, s) => acc + (s.price * priceMultiplier), 0);

    const escrowFee = totalAmount * 0.02;
    const finalTotal = totalAmount + escrowFee;

    const updateState = <K extends keyof BookingState>(key: K, value: BookingState[K]) => {
        setBookingState(prev => ({ ...prev, [key]: value }));
    };

    const toggleService = (name: string) => {
        setBookingState(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.includes(name)
                ? prev.selectedServices.filter(s => s !== name)
                : [...prev.selectedServices, name]
        }));
    };

    const handleNext = () => {
        if (step === "services") setStep("datetime");
        else if (step === "datetime") setStep("customization");
        else if (step === "customization") setStep("staff");
        else if (step === "staff") {
            // AI Assignment Logic
            if (bookingState.staffId === 'AUTO') {
                const randomStaff = getRandomStaff();
                updateState('assignedStaffId', randomStaff.id);
            } else {
                updateState('assignedStaffId', undefined);
            }
            setStep("summary");
        }
        else if (step === "summary") handlePayment();
    };

    const handleBack = () => {
        if (step === "datetime") setStep("services");
        else if (step === "customization") setStep("datetime");
        else if (step === "staff") setStep("customization");
        else if (step === "summary") setStep("staff");
    };

    const handlePayment = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep("success");
        }, 2000);
    };

    const steps: { id: Step; title: string }[] = [
        { id: "services", title: "Services" },
        { id: "datetime", title: "Date & Time" },
        { id: "customization", title: "Customize" },
        { id: "staff", title: "Staff" },
        { id: "summary", title: "Review" },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    const initialStaffMember = MOCK_STAFF.find(s => s.id === initialStaffId);

    // Mock Calendar Days (Next 14 days)
    const today = new Date();
    const calendarDays = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() + i);
        return d;
    });

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                <GlassCard className="border-white/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-glass-border flex justify-between items-center bg-white/40 dark:bg-white/5">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                {mode === 'reschedule' ? 'Reschedule Appointment' : 'Book Appointment'}
                            </h2>
                            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{service.businessName}</p>
                        </div>
                        {/* Removed manual X button, relying on Dialog primitives or custom close if needed. 
                            Since DialogContent usually has a close, we can hide it via CSS or use a custom one.
                            Here we use a custom one but ensure it's the only one. */}
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-primary/5">
                            <X className="h-5 w-5 text-foreground/40" />
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    {step !== "success" && (
                        <div className="px-8 pt-6">
                            <div className="flex justify-between relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -translate-y-1/2 z-0" />
                                <div
                                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
                                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                />
                                {steps.map((s, i) => (
                                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                                            i <= currentStepIndex
                                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                : 'bg-white dark:bg-slate-800 text-foreground/30 border-gray-200 dark:border-white/10'
                                        )}>
                                            {i < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2">
                                {steps.map((s, i) => (
                                    <span key={s.id} className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                        i === currentStepIndex ? "text-primary" : "text-foreground/30"
                                    )}>
                                        {s.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="min-h-[300px]"
                            >
                                {step === "services" && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-8">
                                            {initialStaffMember && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
                                                    <Sparkles className="h-3 w-3" /> Booking with {initialStaffMember.name}
                                                </div>
                                            )}
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Select Services</h3>
                                            <p className="text-foreground/60 font-medium">Choose the services you&apos;d like to book.</p>
                                        </div>
                                        <div className="grid gap-3">
                                            {service.services.map((s) => (
                                                <div
                                                    key={s.name}
                                                    onClick={() => toggleService(s.name)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                                        bookingState.selectedServices.includes(s.name)
                                                            ? 'bg-primary/5 border-primary shadow-sm'
                                                            : 'bg-white/40 dark:bg-white/5 border-transparent hover:border-primary/30'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                            bookingState.selectedServices.includes(s.name)
                                                                ? 'bg-primary border-primary'
                                                                : 'bg-transparent border-gray-300 dark:border-white/20'
                                                        )}>
                                                            {bookingState.selectedServices.includes(s.name) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors block">{s.name}</span>
                                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                                <Clock className="h-3 w-3" /> 60 Mins
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-extrabold text-primary block">₦{(s.price * priceMultiplier).toLocaleString()}</span>
                                                        {isCEOSelected && (
                                                            <span className="text-[8px] font-bold text-amber-600 uppercase tracking-tighter">Director Rate</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === "datetime" && (
                                    <div className="space-y-8">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Date & Time</h3>
                                            <p className="text-foreground/60 font-medium">When should we arrive?</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarIcon className="h-4 w-4 text-primary" />
                                                <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Select Date</span>
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                                {calendarDays.map((date, i) => {
                                                    const isSelected = bookingState.date?.toDateString() === date.toDateString();
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => updateState('date', date)}
                                                            className={cn(
                                                                "flex-shrink-0 w-16 h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                                                                isSelected
                                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                                    : "bg-white/40 dark:bg-white/5 border-transparent hover:border-primary/30"
                                                            )}
                                                        >
                                                            <span className="text-[10px] font-bold uppercase opacity-60">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                            <span className="text-xl font-extrabold">{date.getDate()}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Select Time</span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {timeSlots.map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => updateState('timeSlot', time)}
                                                        className={cn(
                                                            "py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all",
                                                            bookingState.timeSlot === time
                                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                                : "bg-white/40 dark:bg-white/5 border-transparent hover:border-primary/30 text-foreground/80"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === "customization" && (
                                    <div className="space-y-8">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Customize</h3>
                                            <p className="text-foreground/60 font-medium">Tailor your experience.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Reference Photo (Optional)</label>
                                                <div className="h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 bg-white/40 dark:bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <UploadCloud className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <p className="text-xs font-bold text-foreground/60">Click to upload reference</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Special Instructions</label>
                                                <Textarea
                                                    placeholder="E.g. I have sensitive skin, please use hypoallergenic products..."
                                                    className="min-h-[120px] rounded-2xl border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 focus:ring-primary/20"
                                                    value={bookingState.specialNote}
                                                    onChange={(e) => updateState('specialNote', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === "staff" && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Choose Professional</h3>
                                            <p className="text-foreground/60 font-medium">Select who you&apos;d like to work with.</p>
                                        </div>

                                        <div className="grid gap-4">
                                            {/* Smart Match Option */}
                                            <div
                                                onClick={() => updateState('staffId', 'AUTO')}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group",
                                                    bookingState.staffId === 'AUTO'
                                                        ? 'bg-primary/5 border-primary shadow-sm'
                                                        : 'bg-white/40 dark:bg-white/5 border-transparent hover:border-primary/30'
                                                )}
                                            >
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                                    <Sparkles className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">✨ Ask <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span></p>
                                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                                        Let Maestro find the perfect artisan for your specific needs.
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                    bookingState.staffId === 'AUTO' ? 'bg-primary border-primary' : 'bg-transparent border-gray-300 dark:border-white/20'
                                                )}>
                                                    {bookingState.staffId === 'AUTO' && <div className="h-2 w-2 rounded-full bg-white" />}
                                                </div>
                                            </div>

                                            {MOCK_STAFF.filter(s => s.availableForBookings || !s.isOwner).map((staff) => (
                                                <div
                                                    key={staff.id}
                                                    onClick={() => updateState('staffId', staff.id)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group",
                                                        bookingState.staffId === staff.id
                                                            ? 'bg-primary/5 border-primary shadow-sm'
                                                            : 'bg-white/40 dark:bg-white/5 border-transparent hover:border-primary/30',
                                                        staff.isOwner && "ring-2 ring-amber-500/30 border-amber-500/30 bg-amber-500/5"
                                                    )}
                                                >
                                                    <Avatar className={cn(
                                                        "h-12 w-12 rounded-xl border-2 shadow-sm",
                                                        staff.isOwner ? "border-amber-500" : "border-white dark:border-white/10"
                                                    )}>
                                                        <AvatarImage src={staff.image} />
                                                        <AvatarFallback>{staff.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{staff.name}</p>
                                                            {staff.isOwner && (
                                                                <Badge className="bg-amber-500 text-white border-0 text-[8px] font-extrabold px-1.5 py-0">
                                                                    ✨ PREMIUM
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{staff.role}</span>
                                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                                <Star className="h-3 w-3 fill-amber-500" />
                                                                <span className="text-[10px] font-bold">{staff.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                        bookingState.staffId === staff.id ? 'bg-primary border-primary' : 'bg-transparent border-gray-300 dark:border-white/20'
                                                    )}>
                                                        {bookingState.staffId === staff.id && <div className="h-2 w-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === "summary" && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Review & Pay</h3>
                                            <p className="text-foreground/60 font-medium">Secure your booking with escrow.</p>
                                        </div>

                                        <GlassCard className="p-6 border-primary/10 bg-primary/[0.02]">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-2">Services</p>
                                                        <div className="space-y-1">
                                                            {bookingState.selectedServices.map(s => (
                                                                <div key={s} className="flex items-center gap-2">
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s}</p>
                                                                    <span className="text-[10px] font-bold text-foreground/40">• 60 Mins</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-primary/5" />

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Date & Time</p>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {bookingState.date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {bookingState.timeSlot}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Professional</p>
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {selectedStaffMember?.name}
                                                            </p>
                                                            {bookingState.staffId === 'AUTO' && (
                                                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                                                    <Sparkles className="h-3 w-3" /> <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro&apos;s</span> Choice (Pending Assignment)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-primary/5" />

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-foreground/60 font-medium">Subtotal</span>
                                                        <span className="font-bold">₦{totalAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-foreground/60 font-medium">Escrow Fee (2%)</span>
                                                        <span className="font-bold text-foreground/60">₦{escrowFee.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xl mt-2 pt-2 border-t border-dashed border-primary/20">
                                                        <span className="font-extrabold text-primary">Total</span>
                                                        <span className="font-extrabold text-primary">₦{finalTotal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>

                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                                            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Secure Escrow Payment</p>
                                                <p className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                                                    Your payment is held safely in escrow. The provider only gets paid after you confirm the service is completed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === "success" && (
                                    <div className="py-8 text-center space-y-6">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring" }}
                                            className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto"
                                        >
                                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                        </motion.div>

                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h3>
                                            <p className="text-foreground/60 font-medium">Your payment is securely held in escrow.</p>
                                        </div>

                                        <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-6 border border-glass-border max-w-sm mx-auto text-left relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40">Ticket ID</span>
                                                <span className="font-mono font-bold text-primary">{bookingState.ticketId}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-foreground/60">Status</span>
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Paid (Escrow)</Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-foreground/60">Date</span>
                                                    <span className="text-sm font-bold">{bookingState.date?.toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-foreground/60">Time</span>
                                                    <span className="text-sm font-bold">{bookingState.timeSlot}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-foreground/60">Staff</span>
                                                    <span className="text-sm font-bold">{selectedStaffMember?.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button onClick={onClose} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl h-12 px-8 font-bold w-full">
                                            View My Bookings
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    {step !== "success" && (
                        <div className="p-6 border-t border-glass-border bg-white/40 dark:bg-white/5 flex gap-4 backdrop-blur-xl">
                            {step !== "services" && (
                                <Button variant="ghost" onClick={handleBack} className="h-12 px-6 rounded-xl font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                            <Button
                                disabled={
                                    (step === "services" && bookingState.selectedServices.length === 0) ||
                                    (step === "datetime" && (!bookingState.date || !bookingState.timeSlot)) ||
                                    isLoading
                                }
                                onClick={handleNext}
                                className={cn(
                                    "h-12 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20 transition-all",
                                    step === "summary"
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "bg-primary hover:bg-primary/90 text-white"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                    </>
                                ) : step === "summary" ? (
                                    <>
                                        Pay & Secure Booking <ShieldCheck className="ml-2 h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </GlassCard>
            </DialogContent>
        </Dialog>
    );
}
