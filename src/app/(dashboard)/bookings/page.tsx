"use client";

import { useState, useMemo } from "react";
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
    User,
    Check,
    X
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
import { MOCK_STAFF } from "@/lib/mock-data";
import Link from "next/link";

type BookingStatus = "requested" | "accepted" | "in-progress" | "completed";

interface Booking {
    id: string;
    customerName: string;
    service: string;
    time: string;
    date: string; // 'YYYY-MM-DD'
    status: BookingStatus;
    amount: string;
    location: string;
    staff?: string;
}

const initialBookings: Booking[] = [
    {
        id: "1",
        customerName: "Alice Johnson",
        service: "Deep Tissue Massage",
        time: "10:00 AM",
        date: "2026-01-11",
        status: "in-progress",
        amount: "₦ 18,000",
        location: "Lekki Phase 1",
        staff: "Sarah Johnson",
    },
    {
        id: "2",
        customerName: "Tunde Bakare",
        service: "Haircut & Beard Trim",
        time: "11:30 AM",
        date: "2026-01-11",
        status: "accepted",
        amount: "₦ 5,000",
        location: "Victoria Island",
        staff: "Michael Chen",
    },
    {
        id: "3",
        customerName: "Chioma Okeke",
        service: "Manicure & Pedicure",
        time: "01:00 PM",
        date: "2026-01-12",
        status: "requested",
        amount: "₦ 12,000",
        location: "Ikeja GRA",
    },
    {
        id: "4",
        customerName: "David Lee",
        service: "Facial Treatment",
        time: "02:30 PM",
        date: "2026-01-11",
        status: "completed",
        amount: "₦ 25,000",
        location: "Lekki Phase 1",
        staff: "Sarah Johnson",
    },
    {
        id: "5",
        customerName: "Sophia Williams",
        service: "Bridal Makeup",
        time: "09:00 AM",
        date: "2026-01-13",
        status: "requested",
        amount: "₦ 45,000",
        location: "Ikeja GRA",
    }
];

const columns: { id: BookingStatus; title: string; icon: any; color: string }[] = [
    { id: "requested", title: "Requested", icon: Clock, color: "text-blue-500" },
    { id: "accepted", title: "Accepted", icon: CheckCircle2, color: "text-secondary" },
    { id: "in-progress", title: "In Progress", icon: PlayCircle, color: "text-primary" },
    { id: "completed", title: "Completed", icon: CheckCircle2, color: "text-accent" },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [viewMode, setViewMode] = useState<"kanban" | "list" | "month">("kanban");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date("2026-01-11"));
    const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
    const [staffFilter, setStaffFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const dateString = selectedDate.toISOString().split('T')[0];

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchesDate = viewMode === 'month' ? true : b.date === dateString;
            const matchesStaff = staffFilter === 'all' ? true : b.staff === staffFilter;
            const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.service.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesDate && matchesStaff && matchesSearch;
        });
    }, [bookings, dateString, staffFilter, searchQuery, viewMode]);

    const moveBooking = (id: string, newStatus: BookingStatus) => {
        setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
    };

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

    const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newBooking: Booking = {
            id: `B-${Math.floor(Math.random() * 10000)}`,
            customerName: formData.get('customerName') as string,
            service: formData.get('service') as string,
            time: formData.get('time') as string,
            date: dateString,
            status: 'requested',
            amount: `₦ ${Number(formData.get('price')).toLocaleString()}`,
            location: 'In-Studio',
            staff: formData.get('staff') as string || undefined,
        };
        setBookings(prev => [...prev, newBooking]);
        setIsNewBookingOpen(false);
        // Mock Toast
        const toast = document.createElement('div');
        toast.className = "fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold z-50 animate-bounce";
        toast.innerText = "✅ Booking created successfully!";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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
                                Team Mode
                            </Badge>
                        </div>
                        <p className="text-foreground/50 font-medium">Manage your schedule and team assignments.</p>
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
                        <div className="flex items-center gap-1 bg-white/40 dark:bg-white/5 p-1 rounded-xl border border-glass-border">
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
                            onClick={() => setSelectedDate(new Date("2026-01-11"))}
                            className="h-12 rounded-xl border-glass-border font-bold text-xs uppercase tracking-widest hover:bg-primary/5"
                        >
                            Today
                        </Button>
                    </div>

                    {/* View Toggles */}
                    <div className="flex items-center gap-1 p-1 bg-white/40 dark:bg-white/5 rounded-xl border border-glass-border">
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-12 rounded-xl border-glass-border font-bold text-primary hover:bg-primary/5">
                                    <Filter className="mr-2 h-4 w-4" /> {staffFilter === 'all' ? 'All Staff' : staffFilter.split(' ')[0]}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-glass-border w-48 p-2">
                                <DropdownMenuItem
                                    onClick={() => setStaffFilter('all')}
                                    className={cn("rounded-lg font-bold text-xs mb-1", staffFilter === 'all' && "bg-primary/10 text-primary")}
                                >
                                    All Staff
                                </DropdownMenuItem>
                                {MOCK_STAFF.map(s => (
                                    <DropdownMenuItem
                                        key={s.id}
                                        onClick={() => setStaffFilter(s.name)}
                                        className={cn("rounded-lg font-bold text-xs mb-1", staffFilter === s.name && "bg-primary/10 text-primary")}
                                    >
                                        {s.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                    {viewMode === 'month' && (
                        <MonthView
                            bookings={bookings}
                            selectedDate={selectedDate}
                            onDateClick={(date) => {
                                setSelectedDate(date);
                                setViewMode('kanban');
                            }}
                        />
                    )}

                    {viewMode === 'kanban' && (
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
                                                <BookingCard key={booking.id} booking={booking} moveBooking={moveBooking} />
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <GlassCard className="overflow-hidden border-white/40">
                            {filteredBookings.length === 0 ? (
                                <div className="p-20 text-center">
                                    <CalendarIcon className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-primary">No bookings for this date.</p>
                                    <p className="text-sm text-foreground/40">Relax or add a walk-in booking.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5 border-b border-glass-border">
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Time</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Customer</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Service</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Staff</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Status</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest">Amount</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase tracking-widest"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="border-b border-glass-border hover:bg-white/40 transition-colors">
                                                <td className="p-4 text-sm font-bold text-primary/60">{booking.time}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                                                            {booking.customerName[0]}
                                                        </div>
                                                        <p className="text-sm font-bold text-primary">{booking.customerName}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-medium text-foreground/60">{booking.service}</td>
                                                <td className="p-4">
                                                    {booking.staff ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                                                                {booking.staff[0]}
                                                            </div>
                                                            <span className="text-xs font-bold text-foreground/60">{booking.staff}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-foreground/20 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-0 ${booking.status === 'completed' ? 'bg-accent/10 text-accent' :
                                                            booking.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                                                                booking.status === 'accepted' ? 'bg-secondary/10 text-secondary' :
                                                                    'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {booking.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-sm font-extrabold text-primary">{booking.amount}</td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4 text-foreground/40" />
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

            {/* New Booking Modal */}
            <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <GlassCard className="border-white/40 shadow-2xl p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-primary flex items-center gap-2">
                                <Plus className="h-6 w-6 text-secondary" /> Create New Booking
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreateBooking} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Customer Name</label>
                                    <Input name="customerName" required placeholder="e.g. John Doe" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Service</label>
                                        <select name="service" required className="w-full h-12 rounded-xl border border-glass-border bg-white/50 px-4 text-sm font-bold text-primary focus:outline-none">
                                            <option>Deep Tissue Massage</option>
                                            <option>Haircut & Beard Trim</option>
                                            <option>Manicure & Pedicure</option>
                                            <option>Facial Treatment</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Staff</label>
                                        <select name="staff" className="w-full h-12 rounded-xl border border-glass-border bg-white/50 px-4 text-sm font-bold text-primary focus:outline-none">
                                            <option value="">Auto-Assign</option>
                                            {MOCK_STAFF.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Time</label>
                                        <Input name="time" type="time" required className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Price (₦)</label>
                                        <Input name="price" type="number" required placeholder="15000" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsNewBookingOpen(false)} className="flex-1 h-12 rounded-xl font-bold">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20">
                                    Create Booking
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function BookingCard({ booking, moveBooking }: { booking: Booking, moveBooking: (id: string, status: BookingStatus) => void }) {
    return (
        <GlassCard className="p-5 hover:bg-white/80 transition-all border-white/60 shadow-glass-sm group">
            <div className="flex justify-between items-start mb-4">
                <Link href={`/bookings/${booking.id}`} className="flex-1">
                    <p className="font-extrabold text-primary text-sm mb-0.5 group-hover:text-secondary transition-colors">{booking.customerName}</p>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">{booking.service}</p>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5">
                            <MoreHorizontal className="h-4 w-4 text-foreground/40" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-glass-border p-2">
                        <DropdownMenuItem onClick={() => moveBooking(booking.id, 'accepted')} className="rounded-lg text-xs font-bold mb-1">Move to Accepted</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => moveBooking(booking.id, 'in-progress')} className="rounded-lg text-xs font-bold mb-1">Move to In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => moveBooking(booking.id, 'completed')} className="rounded-lg text-xs font-bold mb-1">Move to Completed</DropdownMenuItem>
                        <div className="h-px bg-primary/5 my-1" />
                        <DropdownMenuItem className="rounded-lg text-xs font-bold text-red-500">Cancel Booking</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50">
                    <MapPin className="h-3 w-3" /> {booking.location}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/60">
                        <Clock className="h-3 w-3" /> {booking.time}
                    </div>
                    <span className="text-xs font-extrabold text-primary">{booking.amount}</span>
                </div>
                {booking.staff && (
                    <div className="flex items-center gap-2 pt-2">
                        <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                            {booking.staff[0]}
                        </div>
                        <span className="text-[10px] font-bold text-foreground/60">{booking.staff}</span>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

function MonthView({ bookings, selectedDate, onDateClick }: { bookings: Booking[], selectedDate: Date, onDateClick: (date: Date) => void }) {
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

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case 'completed': return 'bg-accent';
            case 'in-progress': return 'bg-primary';
            case 'accepted': return 'bg-secondary';
            default: return 'bg-blue-500';
        }
    };

    return (
        <GlassCard className="p-8 border-white/40">
            <div className="grid grid-cols-7 gap-px bg-glass-border rounded-2xl overflow-hidden border border-glass-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bg-white/40 dark:bg-white/5 p-4 text-center text-[10px] font-extrabold text-primary uppercase tracking-widest">
                        {d}
                    </div>
                ))}
                {days.map((date, i) => {
                    if (!date) return <div key={i} className="bg-white/20 dark:bg-white/5 min-h-[120px]" />;

                    const dStr = date.toISOString().split('T')[0];
                    const dayBookings = bookings.filter(b => b.date === dStr);
                    const isToday = new Date().toISOString().split('T')[0] === dStr;
                    const isSelected = selectedDate.toISOString().split('T')[0] === dStr;

                    return (
                        <div
                            key={i}
                            onClick={() => onDateClick(date)}
                            className={cn(
                                "bg-white/60 dark:bg-white/10 min-h-[120px] p-3 cursor-pointer hover:bg-white/80 dark:hover:bg-white/20 transition-all flex flex-col gap-2",
                                isSelected && "ring-2 ring-inset ring-primary bg-primary/5"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-bold",
                                    isToday ? "h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center -m-1" : "text-primary/60"
                                )}>
                                    {date.getDate()}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {dayBookings.slice(0, 4).map(b => (
                                    <div key={b.id} className={cn("h-1.5 flex-1 min-w-[10px] rounded-full", getStatusColor(b.status))} />
                                ))}
                                {dayBookings.length > 4 && (
                                    <span className="text-[8px] font-bold text-foreground/40">+{dayBookings.length - 4}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}
