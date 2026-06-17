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
  const [sosOpen, setSosOpen] = useState(false);

 const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActiveJob = async () => {
    setLoading(true);
    try {
        const booking = await bookingService.getActiveJob();
        if (booking) {
            setActiveBooking(booking);
            setChecklist(Array.isArray(booking.sopChecklist) ? booking.sopChecklist : [
                { id: 1, text: "Client Checked In", completed: true },
                { id: 2, text: "Consultation Done", completed: true },
                { id: 3, text: "Service Completed", completed: false },
                { id: 4, text: "Workspace Cleaned", completed: false },
            ]);
            setJobStatus('running');
            // Starting elapsed time based on booking.updatedAt
            const startStr = booking.updatedAt || new Date().toISOString();
            const diff = Math.floor((new Date().getTime() - new Date(startStr).getTime()) / 1000);
            setElapsedTime(Math.max(0, diff));
        } else {
            setActiveBooking(null);
            setJobStatus('idle');
            setElapsedTime(0);
        }
    } catch (err) {
        console.error("Failed to fetch active job", err);
        setActiveBooking(null);
        setJobStatus('idle');
        setElapsedTime(0);
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
   if (activeBooking && !activeBooking.uid.startsWith('mock-')) {
     try {
         await bookingService.updateSopChecklist(activeBooking.uid, newChecklist);
     } catch (err) {
         console.error("Checklist sync failed", err);
     }
   } else {
     toast.success("SOP checklist item status updated!");
   }
  };

  const handleAddExtra = async (item: any) => {
   if (!activeBooking) return;
   try {
     if (!activeBooking.uid.startsWith('mock-')) {
         await bookingService.updateBookingStatus(activeBooking.uid, 'IN_PROGRESS', item.name);
     }
     setActiveBooking(prev => prev ? { ...prev, totalPrice: (prev.totalPrice || 0) + item.price } : null);
     toast.success(`Successfully added ${item.name}!`);
   } catch (err) {
     console.error("Add extra failed", err);
     toast.error("Failed to add extra item");
   }
   setShowUpsell(false);
  };

  const handleSOS = async () => {
     if (!activeBooking) return;
     try {
         if (!activeBooking.uid.startsWith('mock-')) {
             await bookingService.updateBookingStatus(activeBooking.uid, 'SOS');
         }
         toast.success("Emergency protocols activated!");
         setSosOpen(false);
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
         if (!activeBooking.uid.startsWith('mock-')) {
             await bookingService.updateBookingStatus(activeBooking.uid, 'COMPLETED');
         }
         setShowSummary(true);
         setJobStatus('paused');
         toast.success("Job session successfully completed!");
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
             <p className="font-bold uppercase tracking-widest text-slate-400">Resuming session...</p>
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
    className="w-full max-w-md"
   >
    <GlassCard className="bg-white p-8 sm:p-10 border-slate-200/80 shadow-xl text-center space-y-6 rounded-[32px]">
     <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
      <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
      <div className="relative h-full w-full bg-white rounded-full flex items-center justify-center border-4 border-primary/10 shadow-inner">
       <PlayCircle className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
      </div>
     </div>
     
     <div className="space-y-3">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">No active job</h2>
      <p className="text-slate-500 font-semibold text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
       {user?.role === 'staff' 
        ? "Jump to your portal to accept a request or start your next shift."
        : user?.isSoloOperator
        ? "Head to your bookings to manage your personal sessions and schedule."
        : "Head to your bookings to manage active sessions and staff assignments."
       }
      </p>
     </div>

     <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 sm:h-14 text-base shadow-xl shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]">
      <a href={dashboardLink}>
       Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
      </a>
     </Button>
    </GlassCard>
   </motion.div>
   </div>
   );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      {/* Header Cockpit */}
      <div className="p-6 border border-slate-100 bg-white shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
              <AvatarImage src={activeBooking.customerAvatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{activeBooking.customer[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-black text-slate-850 text-slate-800">{activeBooking.customer}</h2>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
                <Sparkles className="h-3.5 w-3.5" /> Premium Member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={sosOpen} onOpenChange={setSosOpen}>
              <DialogTrigger asChild>
                <button className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                  <Shield className="h-7 w-7" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 text-slate-800 rounded-3xl p-8 max-w-sm shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-center text-red-500 flex items-center justify-center gap-3">
                    <AlertTriangle className="h-8 w-8" /> SOS Alert
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 text-center py-4">
                  <p className="text-slate-600 font-semibold leading-relaxed">This will immediately alert the business manager and start recording audio for your safety.</p>
                  <Button onClick={handleSOS} className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-600/20">
                    Confirm Emergency
                  </Button>
                  <Button variant="ghost" onClick={() => setSosOpen(false)} className="w-full text-slate-400 font-bold hover:text-slate-600">Cancel</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Center Stage: Timer & Controls */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-12 border-slate-200 bg-white text-center relative overflow-hidden shadow-xl shadow-slate-200/50 rounded-[32px]">
            {/* Background Glow */}
            <div className={cn(
              "absolute inset-0 blur-[120px] rounded-full transition-colors duration-1000",
              jobStatus === 'running' ? "bg-primary/5" : "bg-amber-500/5"
            )} />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-center gap-3 text-slate-500 uppercase tracking-[0.3em] font-black text-xs">
                <Timer className={cn("h-4 w-4", jobStatus === 'running' && "animate-pulse text-primary")} />
                {jobStatus === 'running' ? "Session in Progress" : "Session Paused"}
              </div>

              <h1 className="text-8xl md:text-9xl font-mono font-black text-primary tracking-tighter drop-shadow-sm">
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
                <div className="relative w-full max-w-xs h-16 bg-slate-100 rounded-2xl border border-slate-200 flex items-center p-1 overflow-hidden shadow-inner">
                  <motion.div
                    style={{ background }}
                    className="absolute inset-0 z-0"
                  />
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 240 }}
                    style={{ x }}
                    onDragEnd={handleDragEnd}
                    className="relative z-20 h-14 w-14 bg-white rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md border border-slate-100 group/handle"
                  >
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 group-active/handle:scale-90 transition-transform" />
                  </motion.div>
                  <motion.p
                    style={{ opacity }}
                    className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-500 pointer-events-none uppercase tracking-widest"
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
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Stream</h3>
              <div className="h-px flex-1 bg-slate-200 mx-4" />
            </div>

            <div className="p-8 border border-slate-100 bg-white space-y-8 shadow-sm rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-black text-primary uppercase tracking-widest">Service</p>
                  <h4 className="text-2xl font-black text-slate-800">{activeBooking.service}</h4>
                  <p className="text-sm font-semibold text-slate-500 mt-1">90 Minutes • Premium Room</p>
                </div>
                <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Upsell Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Add-ons</p>
                  <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl border-primary/40 bg-primary/10 text-primary font-black hover:bg-primary hover:text-white transition-all uppercase tracking-tighter">
                        <Plus className="mr-1.5 h-4 w-4" /> Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200 text-slate-800 rounded-3xl p-8 max-w-md shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900">Available Extras</DialogTitle>
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
                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-primary/5 hover:border-primary/30 transition-all group text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-slate-100">
                                <item.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-black text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Premium Upgrade</p>
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
            </div>
          </div>
        </div>

        {/* Sidebar: Checklist & Notes */}
        <div className="space-y-8">
          {/* SOP Checklist */}
          <div className="p-6 border border-slate-100 bg-white shadow-sm space-y-6 rounded-2xl">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
              <CheckSquare className="h-4 w-4 text-primary" /> Service Checklist (SOP)
            </h3>
            <div className="space-y-3">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl transition-all border shadow-sm",
                    item.completed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                  )}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors shadow-inner",
                    item.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                  )}>
                    {item.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className={cn("text-xs font-black leading-relaxed text-left", item.completed && "line-through opacity-50 text-emerald-800")}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Client Notes */}
          <div className="border border-slate-100 bg-white shadow-sm overflow-hidden rounded-2xl">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Client Notes
              </h3>
              {notesOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
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
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80">
                      <p className="text-sm font-semibold text-amber-800 leading-relaxed">
                        {activeBooking.specialNote || "No client notes for this booking."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Completion Summary Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 rounded-3xl p-8 max-w-md shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-3xl font-black text-center text-slate-900 mb-2">Job Summary</DialogTitle>
            <p className="text-center text-slate-500 font-bold text-sm">Review the session details before closing.</p>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex justify-between items-center p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-black uppercase text-xs tracking-widest">Total Time</span>
              <span className="text-2xl font-mono font-black text-slate-800 tracking-widest">{formatTime(elapsedTime)}</span>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex justify-between items-center px-2">
              <span className="text-lg font-black text-slate-700">Total Earnings</span>
              <span className="text-3xl font-black text-primary">₦{(activeBooking.totalPrice || 0).toLocaleString()}</span>
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
            <Button variant="ghost" onClick={() => setShowSummary(false)} className="text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-50 transition-colors">
              Back to Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
