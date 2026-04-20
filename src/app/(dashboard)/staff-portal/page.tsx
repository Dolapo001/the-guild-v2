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
 AlertTriangle,
 Siren,
 ListTodo,
 PlusCircle,
 ShieldAlert
} from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
 const [elapsedTime, setElapsedTime] = useState(0);
 const [isLightboxOpen, setIsLightboxOpen] = useState(false);
 const [declineModalOpen, setDeclineModalOpen] = useState(false);
 const [requestToDecline, setRequestToDecline] = useState<string | null>(null);
 const [declineReason, setDeclineReason] = useState("");
 const [declineNote, setDeclineNote] = useState("");
 const [sopChecklist, setSopChecklist] = useState<{id: string, label: string, completed: boolean}[]>([
  { id: 'sop1', label: 'Verify Customer Identity', completed: false },
  { id: 'sop2', label: 'Safety Briefing Provided', completed: false },
  { id: 'sop3', label: 'Equipment Sanitized', completed: false },
  { id: 'sop4', label: 'Environment Risk Check', completed: false },
 ]);
 const [extraItems, setExtraItems] = useState<{name: string, price: number}[]>([]);
 const [isSosActive, setIsSosActive] = useState(false);
 const [sosNotification, setSosNotification] = useState<string | null>(null);

 const timerRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
  setMounted(true);
 }, []);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [allBookings, schedule] = await Promise.all([
          bookingService.getBookings(),
          bookingService.getStaffSchedule({ date: selectedDate })
        ]);
        
        // Filter tasks for the list
        setBookings(allBookings);
        
        // Schedule for the selected date
        const dayTasks = schedule.map((b: any) => ({
          id: b.uid,
          service: b.service_name,
          customer: b.customer_name,
          date: b.date,
          time: b.start_time,
          endTime: b.end_time,
          duration: `${b.service_details?.duration || 60} Mins`,
          status: b.status.toLowerCase().replace('_', '-'),
          price: Number(b.total_price),
          customerNote: b.special_note || "No specific notes provided.",
          referenceImage: b.reference_image || "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=400&auto=format&fit=crop",
          contact: { phone: "08012345678", email: "customer@example.com", whatsapp: "2348012345678" }
        }));
        setTasks(dayTasks);
      } catch (err) {
        console.error("Failed to fetch staff data", err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) fetchStaffData();
  }, [user, selectedDate, mounted]);

  const myRequests = bookings.filter(b => b.status === "PENDING" && b.staff === user?.uid);

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

 const updateTaskStatus = async (id: string, newStatus: string) => {
  try {
   const apiStatus = newStatus === 'in-progress' ? 'STARTED' : newStatus === 'completed' ? 'COMPLETED' : newStatus;
   await bookingService.updateBookingStatus(id, apiStatus);
   
   setTasks((prev: any[]) => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
   if (selectedTask?.id === id) {
    setSelectedTask((prev: any) => prev ? { ...prev, status: newStatus } : null);
   }
  } catch (err) {
   console.error("Failed to update status", err);
   // Normal UI update for mock fallback
   setTasks((prev: any[]) => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
   if (selectedTask?.id === id) {
    setSelectedTask((prev: any) => prev ? { ...prev, status: newStatus } : null);
   }
  }
 };

  const handleAcceptRequest = async (id: string) => {
   try {
    await bookingService.updateBookingStatus(id, 'CONFIRMED');
    // Refresh
    const all = await bookingService.getBookings();
    setBookings(all);
    const schedule = await bookingService.getStaffSchedule({ date: selectedDate });
    setTasks(schedule.map((b: any) => ({
      id: b.uid,
      service: b.service_name,
      customer: b.customer_name,
      date: b.date,
      time: b.start_time,
      status: b.status.toLowerCase().replace('_', '-'),
      price: Number(b.total_price),
      contact: { phone: "08012345678", email: "customer@example.com", whatsapp: "2348012345678" }
    })));
   } catch (err) {
    console.error("Failed to accept request", err);
   }
  };

  const handleConfirmDecline = async () => {
   if (requestToDecline) {
    try {
     await bookingService.updateBookingStatus(requestToDecline, 'DECLINED', declineReason);
     setBookings(prev => prev.filter(b => b.uid !== requestToDecline));
     setDeclineModalOpen(false);
     toast.success("Job request declined.");
     setRequestToDecline(null);
    } catch (err) {
     console.error("Failed to decline", err);
    }
   }
  };

 const triggerSos = async () => {
  if (!selectedTask) return;
  setIsSosActive(true);
  try {
   await api.post(`/bookings/${selectedTask.id}/sos/`, {
    lat: 6.4589,
    lng: 3.6015
   });
   setSosNotification("✅ SOS ALERT SENT! Managers have been notified and background recording started.");
  } catch (err) {
   console.error("SOS failed", err);
   setSosNotification("⚠️ SOS alert sent via fallback. Please also call your emergency contact.");
  }
 };

 const toggleSop = (id: string) => {
  setSopChecklist(prev => prev.map(item => 
   item.id === id ? { ...item, completed: !item.completed } : item
  ));
 };

 const addExtra = async (name: string, price: number) => {
  if (!selectedTask) return;
  try {
   await api.patch(`/bookings/${selectedTask.id}/add-extra/`, {
    name,
    price
   });
   setExtraItems(prev => [...prev, { name, price }]);
  } catch (err) {
   console.error("Failed to add extra", err);
  }
 };

 const filteredTasks = tasks.filter(t => t.date === selectedDate);

 if (!mounted) return null;

 return (
  <div className="space-y-10 min-h-screen pb-20">
   {/* SOS Notification Banner */}
   <AnimatePresence>
   {sosNotification && (
    <motion.div
     initial={{ opacity: 0, y: -20 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -20 }}
     className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500 max-w-lg"
    >
     <ShieldAlert className="h-5 w-5 shrink-0" />
     <p className="text-sm font-bold">{sosNotification}</p>
     <button onClick={() => setSosNotification(null)} className="ml-2 text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
    </motion.div>
   )}
   </AnimatePresence>
  {/* Header */}
   <motion.div
   initial={{ opacity: 0, y: -20 }}
   animate={{ opacity: 1, y: 0 }}
   className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-1"
   >
   <div>
   <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Staff Portal</h1>
   <p className="text-gray-400 font-semibold text-sm sm:text-base">Hello, {user?.username || "Pro"}.</p>
   </div>

   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
   <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
   <button
   onClick={() => setViewMode('today')}
   className={cn(
   "flex-1 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
   viewMode === 'today' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
   )}
   >
   Today
   </button>
   <button
   onClick={() => setViewMode('month')}
   className={cn(
   "flex-1 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
   viewMode === 'month' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
   )}
   >
   Month
   </button>
   </div>
   <div className="flex items-center justify-center gap-2 bg-accent/20 text-accent px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border border-accent/20 shadow-lg shadow-accent/5">
   <Star className="h-4 w-4 sm:h-5 w-5 fill-accent" />
   <span className="font-black text-sm sm:text-lg">4.9</span>
   </div>
   </div>
   </motion.div>

  {/* My Requests Section */}
  {myRequests.length > 0 && !selectedTask && (
   <section className="space-y-4">
   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
   <Sparkles className="h-3 w-3 text-secondary" /> New Requests
   </h3>
   <div className="grid gap-4 sm:grid-cols-2">
   {myRequests.map((request) => (
   <motion.div
   key={request.uid}
   initial={{ opacity: 0, scale: 0.98 }}
   animate={{ opacity: 1, scale: 1 }}
   >
   <GlassCard className="p-5 border-secondary/20 bg-secondary/10">
   <div className="flex justify-between items-start mb-4">
   <div className="flex items-center gap-3 min-w-0">
   <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white shadow-inner border border-white/10 shrink-0">
   {request.uid[0]}
   </div>
   <div className="min-w-0">
   <p className="font-black text-white text-base sm:text-lg truncate">{request.customer_name}</p>
   <p className="text-[10px] font-bold text-gray-400 truncate">{request.service_name}</p>
   </div>
   </div>
   <div className="text-right shrink-0">
   <p className="text-base sm:text-lg font-black text-white">₦{Number(request.total_price).toLocaleString()}</p>
   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{request.start_time}</p>
   </div>
   </div>
   <div className="flex gap-2">
   <Button
   onClick={() => handleAcceptRequest(request.uid)}
   className="flex-1 bg-primary text-white font-black rounded-xl h-11 text-xs"
   >
   Accept
   </Button>
   <Button
   variant="outline"
   onClick={() => {
   setRequestToDecline(request.uid);
   setDeclineModalOpen(true);
   }}
   className="flex-1 border-white/5 text-red-400 hover:bg-red-500/10 font-bold rounded-xl h-11 text-xs"
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
  {viewMode === 'month' && !selectedTask && (
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   >
   <GlassCard className="p-4 sm:p-8 border-white/10 bg-white/5">
   <div className="flex items-center justify-between mb-6 sm:mb-8">
   <h3 className="text-lg sm:text-xl font-black text-white px-1">Schedule Month</h3>
   <div className="flex gap-2">
   <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-white/10 bg-white/5 p-0">
   <ChevronLeft className="h-4 w-4" />
   </Button>
   <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-white/10 bg-white/5 p-0">
   <ChevronRightIcon className="h-4 w-4" />
   </Button>
   </div>
   </div>
   <div className="grid grid-cols-7 gap-1 sm:gap-2">
   {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
   <div key={day} className="text-center text-[9px] font-black text-gray-500 uppercase tracking-widest py-1 sm:py-2">
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
   "aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all border relative group",
   isSelected
   ? "bg-primary border-primary shadow-lg shadow-primary/10 text-white"
   : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10",
   isToday && !isSelected && "border-primary/50 text-white font-black"
   )}
   >
   <span className="text-xs sm:text-sm font-bold">{day}</span>
   {hasJobs && (
   <div className={cn(
   "h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full mt-0.5",
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

   <div className={cn("space-y-6", selectedTask && "hidden lg:block")}>
   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
   {viewMode === 'today' ? "Schedule" : `${selectedDate}`}
   </h3>
   <div className="relative space-y-4">
   <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-white/5 -z-10" />
   {filteredTasks.length > 0 ? filteredTasks.map((task, i) => (
   <motion.div
   key={task.id}
   initial={{ opacity: 0, x: -10 }}
   animate={{ opacity: 1, x: 0 }}
   transition={{ delay: i * 0.05 }}
   >
   <GlassCard
   className={cn(
   "p-4 sm:p-5 border-white/10 flex items-center gap-4 sm:gap-6 cursor-pointer hover:bg-white/15 transition-all group",
   task.status === "in-progress" ? "ring-2 ring-primary bg-primary/5" : "bg-white/5"
   )}
   onClick={() => setSelectedTask(task)}
   >
   <div className={cn(
   "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 z-10 border shadow-lg",
   task.status === "completed" ? "bg-emerald-500 text-white border-emerald-400" :
   task.status === "in-progress" ? "bg-primary text-white border-primary/50" :
   "bg-white/5 text-gray-400 border-white/10"
   )}>
   {task.time.split(' ')[0]}
   </div>
   <div className="flex-1 min-w-0">
   <div className="flex justify-between items-start">
   <div className="min-w-0">
   <h4 className="font-black text-white text-sm sm:text-base truncate">{task.service}</h4>
   <p className="text-[10px] sm:text-sm font-semibold text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
   <User className="h-3 w-3" /> {task.customer}
   </p>
   </div>
   <div className={cn(
   "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border whitespace-nowrap ml-2",
   task.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
   task.status === "in-progress" ? "bg-primary/10 text-primary border-primary/20" :
   "bg-white/10 text-gray-500 border-white/10"
   )}>
   {task.status}
   </div>
   </div>
   </div>
   <ChevronRightIcon className="h-4 w-4 text-gray-700 shrink-0" />
   </GlassCard>
   </motion.div>
   )) : (
   <div className="py-20 text-center">
   <p className="text-gray-600 font-bold text-sm">Clear schedule for this date.</p>
   </div>
   )}
   </div>
   </div>
  </div>

  {/* Job Details Panel */}
   <div className={cn("space-y-6", !selectedTask && "hidden lg:block")}>
   <div className="flex items-center justify-between px-1">
   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Task</h3>
   <Button 
     variant="ghost" 
     size="sm" 
     className="lg:hidden h-8 px-2 text-[10px] font-black text-primary border border-primary/20 rounded-lg uppercase tracking-tight"
     onClick={() => setSelectedTask(null)}
   >
     <ChevronLeft className="mr-1 h-3 w-3" /> Back to Schedule
   </Button>
   </div>
   
   <AnimatePresence mode="wait">
   {selectedTask ? (
   <motion.div
   key={selectedTask.id}
   initial={{ opacity: 0, y: 10 }}
   animate={{ opacity: 1, y: 0 }}
   exit={{ opacity: 0, y: 10 }}
   >
   <GlassCard className="p-6 sm:p-8 border-white/10 bg-white/10 space-y-6 sm:space-y-8 relative overflow-hidden">
   {/* Status Background Glow */}
   {selectedTask.status === 'in-progress' && (
   <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
   )}

   <div className="text-center">
   <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
   <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
   </div>
   <h4 className="text-xl sm:text-2xl font-black text-white">{selectedTask.customer}</h4>
   <p className="text-xs sm:text-sm font-bold text-gray-400 mt-1">{selectedTask.service}</p>
   </div>

   <div className="space-y-4">
   <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1">
   <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
   <Clock className="h-3 w-3" /> Time Window
   </div>
   <p className="text-xs sm:text-sm font-bold text-white">
   {selectedTask.time} - {selectedTask.endTime} • {selectedTask.duration}
   </p>
   </div>

   <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1">
   <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
   <MessageSquare className="h-3 w-3" /> Special Notes
   </div>
   <p className="text-xs sm:text-sm font-medium text-gray-400 italic leading-relaxed">
   "{selectedTask.customerNote}"
   </p>
   </div>

   <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-3">
   <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
   <Maximize2 className="h-3 w-3" /> Reference Style
   </div>
   <div
   className="relative h-24 sm:h-32 w-full rounded-xl overflow-hidden cursor-pointer group"
   onClick={() => setIsLightboxOpen(true)}
   >
   <img src={selectedTask.referenceImage} alt="Reference" className="h-full w-full object-cover" />
   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
   <Maximize2 className="h-5 w-5 text-white/50" />
   </div>
   </div>
   </div>
   </div>

   <div className="pt-4 space-y-4">
    {selectedTask.status === "pending" && (
     <Button
      onClick={() => updateTaskStatus(selectedTask.id, "in-progress")}
      className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 text-lg"
     >
      <Play className="mr-2 h-6 w-6 fill-white" /> Start Job
     </Button>
    )}
    {selectedTask.status === "in-progress" && (
     <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
         <ListTodo className="h-3 w-3" /> SOP Checklist
        </div>
        <span className="text-[10px] font-black text-primary">
         {sopChecklist.filter(s => s.completed).length}/{sopChecklist.length}
        </span>
       </div>
       <div className="space-y-1.5">
        {sopChecklist.map(item => (
         <button 
          key={item.id}
          onClick={() => toggleSop(item.id)}
          className={cn(
           "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left",
           item.completed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-white/5 border-white/5 text-gray-500"
          )}
         >
          <div className={cn(
           "h-4 w-4 rounded border flex items-center justify-center shrink-0",
           item.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-700"
          )}>
           {item.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
          </div>
          <span className="text-[10px] sm:text-xs font-bold">{item.label}</span>
         </button>
        ))}
       </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <PlusCircle className="h-3 w-3" /> Upsell Item
         </div>
        </div>
        <div className="flex gap-2">
          <Button 
           variant="outline" 
           size="sm" 
           className="flex-1 h-9 rounded-lg border-white/5 bg-white/5 text-[9px] font-black text-gray-400"
           onClick={() => addExtra("Premium Oil", 2000)}
          >
            Add Oil
          </Button>
          <Button 
           variant="outline" 
           size="sm" 
           className="flex-1 h-9 rounded-lg border-white/5 bg-white/5 text-[9px] font-black text-gray-400"
           onClick={() => addExtra("30 Mins Extra", 5000)}
          >
            Add 30m
          </Button>
        </div>
        {extraItems.length > 0 && (
         <div className="pt-2 border-t border-white/5 space-y-1">
           {extraItems.map((item, idx) => (
             <div key={idx} className="flex justify-between text-[9px] font-black">
               <span className="text-gray-500">{item.name}</span>
               <span className="text-white">+₦{item.price.toLocaleString()}</span>
             </div>
           ))}
         </div>
        )}
      </div>

      <Button
       onClick={triggerSos}
       className={cn(
        "w-full h-11 rounded-2xl font-black flex items-center justify-center gap-2 transition-all text-xs",
        isSosActive ? "bg-red-600 text-white" : "bg-white/5 border border-red-500/30 text-red-500"
       )}
      >
       <ShieldAlert className="h-4 w-4" /> SOS EMERGENCY
      </Button>

      <div className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-primary/10 border border-primary/20">
       <Timer className="h-5 w-5 text-primary" />
       <span className="text-2xl font-mono font-black text-white tracking-widest">{formatTime(elapsedTime)}</span>
      </div>
      <Button
       onClick={() => updateTaskStatus(selectedTask.id, "completed")}
       disabled={sopChecklist.some(s => !s.completed)}
       className="w-full h-14 rounded-2xl bg-accent text-white font-black shadow-xl shadow-accent/20 text-lg disabled:opacity-30 transition-all"
      >
       <CheckCircle2 className="mr-2 h-6 w-6" /> Complete Job
      </Button>
     </div>
    )}
    {selectedTask.status === "completed" && (
     <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
      <div className="flex items-center justify-center gap-2 text-emerald-500">
       <CheckCircle2 className="h-6 w-6" />
       <span className="text-base sm:text-lg font-black">Success!</span>
      </div>
      <p className="text-xl sm:text-2xl font-black text-white">Earned ₦{selectedTask.price.toLocaleString()}</p>
     </div>
    )}
   </div>

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
        toast.success("Email copied to clipboard!");
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
