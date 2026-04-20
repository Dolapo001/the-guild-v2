"use client";

import { useState, useMemo, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 MoreHorizontal,
 Clock,
 CheckCircle2,
 PlayCircle,
 Search,
 Filter,
 Plus,
 MapPin,
 Users,
 ChevronLeft,
 ChevronRight,
 Calendar as CalendarIcon,
 LayoutGrid,
 List as ListIcon,
 CalendarDays,
 ArrowRight,
 User as UserIcon,
 Check,
 X,
 Loader2
} from "lucide-react";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bookingService } from "@/services/booking.service";
import { staffService } from "@/services/staff.service";
import { maestroService } from "@/services/maestro.service";
import { Booking, User as ApiUser, Service } from "@/types/api";

type BookingStatus = "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DECLINED";

const columns: { id: string; title: string; icon: any; color: string }[] = [
 { id: "REQUESTED", title: "Requested", icon: Clock, color: "text-blue-500" },
 { id: "ACCEPTED", title: "Accepted", icon: CheckCircle2, color: "text-secondary" },
 { id: "IN_PROGRESS", title: "In Progress", icon: PlayCircle, color: "text-primary" },
 { id: "COMPLETED", title: "Completed", icon: CheckCircle2, color: "text-accent" },
];

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [realStaff, setRealStaff] = useState<ApiUser[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "month">("kanban");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // New Booking Form State
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [selectedBusinessUid, setSelectedBusinessUid] = useState<string>("");
  const [selectedServiceUid, setSelectedServiceUid] = useState<string>("");
  const [selectedStaffUid, setSelectedStaffUid] = useState<string>("");
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingDate, setBookingDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD local

  const fetchData = async () => {
     setLoading(true);
      try {
          const [bookingData, staffData, businessData] = await Promise.all([
              bookingService.getBookings(),
              staffService.getStaffList(),
              maestroService.getMyBusinesses()
          ]);
          setBookings(bookingData);
          setRealStaff(staffData);
          setMyBusinesses(businessData);
          if (businessData.length > 0) {
              setSelectedBusinessUid(businessData[0].uid);
          }
      } catch (err) {
         console.error("Failed to fetch data", err);
     } finally {
         setLoading(false);
     }
  };

  useEffect(() => {
     fetchData();
  }, []);

  const filteredBookings = useMemo(() => {
   return bookings.filter(b => {
   const matchesDate = viewMode === 'month' ? true : b.date === dateString;
   const matchesStaff = staffFilter === 'all' ? true : b.staff === staffFilter;
   const customerName = b.customer_name || b.customer || "";
   const serviceName = b.service_name || b.service || "";
   const matchesSearch = String(customerName).toLowerCase().includes(searchQuery.toLowerCase()) ||
   String(serviceName).toLowerCase().includes(searchQuery.toLowerCase());
   return matchesDate && matchesStaff && matchesSearch;
   });
  }, [bookings, dateString, staffFilter, searchQuery, viewMode]);

  const moveBooking = async (uid: string, newStatus: string) => {
      const toastId = toast.loading(`Updating status to ${newStatus}...`);
      try {
          const updated = await bookingService.updateBookingStatus(uid, newStatus);
          setBookings(prev => prev.map(b => b.uid === uid ? updated : b));
          toast.success(`Booking ${newStatus.toLowerCase()}!`, { id: toastId });
      } catch (err: any) {
          console.error("Move failed", err);
          toast.error(err?.message || "Failed to update status", { id: toastId });
      }
  };

  const handleManualBooking = async () => {
    if (!selectedBusinessUid || !selectedServiceUid || !walkinName) {
        toast.error("Please fill in business, service, and guest name.");
        return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating walk-in record...");
    try {
        const newBooking = await bookingService.createBooking({
            business: selectedBusinessUid,
            service: selectedServiceUid,
            date: bookingDate,
            start_time: bookingTime,
            staff: selectedStaffUid || undefined,
            walkin_name: walkinName,
            walkin_phone: walkinPhone,
            special_note: "Manual Walk-in Booking"
        });
        setBookings(prev => [newBooking, ...prev]);
        setIsNewBookingOpen(false);
        // Reset form
        setWalkinName("");
        setWalkinPhone("");
        setSelectedServiceUid("");
        setSelectedStaffUid("");
        toast.success("Booking record created!", { id: toastId });
    } catch (err: any) {
        console.error("Manual booking failed", err);
        toast.error(err.message || "Failed to create booking", { id: toastId });
    } finally {
        setIsSubmitting(false);
    }
  };

  const currentlySelectedBusiness = myBusinesses.find(b => b.uid === selectedBusinessUid);
  const availableServices = currentlySelectedBusiness?.services || [];
  const availableStaff = realStaff; // Simplified for now

  const handlePrevDay = () => {
   const newDate = new Date(selectedDate);
   if (viewMode === 'month') {
   newDate.setMonth(newDate.getMonth() - 1);
   } else {
   newDate.setDate(newDate.getDate() - 1);
   }
   setSelectedDate(newDate);
  };

  const handleNextDay = () => {
   const newDate = new Date(selectedDate);
   if (viewMode === 'month') {
   newDate.setMonth(newDate.getMonth() + 1);
   } else {
   newDate.setDate(newDate.getDate() + 1);
   }
   setSelectedDate(newDate);
  };

  return (
  <div className="space-y-8 pb-20">
  {/* Header & Control Bar */}
  <div className="flex flex-col gap-8">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
  <div>
  <div className="flex items-center gap-3 mb-1">
  <h1 className="text-3xl font-extrabold tracking-tight text-primary">Booking Manager</h1>
  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 rounded-full">
  Platform Live
  </Badge>
  </div>
  <p className="text-foreground/50 font-medium">
    {user?.isSoloOperator ? "Manage your personal business schedule." : "Manage your schedule and team assignments."}
  </p>
  </div>
  <Button
  onClick={() => setIsNewBookingOpen(true)}
  className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
  >
  <Plus className="mr-2 h-5 w-5" /> New Booking
  </Button>
  </div>

  <GlassCard className="p-4 flex flex-col lg:flex-row items-center justify-between gap-6 border-white/40">
  {/* Date Navigation */}
  <div className="flex items-center gap-4">
  <div className="flex items-center gap-1 bg-white/40 p-1 rounded-xl border border-glass-border">
  <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-10 w-10 rounded-lg hover:bg-primary/5">
  <ChevronLeft className="h-5 w-5" />
  </Button>
  <div className="px-4 flex items-center gap-2 cursor-pointer hover:bg-white/20 rounded-lg transition-colors py-2">
  <CalendarIcon className="h-4 w-4 text-primary" />
  <span className="text-sm font-bold text-primary">
  {viewMode === 'month'
  ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
  </span>
  </div>
  <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-10 w-10 rounded-lg hover:bg-primary/5">
  <ChevronRight className="h-5 w-5" />
  </Button>
  </div>
  <Button
  variant="outline"
  onClick={() => setSelectedDate(new Date())}
  className="h-12 rounded-xl border-glass-border font-bold text-xs uppercase tracking-widest hover:bg-primary/5"
  >
  Today
  </Button>
  </div>

  {/* View Toggles */}
  <div className="flex items-center gap-1 p-1 bg-white/40 rounded-xl border border-glass-border">
  {[
  { id: 'month', label: 'Month', icon: CalendarDays },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: ListIcon },
  ].map((v) => (
  <button
  key={v.id}
  onClick={() => setViewMode(v.id as any)}
  className={cn(
  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
  viewMode === v.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-primary"
  )}
  >
  <v.icon className="h-3.5 w-3.5" /> {v.label}
  </button>
  ))}
  </div>

  {/* Filters */}
  <div className="flex items-center gap-4 w-full lg:w-auto">
  <div className="relative flex-1 lg:w-64">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
  <Input
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="pl-10 h-12 bg-white/20 border-glass-border rounded-xl"
  />
  </div>
  {!user?.isSoloOperator && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12 rounded-xl border-glass-border font-bold text-primary hover:bg-primary/5">
          <Filter className="mr-2 h-4 w-4" /> {staffFilter === 'all' ? 'All Staff' : realStaff.find(s => s.uid === staffFilter)?.username || 'Filtered'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-glass-border w-48 p-2 max-h-[300px] overflow-y-auto">
        <DropdownMenuItem onClick={() => setStaffFilter('all')} className="rounded-lg font-bold text-xs mb-1">All Staff</DropdownMenuItem>
        {realStaff.map(staff => (
          <DropdownMenuItem key={staff.uid} onClick={() => setStaffFilter(staff.uid)} className="rounded-lg font-bold text-xs mb-1">
            {staff.username}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )}
  </div>
  </GlassCard>
  </div>

  {/* Main Content Area */}
  <AnimatePresence mode="wait">
  <motion.div
  key={viewMode + dateString}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
  >
  {loading ? (
     <div className="flex flex-col items-center justify-center py-20">
         <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
         <p className="font-bold text-foreground/40 uppercase tracking-widest">Loading bookings...</p>
     </div>
  ) : viewMode === 'month' ? (
  <MonthView
  bookings={bookings}
  selectedDate={selectedDate}
  isSolo={user?.isSoloOperator}
  onDateClick={(date) => {
  setSelectedDate(date);
  setViewMode('kanban');
  }}
  />
  ) : viewMode === 'kanban' ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {columns.map((col) => (
  <div key={col.id} className="flex flex-col gap-4">
  <div className="flex items-center justify-between px-2">
  <div className="flex items-center gap-2">
  <div className={`h-2 w-2 rounded-full ${col.color.replace('text', 'bg')}`} />
  <h3 className="font-bold text-sm text-primary uppercase tracking-widest">{col.title}</h3>
  </div>
  <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
  {filteredBookings.filter((b) => b.status === col.id).length}
  </span>
  </div>

  <div className="flex-1 min-h-[500px] bg-primary/[0.02] rounded-2xl border border-dashed border-primary/10 p-3 space-y-4">
  {filteredBookings.filter((b) => b.status === col.id).length === 0 && (
  <div className="h-32 flex flex-col items-center justify-center text-center p-4 opacity-40">
  <CalendarIcon className="h-8 w-8 mb-2" />
  <p className="text-[10px] font-bold uppercase tracking-widest">No jobs</p>
  </div>
  )}
  {filteredBookings
  .filter((b) => b.status === col.id)
  .map((booking) => (
  <BookingCard key={booking.uid} booking={booking} moveBooking={moveBooking} />
  ))}
  </div>
  </div>
  ))}
  </div>
  ) : (
  <GlassCard className="overflow-hidden border-white/40">
  {filteredBookings.length === 0 ? (
  <div className="p-20 text-center">
  <CalendarIcon className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
  <p className="text-lg font-bold text-primary">No bookings for this date.</p>
  </div>
  ) : (
  <table className="w-full text-left border-collapse">
  <thead>
  <tr className="bg-primary/5 border-b border-glass-border">
  <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Time</th>
  <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Customer</th>
  <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Service</th>
  <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Status</th>
  <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Amount</th>
  <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest"></th>
  </tr>
  </thead>
  <tbody>
  {filteredBookings.map((booking) => (
  <tr key={booking.uid} className="border-b border-glass-border hover:bg-white/40 transition-colors">
  <td className="p-4 text-sm font-bold text-primary/60">{booking.start_time}</td>
  <td className="p-4">
   <div className="flex items-center gap-3">
   <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center font-bold text-primary text-xs uppercase">
   {(booking.customer_name || booking.customer || "?")[0]}
   </div>
   <p className="text-sm font-bold text-primary">{booking.customer_name || "Customer"}</p>
   </div>
  </td>
  <td className="p-4 text-sm font-medium text-foreground/60">{booking.service_name || booking.service}</td>
  <td className="p-4">
  <Badge className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-0 ${booking.status === 'COMPLETED' ? 'bg-accent/10 text-accent' :
  booking.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary' :
  booking.status === 'ACCEPTED' ? 'bg-secondary/10 text-secondary' :
  'bg-blue-500/10 text-blue-500'
  }`}>
  {booking.status}
  </Badge>
  </td>
  <td className="p-4 text-sm font-extrabold text-primary">₦{(booking.total_price || 0).toLocaleString()}</td>
  <td className="p-4 text-right">
  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
     <Link href={`/bookings/${booking.uid}`}><MoreHorizontal className="h-4 w-4 text-foreground/40" /></Link>
  </Button>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  )}
  </GlassCard>
  )}
  </motion.div>
  </AnimatePresence>

  {/* New Booking Dialog */}
  <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
    <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold text-primary">New Internal Booking</DialogTitle>
                <p className="text-xs font-medium text-foreground/40 mt-1 uppercase tracking-widest">Walk-in Record Management</p>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
                {/* Section 1: Business & Service */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Select Business</label>
                        <select 
                            value={selectedBusinessUid}
                            onChange={(e) => {
                                setSelectedBusinessUid(e.target.value);
                                setSelectedServiceUid("");
                            }}
                            className="w-full h-12 rounded-xl bg-white/20 border border-glass-border px-4 text-sm font-bold text-primary focus:outline-none focus:ring-2 ring-primary/20"
                        >
                            <option value="" disabled>Select Business...</option>
                            {myBusinesses.map(b => (
                                <option key={b.uid} value={b.uid}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Select Service</label>
                        <select 
                            value={selectedServiceUid}
                            onChange={(e) => setSelectedServiceUid(e.target.value)}
                            className="w-full h-12 rounded-xl bg-white/20 border border-glass-border px-4 text-sm font-bold text-primary focus:outline-none focus:ring-2 ring-primary/20"
                        >
                            <option value="" disabled>Select Service...</option>
                            {availableServices.map((s: any) => (
                                <option key={s.uid} value={s.uid}>{s.name} - ₦{s.price}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section 2: Walk-in Details */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Guest Name</label>
                        <Input 
                            value={walkinName}
                            onChange={(e) => setWalkinName(e.target.value)}
                            placeholder="e.g. Adedolapo" 
                            className="h-12 bg-white/20 border-glass-border rounded-xl font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Contact (Phone)</label>
                        <Input 
                            value={walkinPhone}
                            onChange={(e) => setWalkinPhone(e.target.value)}
                            placeholder="+234..." 
                            className="h-12 bg-white/20 border-glass-border rounded-xl font-bold"
                        />
                    </div>
                </div>

                {/* Section 3: Appointment Details */}
                <div className={cn("grid gap-4", user?.isSoloOperator ? "md:grid-cols-2" : "md:grid-cols-3")}>
                    {!user?.isSoloOperator && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Staff</label>
                        <select 
                            value={selectedStaffUid}
                            onChange={(e) => setSelectedStaffUid(e.target.value)}
                            className="w-full h-12 rounded-xl bg-white/20 border border-glass-border px-4 text-sm font-bold text-primary focus:outline-none focus:ring-2 ring-primary/20"
                        >
                            <option value="">Auto-Assign</option>
                            {availableStaff.map(s => (
                                <option key={s.uid} value={s.uid}>{s.username}</option>
                            ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Date</label>
                        <Input 
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="h-12 bg-white/20 border-glass-border rounded-xl font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Time</label>
                        <Input 
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="h-12 bg-white/20 border-glass-border rounded-xl font-bold"
                        />
                    </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Fee Breakdown</p>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-foreground/40">Manual entry will be marked as "Requested"</span>
                        <span className="text-sm font-black text-primary">₦{availableServices.find((s: any) => s.uid === selectedServiceUid)?.price || 0}</span>
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <Button 
                        disabled={isSubmitting}
                        onClick={handleManualBooking}
                        className="flex-1 bg-primary text-white font-black h-14 rounded-xl shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="mr-2 h-5 w-5" /> Confirm Record</>}
                    </Button>
                    <Button 
                        disabled={isSubmitting}
                        variant="outline" 
                        onClick={() => setIsNewBookingOpen(false)} 
                        className="w-24 border-glass-border text-foreground/40 font-bold h-14 rounded-xl"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col items-center gap-2 pt-4 border-t border-glass-border">
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Alternative</p>
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/marketplace')} 
                        className="text-secondary font-black text-xs hover:bg-secondary/5 h-10 px-6 rounded-xl"
                    >
                        Register client via Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </GlassCard>
    </DialogContent>
  </Dialog>
  </div>
  );
}

function BookingCard({ booking, moveBooking }: { booking: Booking, moveBooking: (uid: string, status: string) => void }) {
 return (
 <GlassCard className="p-5 hover:bg-white/80 transition-all border-white/60 shadow-glass-sm group">
 <div className="flex justify-between items-start mb-4">
  <Link href={`/bookings/${booking.uid}`} className="flex-1">
  <p className="font-extrabold text-primary text-sm mb-0.5 group-hover:text-secondary transition-colors">{booking.customer_name || "Customer"}</p>
  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">{booking.service_name || booking.service}</p>
  </Link>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5">
 <MoreHorizontal className="h-4 w-4 text-foreground/40" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="rounded-xl border-glass-border p-2">
 <DropdownMenuItem onClick={() => moveBooking(booking.uid, 'ACCEPTED')} className="rounded-lg text-xs font-bold mb-1">Move to Accepted</DropdownMenuItem>
 <DropdownMenuItem onClick={() => moveBooking(booking.uid, 'IN_PROGRESS')} className="rounded-lg text-xs font-bold mb-1">Move to In Progress</DropdownMenuItem>
 <DropdownMenuItem onClick={() => moveBooking(booking.uid, 'COMPLETED')} className="rounded-lg text-xs font-bold mb-1">Move to Completed</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="space-y-3">
 <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50">
 <MapPin className="h-3 w-3" /> {booking.location_name || 'Remote'}
 </div>
 <div className="flex items-center justify-between pt-2 border-t border-primary/5">
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/60">
 <Clock className="h-3 w-3" /> {booking.start_time}
 </div>
 <span className="text-xs font-extrabold text-primary">₦{(Number(booking.total_price) || 0).toLocaleString()}</span>
 </div>
 </div>
 </GlassCard>
 );
}

function MonthView({ bookings, selectedDate, onDateClick, isSolo }: { bookings: Booking[], selectedDate: Date, onDateClick: (date: Date) => void, isSolo?: boolean }) {
 const year = selectedDate.getFullYear();
 const month = selectedDate.getMonth();

 const firstDayOfMonth = new Date(year, month, 1).getDay();
 const daysInMonth = new Date(year, month + 1, 0).getDate();

 const days = Array.from({ length: 42 }, (_, i) => {
 const day = i - firstDayOfMonth + 1;
 if (day > 0 && day <= daysInMonth) {
 return new Date(year, month, day);
 }
 return null;
 });

 const getStatusColor = (status: string) => {
  switch (status) {
  case 'COMPLETED': return 'bg-accent';
  case 'IN_PROGRESS': return 'bg-primary';
  case 'ACCEPTED': return 'bg-secondary';
  default: return 'bg-blue-500';
  }
 };

 return (
  <GlassCard className="p-4 border-white/40 overflow-hidden">
  <div className="grid grid-cols-7 gap-px bg-glass-border rounded-xl overflow-hidden border border-glass-border">
  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
  <div key={d} className="bg-white/40 p-3 text-center text-[10px] font-extrabold text-primary uppercase tracking-widest">
  {d}
  </div>
  ))}
  {days.map((date, i) => {
  if (!date) return <div key={i} className="bg-white/10 min-h-[140px]" />;

  const dStr = date.toLocaleDateString('en-CA');
  const dayBookings = bookings.filter(b => b.date === dStr);
  const isToday = new Date().toLocaleDateString('en-CA') === dStr;
  const isSelected = selectedDate.toLocaleDateString('en-CA') === dStr;

  return (
  <div
  key={i}
  onClick={() => onDateClick(date)}
  className={cn(
  "bg-white/60 min-h-[140px] p-2 cursor-pointer hover:bg-white/80 transition-all flex flex-col gap-1 border-r border-b border-glass-border last:border-r-0",
  isSelected && "ring-2 ring-inset ring-primary bg-primary/5"
  )}
  >
  <div className="flex justify-between items-start mb-1">
  <span className={cn(
  "text-[10px] font-black",
  isToday ? "h-6 w-6 rounded-lg bg-primary text-white flex items-center justify-center -m-1" : "text-primary/40"
  )}>
  {date.getDate()}
  </span>
  {dayBookings.length > 0 && (
    <span className="text-[10px] font-black text-primary/20">{dayBookings.length}</span>
  )}
  </div>
  <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[100px]">
  {dayBookings.map(b => (
  <div 
    key={b.uid} 
    className={cn(
        "px-1.5 py-1 rounded-md text-[9px] font-black truncate text-white shadow-sm flex flex-col",
        getStatusColor(b.status)
    )}
  >
    <div className="flex items-center justify-between gap-1">
        <span className="truncate opacity-90">{b.service_name || b.service}</span>
    </div>
    {!isSolo && (
      <div className="flex items-center gap-1 mt-0.5 opacity-70">
          <UserIcon className="h-2 w-2" />
          <span className="truncate">{b.staff_name || 'Unassigned'}</span>
      </div>
    )}
  </div>
  ))}
  </div>
  </div>
  );
  })}
  </div>
  </GlassCard>
  );
}
