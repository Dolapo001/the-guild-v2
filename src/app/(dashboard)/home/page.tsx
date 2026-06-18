"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Info,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  X,
  Sparkles,
  Star,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { bookingService, asList } from "@/services/booking.service";
import { dashboardService, DashboardStats } from "@/services/dashboard.service";
import { staffService } from "@/services/staff.service";
import { authService } from "@/services/auth.service";
import { Booking, User } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [revenueOffset, setRevenueOffset] = useState(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(1);
  const [upgradeData, setUpgradeData] = useState({ staffSize: "", goal: "" });
  const [isDowngrading, setIsDowngrading] = useState(false);

  const unassignedBookings = bookings.filter(b => b.status === "PENDING" || b.status === "Unassigned");

  useEffect(() => {
    // Redirect removed so unverified businesses can still see their dashboard

    const fetchData = async () => {
      try {
        const [stats, bks, staff, rev] = await Promise.all([
          dashboardService.getStats(),
          bookingService.getBookings(),
          staffService.getStaffList(),
          dashboardService.getRevenue()
        ]);
        setStatsData(stats);
        setBookings(asList(bks));
        setStaffList(staff.map((s: any) => ({
          ...s,
          id: s.uid,
          name: s.username,
          isBusy: false,
          // Removed hardcoded matchScore
        })));
        setRevenueData(rev);

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, router]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const rev = await dashboardService.getRevenue(revenuePeriod, revenueOffset);
        setRevenueData(rev.length > 0 ? rev : [
          { month: 'No Data', amount: 0 }
        ]);
      } catch (err) {
        console.error("Failed to fetch revenue data", err);
      }
    };
    if (user && !loading) fetchRevenue();
  }, [revenuePeriod, revenueOffset, user, loading]);

  const handleAssign = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsAssignModalOpen(true);
  };

  const confirmAssignment = async (staff: any) => {
    if (!selectedBooking || !staff) return;
    const toastId = toast.loading("Assigning professional...");
    try {
      await bookingService.updateBookingStatus(selectedBooking.uid, "CONFIRMED");
      const bks = await bookingService.getBookings();
      setBookings(asList(bks));
      setIsAssignModalOpen(false);
      setSelectedBooking(null);
      toast.success(`Assignment confirmed! ${staff.name} has been notified.`, { id: toastId });
    } catch (err) {
      console.error("Failed to assign staff", err);
      toast.error("Failed to assign staff. Please try again.", { id: toastId });
    }
  };

  const handleUpgradeToAgency = async () => {
    const toastId = toast.loading("Processing agency upgrade...");
    try {
      const updatedUser = await authService.updateProfile({ isSoloOperator: false });
      if (updatedUser) {
        setIsUpgradeModalOpen(false);
        setUpgradeStep(1);
        toast.success("Success! You've upgraded to an Agency.", { id: toastId });
        setTimeout(() => window.location.reload(), 1500); 
      }
    } catch (err) {
      console.error("Failed to upgrade to agency", err);
      toast.error("Failed to upgrade. Please try again.", { id: toastId });
    }
  };

  const handleDowngradeToSolo = async () => {
    setIsDowngrading(true);
    const toastId = toast.loading("Switching to Solo Mode...");
    try {
      await authService.updateProfile({ isSoloOperator: true });
      toast.success("Switched to Solo Mode.", { id: toastId });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Failed to downgrade", err);
      toast.error("Failed to switch back. Please try again.", { id: toastId });
    } finally {
      setIsDowngrading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getTrendDirection = (value: string | undefined): "up" | "down" | "neutral" => {
    if (!value || value === "0%" || value === "0" || parseFloat(value.replace('%', '')) === 0) return "neutral";
    return value.startsWith('-') ? "down" : "up";
  };

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: `₦ ${(statsData?.totalRevenue ?? 0).toLocaleString()}`,
      change: statsData?.trends?.revenue ?? "0%",
      trend: getTrendDirection(statsData?.trends?.revenue),
      icon: CreditCard,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Bookings",
      value: (statsData?.activeBookings ?? 0).toString(),
      change: statsData?.trends?.bookings ?? "0",
      trend: getTrendDirection(statsData?.trends?.bookings),
      icon: Calendar,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    !user?.isSoloOperator && {
      title: "Staff Active",
      value: (statsData?.staffActive ?? 0).toString(),
      change: statsData?.trends?.staff ?? "0",
      trend: getTrendDirection(statsData?.trends?.staff),
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: user?.role === 'admin' ? "Pending Verifications" : "Satisfaction Rating",
      value: user?.role === 'admin' 
        ? (statsData?.pendingVerifications ?? 0).toString() 
        : (statsData?.averageRating ?? 0.0).toFixed(1),
      change: statsData?.trends?.rating ?? "0",
      trend: getTrendDirection(statsData?.trends?.rating),
      icon: user?.role === 'admin' ? AlertCircle : Star,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ].filter(Boolean) as any[];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      {/* Verification Status Banners */}
      {(user?.verificationStatus === "pending" || user?.verificationStatus === "PENDING") && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-tight sm:max-w-md">
              Verification Under Review: Full marketplace access will be granted once documents are validated.
            </p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-600 border-0 font-black px-4 whitespace-nowrap">PENDING</Badge>
        </motion.div>
      )}

      {(user?.verificationStatus === "unverified" || user?.verificationStatus === "UNVERIFIED" || !user?.verificationStatus) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-tight sm:max-w-md">
              Action Required: Complete your business verification to unlock full marketplace features and receive bookings.
            </p>
          </div>
          <Link href="/home/profile/verification">
            <Button className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20">
              Complete Verification <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Unassigned Bookings Alert */}
      {unassignedBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="bg-red-500/5 border-red-500/20 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-500/5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-black text-primary uppercase tracking-tight truncate">
                  {user?.isSoloOperator ? "Pending Appointments" : `Action Required: ${unassignedBookings.length} Request${unassignedBookings.length > 1 ? 's' : ''}`}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-foreground/50 truncate">
                  {user?.isSoloOperator ? "Review your schedule" : "Professionals need assignment."}
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Link href="/bookings" className="w-full md:w-auto">
                <Button
                  className="w-full md:w-auto bg-primary text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-primary/20"
                >
                  {user?.isSoloOperator ? "Review" : "Assign"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-primary">{getGreeting()}, {user?.name?.split(' ')[0] || user?.username}</h1>
          <p className="text-sm sm:text-base text-foreground/50 font-medium">
            Your business pulse for today.
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          <GlassCard className={cn(
            "px-4 py-2 flex items-center gap-2 border-0",
            user?.verificationStatus === 'verified' ? "bg-accent/10" : 
            user?.verificationStatus === 'pending' ? "bg-amber-500/10" : 
            "bg-red-500/10"
          )}>
            <ShieldCheck className={cn(
              "h-4 w-4",
              user?.verificationStatus === 'verified' ? "text-accent" : 
              user?.verificationStatus === 'pending' ? "text-amber-600" : 
              "text-red-500"
            )} />
            <span className={cn(
               "text-[10px] font-black uppercase tracking-widest",
               user?.verificationStatus === 'verified' ? "text-accent" : 
               user?.verificationStatus === 'pending' ? "text-amber-600" : 
               "text-red-500"
            )}>
              {user?.verificationStatus === 'verified' ? 'Enterprise Verified' : 
               user?.verificationStatus === 'pending' ? 'Compliance Pending' : 'Unverified SME'}
            </span>
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <KpiCard
            key={index}
            label={stat.title}
            value={stat.value}
            delta={stat.change}
            trend={stat.trend as "up" | "down" | "neutral"}
            icon={stat.icon}
            iconClassName={`${stat.bg} ${stat.color}`}
            delay={index * 0.08}
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Revenue Graph Container */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-5 sm:p-8 border-white/40 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <h3 className="text-lg sm:text-xl font-bold text-primary">Revenue</h3>
                <div className="flex items-center gap-1 sm:ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-primary/5 text-primary/40"
                    onClick={() => setRevenueOffset(prev => prev + 1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-primary/5 text-primary/40 disabled:opacity-20"
                    disabled={revenueOffset === 0}
                    onClick={() => setRevenueOffset(prev => prev - 1)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10 w-full sm:w-auto">
                {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setRevenuePeriod(p);
                      setRevenueOffset(0);
                    }}
                    className={cn(
                      "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      revenuePeriod === p 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-primary/40 hover:text-primary"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(val) => `₦${val >= 1000 ? (val/1000) + 'k' : val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontWeight: 800
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    name="Actual Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Dynamic Column for filling space */}
        {user?.isSoloOperator ? (
          <GlassCard className="p-5 sm:p-8 border-white/40 bg-primary/5 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-primary mb-3">Scale Up</h3>
              <p className="text-sm sm:text-base font-medium text-foreground/50 leading-relaxed">
                Ready to expand? Transition your business into a full agency and start hiring professionals to handle more bookings.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-10">
              <Link href="/profile">
                <Button 
                  className="w-full justify-between h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-primary group"
                >
                  <span className="text-sm sm:text-base font-bold">Update Portfolio</span>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 opacity-40 group-hover:rotate-90 transition-transform" />
                </Button>
              </Link>
              <Button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full justify-between h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all font-bold"
              >
                <span className="text-sm sm:text-base">Go Agency</span>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
              </Button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-5 sm:p-8 border-white/40">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-6">Staff Performance</h3>
            <div className="space-y-4 sm:space-y-6">
              {staffList.slice(0, 4).map((staff, i) => (
                <Link
                  key={i}
                  href={`/staff/${staff.id}`}
                  className="flex items-center gap-3 sm:gap-4 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-2 border-white shadow-sm shrink-0">
                    <AvatarImage src={staff.avatar} />
                    <AvatarFallback>{(staff.name || "S")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-primary truncate">{staff.name}</p>
                    <div className="flex items-center gap-2 mt-1 sm:mt-1">
                      <div className="flex-1 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(staff.rating || 5) * 20}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-primary">{staff.rating || "5.0"}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                </Link>
              ))}
              {staffList.length === 0 && <p className="text-center py-4 text-foreground/30 italic">No staff found.</p>}
            </div>
            <Link href="/staff">
              <Button className="w-full mt-6 sm:mt-8 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold border-0 h-10 sm:h-12 rounded-xl transition-all">
                Manage All
              </Button>
            </Link>
          </GlassCard>
        )}
      </div>

      <GlassCard className="p-5 sm:p-8 border-white/40">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-primary">Schedule</h3>
          <Link href="/bookings">
            <Button variant="ghost" className="h-auto p-0 text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest hover:bg-transparent">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {bookings.slice(0, 4).map((booking, i) => (
            <Link
              key={i}
              href={`/bookings/${booking.uid}`}
              className="flex items-center justify-between group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all uppercase shrink-0 text-sm">
                  {(booking.customerName || booking.customer || "?")[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-primary truncate text-sm sm:text-base">{booking.customerName || "Customer"}</p>
                  <p className="text-[10px] sm:text-xs font-medium text-foreground/40 truncate">{booking.serviceName || booking.service} • {booking.startTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="text-right hidden xs:block">
                  <p className="text-xs font-bold text-primary">₦{(Number(booking.totalPrice) || 0).toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      booking.status === 'CONFIRMED' ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <p className="text-[9px] font-black text-foreground/40 uppercase tracking-tighter">{booking.status}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
          {bookings.length === 0 && (
            <div className="col-span-2 text-center py-10 opacity-30 italic text-sm">No upcoming sessions.</div>
          )}
        </div>
      </GlassCard>

      {/* Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-primary flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-secondary" /> Assign Professional
              </DialogTitle>
            </DialogHeader>

            {selectedBooking ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Booking Details</p>
                  <p className="font-bold text-primary">{selectedBooking.serviceName}</p>
                  <p className="text-sm font-medium text-foreground/50">{selectedBooking.customerName} • {selectedBooking.startTime || 'No time'}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Available Staff</p>
                  <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {staffList.map((staff) => (
                      <div
                        key={staff.uid || staff.id}
                        onClick={() => confirmAssignment(staff)}
                        className="p-4 rounded-2xl border border-glass-border bg-white/40 hover:border-primary/30 hover:bg-white/60 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-xl border-2 border-white shadow-sm">
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback>{(staff.name || staff.username)[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-primary">{staff.name || staff.username}</p>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{staff.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 text-accent">
                            <Star className="h-3 w-3 fill-accent" />
                            <span className="text-xs font-bold">{staff.rating || '4.8'}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center opacity-40 italic">No booking selected.</div>
            )}

            <Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
          </GlassCard>
        </DialogContent>
      </Dialog>
      {/* Upgrade to Agency Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" /> Scale Your Business
              </DialogTitle>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {upgradeStep === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <p className="text-sm font-medium text-foreground/60 leading-relaxed">
                    Transitioning to an agency allows you to hire staff, manage multiple bookings simultaneously, and scale your revenue.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest">Expected Team Size</label>
                      <select 
                        className="w-full h-12 px-4 rounded-xl bg-white/50 border border-glass-border font-bold text-sm focus:outline-none"
                        value={upgradeData.staffSize}
                        onChange={(e) => setUpgradeData({...upgradeData, staffSize: e.target.value})}
                      >
                        <option value="">Select size...</option>
                        <option value="1-5">1-5 Members</option>
                        <option value="6-20">6-20 Members</option>
                        <option value="20+">20+ Members</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    disabled={!upgradeData.staffSize}
                    className="w-full h-12 rounded-xl bg-primary text-white font-bold"
                    onClick={() => setUpgradeStep(2)}
                  >
                    Next Step
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest">Expansion Goal</label>
                      <textarea 
                        placeholder="What's your main goal for expanding?"
                        className="w-full h-24 p-4 rounded-xl bg-white/50 border border-glass-border font-bold text-sm focus:outline-none resize-none"
                        value={upgradeData.goal}
                        onChange={(e) => setUpgradeData({...upgradeData, goal: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setUpgradeStep(1)}>Back</Button>
                    <Button 
                      disabled={!upgradeData.goal}
                      className="flex-2 h-12 rounded-xl bg-primary text-white font-black"
                      onClick={handleUpgradeToAgency}
                    >
                      Confirm Upgrade
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </DialogContent>
      </Dialog>
    </div>
  );
}
