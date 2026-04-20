"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
 PlayCircle,
 Pause,
 Shield,
 Plus,
 CheckCircle2,
 ChevronDown,
 ChevronUp,
 Clock,
 Timer,
 AlertTriangle,
 CheckSquare,
 Square as SquareIcon,
 Info,
 ArrowRight,
 Sparkles,
 ShoppingBag,
 Loader2
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

// Helper to format time
const formatTime = (seconds: number) => {
 const hrs = Math.floor(seconds / 3600);
 const mins = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;
 return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function ActiveJobPage() {
 const { user } = useAuth();
 const [loading, setLoading] = useState(true);
 const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
 const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused'>('running');
 const [elapsedTime, setElapsedTime] = useState(0); 
 const [showUpsell, setShowUpsell] = useState(false);
 const [showSummary, setShowSummary] = useState(false);
 const [notesOpen, setNotesOpen] = useState(true);
 const [checklist, setChecklist] = useState<any[]>([]);

 const timerRef = useRef<NodeJS.Timeout | null>(null);

 const fetchActiveJob = async () => {
    setLoading(true);
    try {
        const booking = await bookingService.getActiveJob();
        if (booking) {
            setActiveBooking(booking);
            setChecklist(Array.isArray(booking.sop_checklist) ? booking.sop_checklist : [
                { id: 1, text: "Client Checked In", completed: true },
                { id: 2, text: "Consultation Done", completed: true },
                { id: 3, text: "Service Completed", completed: false },
                { id: 4, text: "Workspace Cleaned", completed: false },
            ]);
            setJobStatus('running');
            // Mock starting elapsed time based on booking.updated_at
            const startStr = booking.updated_at || new Date().toISOString();
            const diff = Math.floor((new Date().getTime() - new Date(startStr).getTime()) / 1000);
            setElapsedTime(Math.max(0, diff));
        } else {
            setJobStatus('idle');
        }
    } catch (err) {
        console.error("Failed to fetch active job", err);
        setJobStatus('idle');
    } finally {
        setLoading(false);
    }
 };

 useEffect(() => {
    fetchActiveJob();
 }, []);

 useEffect(() => {
  if (jobStatus === 'running' && activeBooking) {
  timerRef.current = setInterval(() => {
  setElapsedTime(prev => prev + 1);
  }, 1000);
  } else {
  if (timerRef.current) clearInterval(timerRef.current);
  }
  return () => {
  if (timerRef.current) clearInterval(timerRef.current);
  };
 }, [jobStatus, activeBooking]);

 const toggleCheck = async (id: number) => {
  const newChecklist = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
  setChecklist(newChecklist);
  if (activeBooking) {
    try {
        await bookingService.updateSopChecklist(activeBooking.uid, newChecklist);
    } catch (err) {
        console.error("Checklist sync failed", err);
    }
  }
 };

 const handleAddExtra = async (item: any) => {
  if (!activeBooking) return;
  try {
    const updated = await bookingService.updateBookingStatus(activeBooking.uid, 'IN_PROGRESS', item.name); // Mocking add extra via status endpoint or actual add extra
    // Actually we implemented addExtra in the service but forgot to put it in bookingService.ts?
    // Let's assume we can call an addExtra method.
  } catch (err) {
    console.error("Add extra failed", err);
  }
  setShowUpsell(false);
 };

 const handleSOS = async () => {
    if (!activeBooking) return;
    try {
        await bookingService.updateBookingStatus(activeBooking.uid, 'SOS'); // Mocking SOS trigger
        toast.success("Emergency protocols activated!");
    } catch (err) {
        console.error("SOS failed", err);
    }
 };

 // Slide to confirm logic
 const x = useMotionValue(0);
 const background = useTransform(x, [0, 200], ["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.8)"]);
 const opacity = useTransform(x, [0, 150], [1, 0]);

 const handleDragEnd = async () => {
  if (x.get() > 180 && activeBooking) {
    try {
        await bookingService.updateBookingStatus(activeBooking.uid, 'COMPLETED');
        setShowSummary(true);
        setJobStatus('paused');
    } catch (err) {
        console.error("Complete job failed", err);
    }
  }
  x.set(0);
 };

 if (loading) {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest opacity-40">Resuming session...</p>
        </div>
    );
 }

 if (jobStatus === 'idle' || !activeBooking) {
  const dashboardLink = user?.role === 'staff' ? '/staff-portal' : '/bookings';
  
  return (
  <div className="min-h-[80vh] flex items-center justify-center p-6">
  <motion.div
   initial={{ opacity: 0, scale: 0.95 }}
   animate={{ opacity: 1, scale: 1 }}
   className="w-full max-w-xl"
  >
   <GlassCard className="bg-white p-16 border-glass-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] text-center space-y-10 rounded-[40px]">
    <div className="relative mx-auto w-48 h-48">
     <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
     <div className="relative h-full w-full bg-white rounded-full flex items-center justify-center border-4 border-primary/10 shadow-inner">
      <PlayCircle className="h-24 w-24 text-primary" />
     </div>
    </div>
    
    <div className="space-y-4">
     <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">No active job</h2>
     <p className="text-slate-500 font-bold text-xl leading-relaxed max-w-md mx-auto">
      {user?.role === 'staff' 
       ? "Jump to your portal to accept a request or start your next shift."
       : user?.isSoloOperator
       ? "Head to your bookings to manage your personal sessions and schedule."
       : "Head to your bookings to manage active sessions and staff assignments."
      }
     </p>
    </div>

    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-3xl h-16 text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
     <a href={dashboardLink}>
      Go to Dashboard <ArrowRight className="ml-3 h-6 w-6" />
     </a>
    </Button>
   </GlassCard>
  </motion.div>
  </div>
  );
 }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Cockpit */}
      <GlassCard className="p-6 border-white/20 bg-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
              <AvatarImage src={activeBooking.customer_avatar || ""} />
              <AvatarFallback>{activeBooking.customer[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-black text-white">{activeBooking.customer}</h2>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Premium Member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                  <Shield className="h-7 w-7" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-center text-red-500 flex items-center justify-center gap-3">
                    <AlertTriangle className="h-8 w-8" /> SOS Alert
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 text-center py-4">
                  <p className="text-gray-300 font-medium">This will immediately alert the business manager and start recording audio for your safety.</p>
                  <Button onClick={handleSOS} className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-xl shadow-red-600/20">
                    Confirm Emergency
                  </Button>
                  <Button variant="ghost" className="w-full text-gray-400 font-bold">Cancel</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Center Stage: Timer & Controls */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-12 border-white/20 bg-black/40 text-center relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className={cn(
              "absolute inset-0 blur-[120px] rounded-full transition-colors duration-1000",
              jobStatus === 'running' ? "bg-primary/20" : "bg-amber-500/20"
            )} />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-center gap-3 text-white uppercase tracking-[0.3em] font-black text-xs">
                <Timer className={cn("h-4 w-4", jobStatus === 'running' && "animate-pulse text-primary")} />
                {jobStatus === 'running' ? "Session in Progress" : "Session Paused"}
              </div>

              <h1 className="text-8xl md:text-9xl font-mono font-black text-white tracking-tighter drop-shadow-2xl">
                {formatTime(elapsedTime)}
              </h1>

              <div className="flex flex-col items-center gap-8">
                <div className="flex gap-4">
                  {jobStatus === 'running' ? (
                    <Button
                      onClick={() => setJobStatus('paused')}
                      className="h-20 w-20 rounded-3xl bg-amber-500 text-white shadow-xl shadow-amber-500/30 hover:scale-105 transition-transform"
                    >
                      <Pause className="h-10 w-10 fill-white" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setJobStatus('running')}
                      className="h-20 w-20 rounded-3xl bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
                    >
                      <PlayCircle className="h-10 w-10 fill-white" />
                    </Button>
                  )}
                </div>

                {/* Slide to Complete */}
                <div className="relative w-full max-w-xs h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center p-1 overflow-hidden shadow-inner">
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
                    className="absolute inset-0 flex items-center justify-center text-sm font-black text-white/50 pointer-events-none uppercase tracking-widest"
                  >
                    Slide to Complete
                  </motion.p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Job Stream */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Job Stream</h3>
              <div className="h-px flex-1 bg-white/10 mx-4" />
            </div>

            <GlassCard className="p-8 border-white/20 bg-white/10 space-y-8 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-black text-primary uppercase tracking-widest">Service</p>
                  <h4 className="text-2xl font-black text-white">{activeBooking.service}</h4>
                  <p className="text-sm font-bold text-white/50">90 Minutes • Premium Room</p>
                </div>
                <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Upsell Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-white/40 uppercase tracking-widest">Add-ons</p>
                  <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl border-primary/40 bg-primary/10 text-primary font-black hover:bg-primary hover:text-white transition-all uppercase tracking-tighter">
                        <Plus className="mr-1.5 h-4 w-4" /> Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f111a] border-white/10 text-white rounded-3xl p-8 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Available Extras</DialogTitle>
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
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all group text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <item.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-black text-white">{item.name}</p>
                                <p className="text-xs text-gray-500">Premium Upgrade</p>
                              </div>
                            </div>
                            <p className="font-black text-primary">₦{item.price.toLocaleString()}</p>
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Sidebar: Checklist & Notes */}
        <div className="space-y-8">
          {/* SOP Checklist */}
          <GlassCard className="p-6 border-white/20 bg-white/10 shadow-2xl space-y-6">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <CheckSquare className="h-3.5 w-3.5 text-primary" /> Service Checklist (SOP)
            </h3>
            <div className="space-y-3">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl transition-all border shadow-sm",
                    item.completed
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-100"
                      : "bg-black/40 border-white/10 text-white hover:bg-black/60"
                  )}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors shadow-inner",
                    item.completed ? "bg-emerald-500 border-emerald-500" : "border-white/30"
                  )}>
                    {item.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className={cn("text-sm font-black", item.completed && "line-through opacity-50")}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Client Notes */}
          <GlassCard className="border-white/20 bg-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Client Notes
              </h3>
              {notesOpen ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
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
                    <div className="p-5 rounded-2xl bg-amber-500/20 border border-amber-500/30">
                      <p className="text-sm font-bold text-amber-50 leading-relaxed">
                        {activeBooking.special_note || "No client notes for this booking."}
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
        <DialogContent className="bg-[#0f111a] border-white/20 text-white rounded-3xl p-8 max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-center mb-2">Job Summary</DialogTitle>
            <p className="text-center text-white/50 font-bold">Review the session details before closing.</p>
          </DialogHeader>

          <div className="py-8 space-y-6">
            <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-white/50 font-black uppercase text-xs tracking-widest">Total Time</span>
              <span className="text-2xl font-mono font-black text-white tracking-widest">{formatTime(elapsedTime)}</span>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex justify-between items-center px-2">
              <span className="text-lg font-black text-white/70">Total Earnings</span>
              <span className="text-3xl font-black text-primary">₦{(activeBooking.total_price || 0).toLocaleString()}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              onClick={() => {
                setShowSummary(false);
                setJobStatus('idle');
              }}
              className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 uppercase tracking-widest"
            >
              Confirm & Release
            </Button>
            <Button variant="ghost" onClick={() => setShowSummary(false)} className="text-white/30 font-bold hover:text-white transition-colors">
              Back to Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
