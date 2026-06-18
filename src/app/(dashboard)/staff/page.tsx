"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
 Users,
 Plus,
 Star,
 Mail,
 Calendar as CalendarIcon,
 TrendingUp,
 MoreVertical,
 ChevronRight,
 Search,
 MessageSquare,
 Download,
 UserX,
 UserCheck,
 CalendarCheck,
 Clock,
 CheckCircle2,
 XCircle,
 CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { staffService, PerformanceData } from "@/services/staff.service";
import { User } from "@/types/api";

export default function StaffPage() {
 const { user } = useAuth();
  const [staffList, setStaffList] = useState<User[]>([]);
 const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
 const [performance, setPerformance] = useState<PerformanceData | null>(null);
 const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
 const [inviteEmail, setInviteEmail] = useState("");
 const [inviteRole, setInviteRole] = useState("");
 const [searchQuery, setSearchQuery] = useState("");
 const [loading, setLoading] = useState(true);
 const [roles, setRoles] = useState<any[]>([]);
 const [isAddingRole, setIsAddingRole] = useState(false);
 const [newRoleName, setNewRoleName] = useState("");
 const [activeTab, setActiveTab] = useState<"team" | "invites">("team");
 const [detailTab, setDetailTab] = useState<"performance" | "schedule">("performance");
 const [invitations, setInvitations] = useState<any[]>([]);
 const [shifts, setShifts] = useState<any[]>([]);
 const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
 const [newShift, setNewShift] = useState({ startTime: "", endTime: "", notes: "" });
 const [performancePeriod, setPerformancePeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
 const router = useRouter();

 const fetchStaff = async () => {
    setLoading(true);
    try {
        const list = await staffService.getStaffList();
        setStaffList(list);
        if (list.length > 0) {
            // No auto-selection to follow user request
        }
    } catch (err) {
        console.error("Failed to fetch staff", err);
    } finally {
        setLoading(false);
    }
 };

 const fetchPerformance = async (uid: string, period: string = performancePeriod) => {
    try {
        const data = await staffService.getStaffPerformance(uid, period);
        setPerformance(data);
    } catch (err) {
        console.error("Failed to fetch performance", err);
    }
 };

 useEffect(() => {
    fetchStaff();
    fetchRoles();
    fetchInvitations();
 }, []);

 const fetchInvitations = async () => {
    try {
        const data = await staffService.getInvitations();
        setInvitations(data);
    } catch (err) {
        console.error("Failed to fetch invitations", err);
    }
 };

 const fetchRoles = async () => {
    try {
        const data = await staffService.getStaffRoles();
        setRoles(data);
    } catch (err) {
        console.error("Failed to fetch roles", err);
    }
 };

  const handleAddRole = async () => {
    if (!newRoleName) return;
    const toastId = toast.loading(`Creating role "${newRoleName}"...`);
    try {
        await staffService.createStaffRole(newRoleName);
        setNewRoleName("");
        setIsAddingRole(false);
        fetchRoles();
        toast.success("Role created successfully!", { id: toastId });
    } catch (err: any) {
        console.error("Failed to add role", err);
        toast.error(err?.message || "Failed to add role", { id: toastId });
    }
  };

 useEffect(() => {
    if (selectedStaff && (selectedStaff as any).viewStatus === 'ACTIVE') {
        fetchPerformance(selectedStaff.uid, performancePeriod);
        fetchStaffShifts(selectedStaff.uid);
    } else {
        setPerformance(null);
        setShifts([]);
    }
 }, [selectedStaff, performancePeriod]);

 const fetchStaffShifts = async (uid: string) => {
    try {
        const allShifts = await staffService.getShifts();
        setShifts(allShifts.filter((s: any) => s.staff === uid || s.staff?.uid === uid));
    } catch (err) {
        console.error("Failed to fetch shifts", err);
    }
 };

 const handleCreateShift = async () => {
    if (!selectedStaff || !newShift.startTime || !newShift.endTime) return;
    const toastId = toast.loading("Creating shift...");
    try {
        await staffService.createShift({
            staff: selectedStaff.uid,
            startTime: newShift.startTime,
            endTime: newShift.endTime,
            notes: newShift.notes
        });
        toast.success("Shift created successfully", { id: toastId });
        setIsShiftModalOpen(false);
        setNewShift({ startTime: "", endTime: "", notes: "" });
        fetchStaffShifts(selectedStaff.uid);
    } catch (err: any) {
        toast.error(err?.message || "Failed to create shift", { id: toastId });
    }
 };

 const handleDeleteShift = async (uid: string) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    const toastId = toast.loading("Deleting shift...");
    try {
        await staffService.deleteShift(uid);
        toast.success("Shift deleted", { id: toastId });
        if (selectedStaff) fetchStaffShifts(selectedStaff.uid);
    } catch (err: any) {
        toast.error(err?.message || "Failed to delete shift", { id: toastId });
    }
 };

  useEffect(() => {
    setSelectedStaff(null); // Clear selection when switching tabs
  }, [activeTab]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    const toastId = toast.loading(`Sending invitation to ${inviteEmail}...`);
    try {
        await staffService.inviteStaff(inviteEmail, inviteRole);
        toast.success(`Invite sent to ${inviteEmail}`, { id: toastId });
        setIsInviteModalOpen(false);
        setInviteEmail("");
        fetchInvitations();
    } catch (err: any) {
        console.error("Invite failed", err);
        toast.error(err?.message || "Failed to send invitation", { id: toastId });
    }
  };

  const filteredStaff = staffList.filter(s => 
    (s.firstName + " " + (s.lastName || "")).toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(s => ({
    ...s,
    viewStatus: 'ACTIVE',
    displayName: s.firstName ? `${s.firstName} ${s.lastName || ""}` : s.username,
    displayRole: s.staffProfile?.jobTitle || s.role
  }));

  const filteredInvites = invitations.filter(i => 
    i.status === 'PENDING' && i.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(i => ({
    uid: i.uid,
    username: i.email,
    name: i.email,
    displayName: i.email,
    displayRole: i.jobTitle || 'Staff',
    viewStatus: i.status,
    is_invitation: true
  }));

  const currentList = activeTab === 'team' ? filteredStaff : filteredInvites;

 return (
  <div className={cn("space-y-6 sm:space-y-10 pb-24 pt-6 md:pt-0 overflow-x-hidden w-full max-w-full px-1 sm:px-0")}>
   {/* Desktop/Mobile Header */}
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    <motion.div
     initial={{ opacity: 0, x: -20 }}
     animate={{ opacity: 1, x: 0 }}
     className={cn(selectedStaff && "hidden md:block")}
    >
     <h1 className="text-3xl font-extrabold tracking-tight text-primary">Workforce</h1>
     <p className="text-foreground/50 font-medium">Manage your team and performance.</p>
    </motion.div>

    <div className={cn("flex items-center gap-3", selectedStaff && "hidden md:flex")}>
     <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
      <DialogTrigger asChild>
       <Button 
        disabled={user?.verificationStatus !== 'verified'}
        title={user?.verificationStatus !== 'verified' ? "You must verify your business before inviting staff." : ""}
        className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
       >
        <Plus className="mr-2 h-4 w-4" /> Invite Staff
       </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
       <GlassCard className="border-white/40 shadow-2xl p-6 sm:p-8 space-y-6">
        <DialogHeader>
         <DialogTitle className="text-2xl font-extrabold text-primary">Invite Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
         <p className="text-sm font-medium text-foreground/50">Send an invitation to join your business.</p>
         <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Email</label>
          <div className="relative">
           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
           <Input 
            placeholder="staff@example.com" 
            className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border" 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
           />
          </div>
         </div>
         <div className="space-y-2">
           <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Role</label>
            <button 
             onClick={() => setIsAddingRole(!isAddingRole)}
             className="text-[10px] font-extrabold text-primary uppercase hover:underline"
            >
             {isAddingRole ? "Cancel" : "+ New"}
            </button>
           </div>
           
           {isAddingRole ? (
            <div className="flex gap-2">
             <Input 
              placeholder="Title" 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="h-12 rounded-xl bg-white/50 border-glass-border flex-1"
             />
             <Button onClick={handleAddRole} size="icon" className="h-12 w-12 shrink-0 rounded-xl bg-primary text-white">
              <Plus className="h-4 w-4" />
             </Button>
            </div>
           ) : (
            <select 
             className="w-full h-12 rounded-xl border border-glass-border bg-white/50 px-4 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
             value={inviteRole}
             onChange={(e) => setInviteRole(e.target.value)}
            >
             <option value="">Select Role</option>
             {roles.map(r => <option key={r.uid} value={r.name}>{r.name}</option>)}
            </select>
           )}
         </div>
        </div>
        <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold" onClick={handleInvite}>
         Send Invitation
        </Button>
       </GlassCard>
      </DialogContent>
     </Dialog>
    </div>
   </div>

   <div className="grid gap-8 lg:grid-cols-3">
    {/* Staff List - Hidden on mobile if staff selected */}
    <div className={cn("lg:col-span-1 space-y-6", selectedStaff && "hidden lg:block")}>
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
            <Input 
                placeholder="Search staff members..." 
                className="pl-11 h-12 bg-white/40 border-glass-border rounded-xl font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="flex gap-2 p-1.5 bg-white/30 rounded-2xl mb-4 sm:mb-6 border border-glass-border">
            <button 
                onClick={() => setActiveTab("team")}
                className={cn(
                    "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === "team" ? "bg-primary text-white shadow-lg" : "text-primary/60 hover:bg-white/40"
                )}
            >
                Staff ({staffList.length})
            </button>
            <button 
                onClick={() => setActiveTab("invites")}
                className={cn(
                    "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === "invites" ? "bg-primary text-white shadow-lg" : "text-primary/60 hover:bg-white/40"
                )}
            >
                Invites ({invitations.filter(i => i.status === 'PENDING').length})
            </button>
        </div>

        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">
                {activeTab === 'team' ? 'Active Team' : 'Invitations'}
            </h3>
            <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-2 py-1 rounded-lg">{currentList.length} Total</span>
        </div>
        <div className="space-y-3">
    {loading ? (
        <p className="text-sm font-medium text-foreground/40 text-center py-10">Loading...</p>
    ) : (
        currentList.length === 0 ? (
            <p className="text-sm font-medium text-foreground/40 text-center py-10 italic">No {activeTab} found matching "{searchQuery}"</p>
        ) : (
            currentList.map((item) => (
            <motion.div
                key={item.uid}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedStaff(item as any)}
                className={`cursor-pointer group transition-all ${selectedStaff?.uid === item.uid ? 'scale-[1.02]' : ''}`}
            >
                <GlassCard className={`p-3 sm:p-4 border-white/40 hover:bg-white/60 transition-all ${selectedStaff?.uid === item.uid ? 'bg-white/80 border-primary/30 shadow-xl shadow-primary/5' : ''}`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-2 border-white shadow-sm shrink-0">
                            <AvatarImage src={(item as any).avatar} />
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">{item.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-primary truncate text-xs sm:text-base">{(item as any).displayName}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <p className="text-[8px] sm:text-[9px] font-extrabold text-foreground/30 uppercase tracking-widest">{(item as any).displayRole}</p>
                                <span className={cn(
                                    "text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                                    item.viewStatus === 'ACTIVE' || item.viewStatus === 'ACCEPTED' ? "bg-green-500/10 text-green-600" : 
                                    item.viewStatus === 'PENDING' ? "bg-amber-500/10 text-amber-600" :
                                    "bg-red-500/10 text-red-600"
                                )}>
                                    {item.viewStatus}
                                </span>
                            </div>
                        </div>
                        {activeTab === 'team' && (
                            <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-accent/5 shrink-0">
                                <Star className="h-2.5 w-2.5 fill-accent text-accent" />
                                <span className="text-[10px] font-black text-primary">{(item as any).profile?.averageRating || '0.0'}</span>
                            </div>
                        )}
                        {activeTab === 'invites' && (
                            <Mail className="h-4 w-4 text-primary/30 shrink-0" />
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        ))
    )
    )}
</div>
  </div>

  {/* Staff Detail & Performance */}
  <div className={cn("lg:col-span-2 space-y-8", !selectedStaff && "hidden lg:block")}>
  {selectedStaff ? (
  <GlassCard className="p-5 sm:p-8 border-white/40">
   <div className="flex lg:hidden mb-4">
    <Button 
     variant="ghost" 
     onClick={() => setSelectedStaff(null)}
     className="p-0 h-auto font-black text-primary text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-transparent"
    >
     <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to List
    </Button>
   </div>

   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
  <div className="flex items-center gap-3 sm:gap-6 min-w-0">
  <Avatar className="h-12 w-12 sm:h-20 sm:w-20 rounded-2xl border-4 border-white shadow-xl flex-shrink-0">
  <AvatarImage src={selectedStaff.avatar} />
  <AvatarFallback>{selectedStaff.username[0]}</AvatarFallback>
  </Avatar>
  <div className="min-w-0">
  <h2 className="text-base sm:text-2xl font-black text-primary truncate">{(selectedStaff as any).displayName}</h2>
  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
  <span className="text-[10px] sm:text-sm font-bold text-foreground/40 text-capitalize">{(selectedStaff as any).displayRole}</span>
  <span className="h-1 w-1 rounded-full bg-foreground/20 hidden sm:block" />
  <span className={cn(
      "text-[7px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest",
      (selectedStaff as any).viewStatus === 'ACTIVE' || (selectedStaff as any).viewStatus === 'ACCEPTED' ? "text-green-600 bg-green-500/10" : "text-amber-600 bg-amber-500/10"
  )}>
      {(selectedStaff as any).viewStatus || 'ACTIVE'}
  </span>
  </div>
  </div>
  </div>

  <div className="flex gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end items-center sm:pr-4 w-full sm:w-auto">
      {(selectedStaff as any).viewStatus === 'ACTIVE' ? (
          <>
          <Button 
              onClick={() => router.push(`/staff/${selectedStaff.uid}`)}
              className="flex-1 sm:flex-none h-10 sm:h-11 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold text-white px-4 sm:px-6 transition-all hover:scale-105 text-xs sm:text-sm"
          >
              Profile
          </Button>
          <Button 
              variant="outline" 
              onClick={() => router.push(`/bookings?staff=${selectedStaff.uid}`)}
              className="h-10 sm:h-11 rounded-xl border-glass-border font-bold text-primary px-3 sm:px-4 bg-white/50 hover:bg-white transition-all flex-1 sm:flex-none text-xs sm:text-sm"
          >
              <CalendarCheck className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Schedule</span>
          </Button>
          </>
      ) : (
          <Button 
              onClick={async () => {
                  const toastId = toast.loading(`Resending invitation...`);
                  try {
                      await staffService.resendInvitation(selectedStaff.uid);
                      toast.success(`Invitation resent!`, { id: toastId });
                  } catch (err: any) {
                      toast.error(err?.message || "Failed to resend", { id: toastId });
                  }
              }}
              className="flex-1 sm:flex-none h-10 sm:h-11 rounded-xl bg-amber-600 shadow-lg shadow-amber-600/20 font-bold text-white px-4 sm:px-6 transition-all text-xs"
          >
              <Mail className="mr-2 h-4 w-4" /> Resend
          </Button>
      )}
      
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-glass-border hover:bg-white transition-all flex-shrink-0">
                  <MoreVertical className="h-5 w-5 text-foreground/40" />
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-glass-border bg-white/95 backdrop-blur-xl">
              <DropdownMenuLabel className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-2 py-3">Staff Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-glass-border mx-2" />
              <DropdownMenuItem 
                  onClick={() => toast.info(`Messaging ${selectedStaff.username}...`)}
                  className="rounded-xl h-11 px-3 focus:bg-primary/5 cursor-pointer"
              >
                  <MessageSquare className="mr-3 h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">Send Message</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                  onClick={() => toast.info("Exporting performance data...")}
                  className="rounded-xl h-11 px-3 focus:bg-primary/5 cursor-pointer"
              >
                  <Download className="mr-3 h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">Export Performance</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-glass-border mx-2" />
              <DropdownMenuItem 
                  onClick={async () => {
                      if (window.confirm(`Are you sure you want to deactivate ${selectedStaff.username}?`)) {
                          const toastId = toast.loading(`Deactivating ${selectedStaff.username}...`);
                          try {
                              await staffService.removeStaff(selectedStaff.uid);
                              toast.success("Staff member deactivated.", { id: toastId });
                              fetchStaff();
                              setSelectedStaff(null);
                          } catch (err: any) {
                              toast.error(err?.message || "Failed to deactivate staff", { id: toastId });
                          }
                      }
                  }}
                  className="rounded-xl h-11 px-3 focus:bg-red-50 text-red-600 cursor-pointer"
              >
                  <UserX className="mr-3 h-4 w-4" />
                  <span className="font-bold">Deactivate Account</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  </div>
  </div>

    {(selectedStaff as any).viewStatus === 'ACTIVE' && (
        <div className="space-y-8">
            <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10 w-fit">
                <button
                    onClick={() => setDetailTab("performance")}
                    className={cn(
                        "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        detailTab === "performance" ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
                    )}
                >
                    Performance
                </button>
                <button
                    onClick={() => setDetailTab("schedule")}
                    className={cn(
                        "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        detailTab === "schedule" ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
                    )}
                >
                    Shifts & Schedule
                </button>
            </div>

            {detailTab === "performance" ? (
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-[9px] font-black text-foreground/30 uppercase tracking-widest px-1">Revenue Performance (₦)</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10 w-fit">
                                        {['weekly', 'monthly', 'yearly'].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPerformancePeriod(p as any)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all",
                                                    performancePeriod === p ? "bg-primary text-white shadow-sm" : "text-primary/40 hover:text-primary"
                                                )}
                                            >
                                                {p.replace('ly', '')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {performance?.trend && (
                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] bg-green-500/5 px-2 py-1 rounded-lg border border-green-500/10 h-fit">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{performance.trend.value} {performance.trend.label}</span>
                                </div>
                            )}
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performance?.revenueChart || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
                                            if (value >= 1000) return `₦${(value / 1000).toFixed(0)}k`;
                                            return `₦${value}`;
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                        formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={performancePeriod === 'weekly' ? 40 : 30}>
                                        {(performance?.revenueChart || []).map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === (performance?.revenueChart.length || 0) - 1 ? '#1a237e' : '#1a237e'}
                                                fillOpacity={index === (performance?.revenueChart.length || 0) - 1 ? 1 : 0.2}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                  
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Jobs Completed", value: performance?.totalJobs || "0", icon: Users },
                            { label: "Avg. Rating", value: performance?.rating || "0.0", icon: Star },
                            { label: "Retention Rate", value: performance?.completionRate || "0%", icon: TrendingUp },
                            { label: "Active Hours", value: performance?.activeHours || "0h", icon: CalendarIcon },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-primary/[0.02] border border-primary/5">
                                <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-extrabold text-primary">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-1">Scheduled Shifts</h3>
                        <Button 
                            onClick={() => setIsShiftModalOpen(true)}
                            size="sm"
                            className="h-9 rounded-xl bg-primary text-white font-bold px-4"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Shift
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {shifts.length > 0 ? shifts.map((shift) => (
                            <GlassCard key={shift.uid} className="p-4 border-primary/10 bg-primary/[0.02]">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            <p className="font-bold text-primary">
                                                {new Date(shift.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <p className="text-xs font-semibold text-foreground/50">
                                            {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                            {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {shift.notes && <p className="text-[10px] text-foreground/40 italic mt-2">"{shift.notes}"</p>}
                                    </div>
                                    <Badge className={cn(
                                        "rounded-lg text-[8px] font-black uppercase tracking-tighter",
                                        shift.status === 'SCHEDULED' ? "bg-blue-500/10 text-blue-600" : 
                                        shift.status === 'COMPLETED' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                    )}>
                                        {shift.status}
                                    </Badge>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDeleteShift(shift.uid)}
                                        className="h-8 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg uppercase tracking-tight"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </GlassCard>
                        )) : (
                            <div className="sm:col-span-2 py-12 text-center border-2 border-dashed border-primary/10 rounded-2xl">
                                <CalendarDays className="h-10 w-10 text-primary/10 mx-auto mb-3" />
                                <p className="text-sm font-bold text-primary/40">No shifts scheduled</p>
                                <p className="text-[10px] text-foreground/30 mt-1">Add a work window for this staff member.</p>
                            </div>
                        )}
                    </div>

                    <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-primary">Add Shift</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Start Time</label>
                                    <Input 
                                        type="datetime-local" 
                                        className="h-12 rounded-xl"
                                        value={newShift.startTime}
                                        onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">End Time</label>
                                    <Input 
                                        type="datetime-local" 
                                        className="h-12 rounded-xl"
                                        value={newShift.endTime}
                                        onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Notes (Optional)</label>
                                    <Input 
                                        placeholder="e.g. Morning Shift" 
                                        className="h-12 rounded-xl"
                                        value={newShift.notes}
                                        onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold mt-4" onClick={handleCreateShift}>
                                    Schedule Shift
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    )}

  {(selectedStaff as any).viewStatus !== 'ACTIVE' && (
      <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
          </div>
          <div>
              <p className="text-xl font-extrabold text-primary">Invitation Pending</p>
              <p className="text-sm font-medium text-foreground/40 mt-1 max-w-sm">
                  This staff member has been invited but has not yet accepted. Performance metrics will appear once they join.
              </p>
          </div>
          <Button 
              onClick={async () => {
                const toastId = toast.loading(`Resending invitation to ${selectedStaff.username}...`);
                try {
                    await staffService.resendInvitation(selectedStaff.uid);
                    toast.success(`Invitation resent to ${selectedStaff.username}`, { id: toastId });
                } catch (err: any) {
                    toast.error(err?.message || "Failed to resend invitation", { id: toastId });
                }
              }}
              variant="outline" 
              className="border-amber-600/20 text-amber-600 hover:bg-amber-50 rounded-xl px-10"
          >
              Resend Invite Email
          </Button>
      </div>
  )}
  </GlassCard>
  ) : (
    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
            <Users className="h-10 w-10 text-primary/20" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary/40">No Staff Selected</h3>
            <p className="text-sm text-foreground/40 max-w-[280px]">Select a team member from the list to view their live performance and management tools.</p>
        </div>
    </div>
  )}
  </div>
  </div>
  </div>
  );
}
