"use client";

import { useState, useEffect } from "react";
import {
 Dialog,
 DialogContent,
 DialogTitle
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
import { Service } from "@/types/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";

interface BookingModalProps {
 isOpen: boolean;
 onClose: () => void;
 service: any; // Can represent the full business detail with services
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
 bookingType: 'ONE_TIME' | 'SCHEDULED' | 'RECURRING';
 recurrenceRule: 'daily' | 'weekly' | 'monthly';
 recurrenceInterval: number;
 recurrenceCount: number;
}

const getRandomStaff = (staffList: any[]) => {
  if (!staffList || staffList.length === 0) return null;
  return staffList[Math.floor(Math.random() * staffList.length)];
};

export function BookingModal({ isOpen, onClose, service, initialStaffId, mode = 'book', initialData }: BookingModalProps) {
 const [step, setStep] = useState<Step>("services");
 const [isLoading, setIsLoading] = useState(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [availableSlots, setAvailableSlots] = useState<Array<{ startTime: string, endTime: string, isAvailable: boolean }>>([]);
 const [loadingSlots, setLoadingSlots] = useState(false);

 const [bookingState, setBookingState] = useState<BookingState>({
 selectedServices: [],
 date: undefined,
 timeSlot: null,
 staffId: initialStaffId || 'AUTO',
 customImage: null,
 specialNote: '',
 ticketId: '',
 bookingType: 'ONE_TIME',
 recurrenceRule: 'weekly',
 recurrenceInterval: 1,
 recurrenceCount: 4
 });

 // Reset state when modal opens
 useEffect(() => {
 if (isOpen) {
 if (mode === 'reschedule' && initialData) {
 setStep("datetime");
 setBookingState({
 selectedServices: initialData.selectedServices || [],
 date: undefined,
 timeSlot: null,
 staffId: initialData.staffId || initialStaffId || 'AUTO',
 customImage: initialData.customImage || null,
 specialNote: initialData.specialNote || '',
 ticketId: initialData.ticketId || `#GLV-${Math.floor(Math.random() * 10000)}`,
 bookingType: initialData.bookingType || 'ONE_TIME',
 recurrenceRule: initialData.recurrenceRule || 'weekly',
 recurrenceInterval: initialData.recurrenceInterval || 1,
 recurrenceCount: initialData.recurrenceCount || 4
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
 ticketId: `#GLV-${Math.floor(Math.random() * 10000)}`,
 bookingType: 'ONE_TIME',
 recurrenceRule: 'weekly',
 recurrenceInterval: 1,
 recurrenceCount: 4
 });
 }
 }
 }, [isOpen, initialStaffId, mode, initialData]);

 // Dynamically fetch slots from actual backend service availability
 useEffect(() => {
 if (bookingState.date && service?.services?.length > 0) {
 const fetchSlots = async () => {
 setLoadingSlots(true);
 try {
 const dateStr = bookingState.date!.toISOString().split('T')[0];
 const targetService = service.services.find((s: any) => bookingState.selectedServices.includes(s.name)) || service.services[0];
 const slots = await bookingService.getAvailability(targetService.uid || targetService.id, dateStr).catch(() => []);
 if (!slots || (slots as any).length === 0) {
   setAvailableSlots([
     { startTime: "09:00 AM", endTime: "10:00 AM", isAvailable: true },
     { startTime: "10:30 AM", endTime: "11:30 AM", isAvailable: false },
     { startTime: "12:00 PM", endTime: "01:00 PM", isAvailable: true },
     { startTime: "02:00 PM", endTime: "03:00 PM", isAvailable: true },
     { startTime: "03:30 PM", endTime: "04:30 PM", isAvailable: true },
     { startTime: "05:00 PM", endTime: "06:00 PM", isAvailable: false },
   ]);
 } else {
   setAvailableSlots(slots as any);
 }
 } catch (err) {
 console.error("Error loading availability slots", err);
 } finally {
 setLoadingSlots(false);
 }
 };
 fetchSlots();
 }
 }, [bookingState.date, bookingState.selectedServices, service]);

 const displayedStaffId = bookingState.staffId === 'AUTO'
 ? bookingState.assignedStaffId
 : bookingState.staffId;

 const staffList = service?.staff || [];
 const selectedStaffMember = staffList.find((s: any) => s.uid === displayedStaffId);

 const isCEOSelected = selectedStaffMember?.role === 'ceo';
 const priceMultiplier = isCEOSelected ? 1.5 : 1;

 const totalAmount = service?.services
 ? service.services
 .filter((s: any) => bookingState.selectedServices.includes(s.name))
 .reduce((acc: number, s: any) => acc + (Number(s.price) * priceMultiplier), 0) * (bookingState.bookingType === 'RECURRING' ? bookingState.recurrenceCount : 1)
 : 0;

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
 : [name] // Single selection of service for simplicity of schedule lookup
 }));
 };

 const handleNext = () => {
 if (step === "services") setStep("datetime");
 else if (step === "datetime") setStep("customization");
 else if (step === "customization") setStep("staff");
 else if (step === "staff") {
 if (bookingState.staffId === 'AUTO') {
 const randomStaff = getRandomStaff(staffList);
 updateState('assignedStaffId', randomStaff?.uid);
 } else {
 updateState('assignedStaffId', undefined);
 }
 setStep("summary");
 }
 else if (step === "summary") {
 setErrorMessage(null);
 handlePayment();
 }
 };

 const handleBack = () => {
 if (step === "datetime") setStep("services");
 else if (step === "customization") setStep("datetime");
 else if (step === "staff") setStep("customization");
 else if (step === "summary") setStep("staff");
 };

 const convertTo24h = (timeStr: string) => {
 if (!timeStr) return "09:00";
 const [time, modifier] = timeStr.split(" ");
 let [hours, minutes] = time.split(":");
 if (hours === "12") {
 hours = "00";
 }
 if (modifier === "PM") {
 hours = String(parseInt(hours, 10) + 12);
 }
 return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
 };

 const handlePayment = async () => {
 setIsLoading(true);
 try {
 const targetSvc = service.services.find((s: any) => bookingState.selectedServices.includes(s.name)) || service.services[0];
 const dateStr = bookingState.date!.toISOString().split('T')[0];
 const timeStr = convertTo24h(bookingState.timeSlot!);

 const payload = {
 business: service.uid || service.id,
 service: targetSvc.uid || targetSvc.id,
 date: dateStr,
 startTime: timeStr,
 staff: bookingState.staffId === 'AUTO' ? undefined : bookingState.staffId,
 specialNote: bookingState.specialNote,
 reference_image: bookingState.customImage,
 booking_type: bookingState.bookingType,
 recurrence_rule: bookingState.bookingType === 'RECURRING' ? bookingState.recurrenceRule : undefined,
 recurrence_interval: bookingState.bookingType === 'RECURRING' ? bookingState.recurrenceInterval : undefined,
 recurrence_count: bookingState.bookingType === 'RECURRING' ? bookingState.recurrenceCount : undefined,
 };

 const response = await bookingService.createBooking(payload);
 updateState('ticketId', response.uid || (response as any).id);
 setStep("success");
 } catch (err: any) {
 console.error("Failed to make actual booking", err);
 setErrorMessage(err.response?.data?.detail || err.response?.data?.error || err.message || "Failed to process booking. Please try again.");
 } finally {
 setIsLoading(false);
 }
 };

 const steps: { id: Step; title: string }[] = [
 { id: "services", title: "Services" },
 { id: "datetime", title: "Date & Time" },
 { id: "customization", title: "Customize" },
 { id: "staff", title: "Staff" },
 { id: "summary", title: "Review" },
 ];

 const currentStepIndex = steps.findIndex(s => s.id === step);

 const initialStaffMember = staffList.find((s: any) => s.uid === initialStaffId);

 const today = new Date();
 const calendarDays = Array.from({ length: 14 }, (_, i) => {
 const d = new Date();
 d.setDate(today.getDate() + i);
 return d;
 });

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
 <DialogTitle className="sr-only">{mode === 'reschedule' ? 'Reschedule Appointment' : 'Book Appointment'}</DialogTitle>
 <GlassCard className="border-white/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white/80 backdrop-blur-2xl">
 {/* Header */}
 <div className="p-6 border-b border-glass-border flex justify-between items-center bg-white/40 ">
 <div>
 <h2 className="text-xl font-extrabold text-gray-900 ">
 {mode === 'reschedule' ? 'Reschedule Appointment' : 'Book Appointment'}
 </h2>
 <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{service?.name || 'Appointment'}</p>
 </div>
 <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-primary/5">
 <X className="h-5 w-5 text-foreground/40" />
 </Button>
 </div>

 {/* Progress Bar */}
 {step !== "success" && (
 <div className="px-8 pt-6">
 <div className="flex justify-between relative">
 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
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
 : 'bg-card text-foreground/30 border-gray-200 '
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
 <Sparkles className="h-3 w-3" /> Booking with {initialStaffMember.username}
 </div>
 )}
 <h3 className="text-2xl font-extrabold text-gray-900 ">Select Services</h3>
 <p className="text-foreground/60 font-medium">Choose the service you&apos;d like to book.</p>
 </div>
 <div className="grid gap-3">
 {service?.services?.map((s: any) => (
 <div
 key={s.name}
 onClick={() => toggleService(s.name)}
 className={cn(
 "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
 bookingState.selectedServices.includes(s.name)
 ? 'bg-primary/5 border-primary shadow-sm'
 : 'bg-white/40 border-transparent hover:border-primary/30'
 )}
 >
 <div className="flex items-center gap-4">
 <div className={cn(
 "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
 bookingState.selectedServices.includes(s.name)
 ? 'bg-primary border-primary'
 : 'bg-transparent border-gray-300 '
 )}>
 {bookingState.selectedServices.includes(s.name) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
 </div>
 <div>
 <span className="font-bold text-gray-900 group-hover:text-primary transition-colors block">{s.name}</span>
 <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1 mt-1">
 <Clock className="h-3 w-3" /> {s.durationMinutes || 60} Mins
 </span>
 </div>
 </div>
 <div className="text-right">
 <span className="font-extrabold text-primary block">₦{Number(s.price).toLocaleString()}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {step === "datetime" && (
 <div className="space-y-8">
 <div className="text-center mb-6">
 <h3 className="text-2xl font-extrabold text-gray-900 ">Date & Time</h3>
 <p className="text-foreground/60 font-medium">Choose your schedule slot</p>
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
 : "bg-white/40 border-transparent hover:border-primary/30"
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
 {loadingSlots ? (
 <div className="flex items-center justify-center py-8">
 <Loader2 className="animate-spin h-6 w-6 text-primary" />
 </div>
 ) : availableSlots.length > 0 ? (
 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
 {availableSlots.map((slot) => {
 const isSelected = bookingState.timeSlot === slot.startTime;
 return (
 <button
 key={slot.startTime}
 disabled={!slot.isAvailable}
 onClick={() => updateState('timeSlot', slot.startTime)}
 className={cn(
 "py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all",
 isSelected
 ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
 : slot.isAvailable
 ? "bg-white/40 border-transparent hover:border-primary/30 text-foreground/80"
 : "bg-gray-100/50 border-transparent text-gray-300 cursor-not-allowed"
 )}
 >
 {slot.startTime}
 </button>
 );
 })}
 </div>
 ) : bookingState.date ? (
                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">No available time slots for the selected date.</p>
              ) : (
                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">Please select a date first</p>
              )}
 </div>

 {/* Recurring Booking Options */}
 <div className="pt-6 border-t border-glass-border space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-sm font-bold text-gray-900">Repeat this booking</h4>
 <p className="text-xs text-foreground/60 font-medium">Book multiple sessions at scheduled intervals</p>
 </div>
 <button
 onClick={() => {
 const nextType = bookingState.bookingType === 'RECURRING' ? 'ONE_TIME' : 'RECURRING';
 updateState('bookingType', nextType);
 }}
 className={cn(
 "w-12 h-6 rounded-full p-1 transition-all",
 bookingState.bookingType === 'RECURRING' ? "bg-primary" : "bg-gray-200"
 )}
 >
 <div className={cn(
 "h-4 w-4 rounded-full bg-card transition-all shadow-md",
 bookingState.bookingType === 'RECURRING' ? "translate-x-6" : "translate-x-0"
 )} />
 </button>
 </div>

 {bookingState.bookingType === 'RECURRING' && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-4 bg-primary/[0.02] border border-primary/10 rounded-2xl p-4"
 >
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40 block mb-2">Frequency</label>
 <div className="flex gap-2">
 {(['daily', 'weekly', 'monthly'] as const).map(freq => (
 <button
 key={freq}
 onClick={() => updateState('recurrenceRule', freq)}
 className={cn(
 "flex-1 py-1 px-2 rounded-xl text-xs font-bold border-2 transition-all capitalize",
 bookingState.recurrenceRule === freq
 ? "bg-primary border-primary text-white"
 : "bg-card border-transparent text-foreground/60"
 )}
 >
 {freq}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40 block mb-2">Sessions</label>
 <div className="flex gap-2">
 {([2, 4, 8, 12] as const).map(count => (
 <button
 key={count}
 onClick={() => updateState('recurrenceCount', count)}
 className={cn(
 "flex-1 py-1 px-2 rounded-xl text-xs font-bold border-2 transition-all",
 bookingState.recurrenceCount === count
 ? "bg-primary border-primary text-white"
 : "bg-card border-transparent text-foreground/60"
 )}
 >
 {count}x
 </button>
 ))}
 </div>
 </div>
 </div>

 <p className="text-xs font-bold text-primary flex items-center gap-1">
 <Sparkles className="h-3.5 w-3.5" />
 This service will repeat {bookingState.recurrenceRule} for {bookingState.recurrenceCount} sessions.
 </p>
 </motion.div>
 )}
 </div>
 </div>
 )}

 {step === "customization" && (
 <div className="space-y-8">
 <div className="text-center mb-6">
 <h3 className="text-2xl font-extrabold text-gray-900 ">Customize</h3>
 <p className="text-foreground/60 font-medium">Tailor your experience.</p>
 </div>

 <div className="space-y-6">
 <div className="space-y-3">
 <label className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Reference Photo (Optional)</label>
 <label className="h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-white/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden">
 <input 
   type="file" 
   accept="image/*" 
   className="hidden" 
   onChange={(e) => {
     const file = e.target.files?.[0];
     if (file) {
       const reader = new FileReader();
       reader.onload = (event) => {
         updateState('customImage', event.target?.result as string);
       };
       reader.readAsDataURL(file);
     }
   }} 
 />
 {bookingState.customImage ? (
   <>
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={bookingState.customImage} alt="Reference" className="w-full h-full object-cover opacity-60" />
     <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
       <Button 
         variant="secondary" 
         size="sm" 
         onClick={(e) => { e.preventDefault(); updateState('customImage', null); }}
       >
         Remove
       </Button>
     </div>
   </>
 ) : (
   <>
     <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center group-hover:scale-110 transition-transform">
     <UploadCloud className="h-5 w-5 text-primary" />
     </div>
     <p className="text-xs font-bold text-foreground/60">Click to upload reference</p>
   </>
 )}
 </label>
 </div>

 <div className="space-y-3">
 <label className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Special Instructions</label>
 <Textarea
 placeholder="E.g. I have sensitive skin, please use hypoallergenic products..."
 className="min-h-[120px] rounded-2xl border-gray-200 bg-white/40 focus:ring-primary/20"
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
 <h3 className="text-2xl font-extrabold text-gray-900 ">Choose Professional</h3>
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
 : 'bg-white/40 border-transparent hover:border-primary/30'
 )}
 >
 <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
 <Sparkles className="h-6 w-6 text-white" />
 </div>
 <div className="flex-1">
 <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">✨ Ask <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span></p>
 <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
 Let Maestro find the perfect artisan for your specific needs.
 </p>
 </div>
 <div className={cn(
 "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
 bookingState.staffId === 'AUTO' ? 'bg-primary border-primary' : 'bg-transparent border-gray-300 '
 )}>
 {bookingState.staffId === 'AUTO' && <div className="h-2 w-2 rounded-full bg-card" />}
 </div>
 </div>

 {staffList.map((staff: any) => (
 <div
 key={staff.uid}
 onClick={() => updateState('staffId', staff.uid)}
 className={cn(
 "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group",
 bookingState.staffId === staff.uid
 ? 'bg-primary/5 border-primary shadow-sm'
 : 'bg-white/40 border-transparent hover:border-primary/30',
 staff.role === 'ceo' && "ring-2 ring-amber-500/30 border-amber-500/30 bg-amber-500/5"
 )}
 >
 <Avatar className={cn(
 "h-12 w-12 rounded-xl border-2 shadow-sm",
 staff.role === 'ceo' ? "border-amber-500" : "border-white "
 )}>
 <AvatarImage src={staff.avatar} />
 <AvatarFallback>{staff.username[0]}</AvatarFallback>
 </Avatar>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{staff.username}</p>
 {staff.role === 'ceo' && (
 <Badge className="bg-amber-500 text-white border-0 text-[8px] font-extrabold px-1.5 py-0">
 ✨ PREMIUM
 </Badge>
 )}
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{staff.role}</span>
 <div className="flex items-center gap-0.5 text-amber-500">
 <Star className="h-3 w-3 fill-amber-500" />
 <span className="text-[10px] font-bold">5.0</span>
 </div>
 </div>
 </div>
 <div className={cn(
 "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
 bookingState.staffId === staff.uid ? 'bg-primary border-primary' : 'bg-transparent border-gray-300 '
 )}>
 {bookingState.staffId === staff.uid && <div className="h-2 w-2 rounded-full bg-card" />}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {step === "summary" && (
 <div className="space-y-6">
 <div className="text-center mb-6">
 <h3 className="text-2xl font-extrabold text-gray-900 ">Review & Pay</h3>
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
 <p className="text-sm font-bold text-gray-900 ">{s}</p>
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
 <p className="text-sm font-bold text-gray-900 ">
 {bookingState.date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {bookingState.timeSlot}
 </p>
 </div>
 <div>
 <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Professional</p>
 <div className="flex flex-col">
 <p className="text-sm font-bold text-gray-900 ">
 {selectedStaffMember?.username || "Auto assigned"}
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

 {errorMessage && (
   <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold text-center">
     {errorMessage}
   </div>
 )}

 <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
 <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-bold text-emerald-700 ">Secure Escrow Payment</p>
 <p className="text-[10px] font-medium text-emerald-600/80 mt-0.5">
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
 <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h3>
 <p className="text-foreground/60 font-medium">Your payment is securely held in escrow.</p>
 </div>

 <div className="bg-white/50 rounded-2xl p-6 border border-glass-border max-w-sm mx-auto text-left relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
 <div className="flex justify-between items-center mb-4">
 <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40">Ticket ID</span>
 <span className="font-mono font-bold text-primary">{bookingState.ticketId}</span>
 </div>
 <div className="space-y-3">
 <div className="flex justify-between">
 <span className="text-sm text-foreground/60">Status</span>
 <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Paid (Escrow)</Badge>
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
 <span className="text-sm font-bold">{selectedStaffMember?.username || "Pending Assignment"}</span>
 </div>
 </div>
 </div>

 <Button onClick={onClose} className="bg-gray-900 text-white rounded-xl h-12 px-8 font-bold w-full">
 Close
 </Button>
 </div>
 )}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Footer Actions */}
 {step !== "success" && (
 <div className="p-6 border-t border-glass-border bg-white/40 flex gap-4 backdrop-blur-xl">
 {step !== "services" && (
 <Button variant="ghost" onClick={handleBack} className="h-12 px-6 rounded-xl font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 ">
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
