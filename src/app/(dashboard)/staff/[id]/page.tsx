"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Star,
    Clock,
    CheckCircle2,
    Calendar,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Loader2,
    MoreHorizontal,
    Trash2,
    MessageCircle,
    UserCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { staffService, PerformanceData } from "@/services/staff.service";
import { User } from "@/types/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function StaffDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [staff, setStaff] = useState<User | null>(null);
    const [performance, setPerformance] = useState<PerformanceData | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        job_title: ""
    });
    const [updating, setUpdating] = useState(false);

    const loadStaffData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [details, perf, history] = await Promise.all([
                    staffService.getStaffDetails(id as string),
                    staffService.getStaffPerformance(id as string),
                    staffService.getStaffBookings(id as string)
                ]);
                setStaff(details);
                setPerformance(perf);
                setBookings(history);
            } catch (err) {
                console.error("Failed to load staff details", err);
            } finally {
                setLoading(true); // Wait, should be false
                setLoading(false);
            }
        };
    useEffect(() => {
        loadStaffData();
    }, [id]);

    const handleRemoveStaff = async () => {
        if (!staff) return;
        const confirmResult = window.confirm(`Are you sure you want to remove ${staff.username} from your workforce?`);
        if (!confirmResult) return;
        
        const toastId = toast.loading(`Removing ${staff.username}...`);
        setRemoving(true);
        try {
            await staffService.removeStaff(staff.uid);
            toast.success("Staff member removed successfully.", { id: toastId });
            router.push('/staff');
        } catch (err) {
            console.error("Failed to remove staff", err);
            toast.error("Error removing staff. Please try again.", { id: toastId });
        } finally {
            setRemoving(false);
        }
    };

    const handleSaveNote = async () => {
        if (!staff) return;
        const toastId = toast.loading("Saving internal note...");
        setSavingNote(true);
        try {
            const updatedStaff = await staffService.updateStaff(staff.uid, { internal_notes: noteDraft });
            setStaff(updatedStaff);
            setIsEditingNote(false);
            toast.success("Internal note saved.", { id: toastId });
        } catch (err) {
            console.error("Failed to save note", err);
            toast.error("Failed to save note. Please try again.", { id: toastId });
        } finally {
            setSavingNote(false);
        }
    };

    const startEditingNote = () => {
        setNoteDraft(staff?.staff_profile?.internal_notes || "");
        setIsEditingNote(true);
    };

    const handleEditProfile = () => {
        if (!staff) return;
        setEditForm({
            first_name: staff.first_name || "",
            last_name: staff.last_name || "",
            email: staff.email || "",
            job_title: staff.staff_profile?.job_title || ""
        });
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        if (!staff) return;
        const toastId = toast.loading("Updating staff profile...");
        setUpdating(true);
        try {
            const updated = await staffService.updateStaff(staff.uid, editForm);
            setStaff(updated);
            setShowEditModal(false);
            toast.success("Profile updated successfully!", { id: toastId });
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error("Failed to update profile. Please check your data.", { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="font-bold text-foreground/40 uppercase tracking-widest">Loading Staff Profile...</p>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="text-center py-20">
                <p className="text-xl font-bold text-primary">Staff member not found.</p>
                <Button onClick={() => router.back()} className="mt-4 bg-primary text-white">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="group text-primary/60 hover:text-primary font-bold transition-all"
                >
                    <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Workforce
                </Button>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleEditProfile}
                        className="border-glass-border font-bold text-primary rounded-xl"
                    >
                        Edit Profile
                    </Button>
                    <Button 
                        onClick={() => toast.info("Messaging coming soon!")}
                        className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-xl shadow-lg shadow-primary/20"
                    >
                        <MessageCircle className="mr-2 h-4 w-4" /> Message {staff.first_name || staff.username}
                    </Button>
                    <Button 
                        variant="destructive"
                        disabled={removing}
                        onClick={handleRemoveStaff}
                        className="bg-red-500 hover:bg-red-600 text-white font-black px-4 rounded-xl shadow-lg shadow-red-500/20"
                    >
                        {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Profile Header */}
            <div className="grid lg:grid-cols-3 gap-8">
                <GlassCard className="lg:col-span-1 p-8 text-center border-white/40">
                    <div className="relative inline-block mx-auto mb-6">
                        <Avatar className="h-40 w-40 rounded-[2.5rem] border-4 border-white shadow-2xl">
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback className="text-4xl">{(staff.first_name || staff.username)[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-black text-primary mb-1">{staff.first_name ? `${staff.first_name} ${staff.last_name || ''}` : staff.username}</h1>
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mb-6">{staff.staff_profile?.job_title || 'Service Professional'}</p>
                    
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <div>
                            <p className="text-lg font-black text-primary">{performance?.rating || '5.0'}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={cn("h-3 w-3", s <= 4 ? "fill-amber-500 text-amber-500" : "text-foreground/20")} />
                                ))}
                            </div>
                        </div>
                        <div className="w-px h-10 bg-glass-border" />
                        <div>
                            <p className="text-lg font-black text-primary">{performance?.total_jobs || '0'}</p>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">Jobs Done</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-glass-border">
                        <div className="flex items-center gap-3 text-sm font-bold text-primary/70">
                            <Mail className="h-4 w-4 text-primary/40" /> {staff.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-primary/70">
                            <Phone className="h-4 w-4 text-primary/40" /> +234 800 000 0000
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-primary/70">
                            <MapPin className="h-4 w-4 text-primary/40" /> Lagos, Nigeria
                        </div>
                    </div>
                </GlassCard>

                {/* Performance Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <GlassCard className="p-6 border-white/40 bg-primary/5 border-primary/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-primary text-white">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-primary">Success Rate</h3>
                            </div>
                            <p className="text-4xl font-black text-primary">{performance?.completion_rate || '100%'}</p>
                            <p className="text-xs font-bold text-foreground/40 mt-1">Based on last 30 days</p>
                        </GlassCard>
                        <GlassCard className="p-6 border-white/40 bg-secondary/5 border-secondary/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-secondary text-white">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-primary">On-Time Arrival</h3>
                            </div>
                            <p className="text-4xl font-black text-primary">96%</p>
                            <p className="text-xs font-bold text-foreground/40 mt-1">Reliability score</p>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-8 border-white/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-primary">Earnings Growth</h3>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">Monthly Trend</Badge>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performance?.revenue_chart || []}>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={30}>
                                        {(performance?.revenue_chart || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === (performance?.revenue_chart.length || 0) - 1 ? 'rgb(var(--primary))' : 'rgba(var(--primary), 0.2)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Job History */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-xl font-bold text-primary mb-8">Task History</h3>
                        <div className="space-y-4">
                            {bookings.map((booking, i) => (
                                <Link 
                                    key={i} 
                                    href={`/bookings/${booking.uid}`}
                                    className="p-4 rounded-2xl bg-white/40 border border-glass-border hover:border-primary/30 hover:bg-white/60 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all uppercase">
                                            {(booking.customer_name || 'C')[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-primary group-hover:text-primary/80">{booking.service_name || booking.service}</p>
                                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">{booking.date} • {booking.customer_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-primary">₦{(Number(booking.total_price) || 0).toLocaleString()}</p>
                                            <Badge className={cn(
                                                "mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border-0",
                                                booking.status === 'COMPLETED' ? "bg-accent/10 text-accent" : 
                                                booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED' ? "bg-secondary/10 text-secondary" :
                                                "bg-primary/10 text-primary"
                                            )}>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {bookings.length === 0 && (
                                <div className="text-center py-10 opacity-40 italic">No job history found.</div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Upcoming / Current Status */}
                <div className="space-y-8">
                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-lg font-bold text-primary mb-6">Internal Notes</h3>
                        
                        {isEditingNote ? (
                            <div className="space-y-4">
                                <textarea 
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                    placeholder="Add internal feedback for this staff member..."
                                    className="w-full h-32 p-4 rounded-xl bg-white/50 border border-glass-border focus:border-primary/30 focus:outline-none text-sm font-medium resize-none"
                                />
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={handleSaveNote}
                                        disabled={savingNote}
                                        className="flex-1 bg-primary text-white font-bold h-10 rounded-xl"
                                    >
                                        {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => setIsEditingNote(false)}
                                        className="flex-1 border-glass-border font-bold h-10 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-900/60 text-xs font-semibold leading-relaxed italic min-h-[80px]">
                                    {staff.staff_profile?.internal_notes || "No internal notes have been added yet for this staff member."}
                                </div>
                                <Button 
                                    onClick={startEditingNote}
                                    className="w-full mt-6 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold border-0 h-11 transition-all rounded-xl shadow-sm"
                                >
                                    {staff.staff_profile?.internal_notes ? "Edit Note" : "Add Note"}
                                </Button>
                            </>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-[450px] border-glass-border bg-white/90 backdrop-blur-2xl rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-primary">Edit Staff Profile</DialogTitle>
                        <DialogDescription className="font-bold text-foreground/40 uppercase tracking-widest text-[10px]">
                            Update administrative details for this workforce member.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">First Name</label>
                                <Input 
                                    value={editForm.first_name}
                                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                    className="h-12 bg-white/50 border-glass-border rounded-xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Last Name</label>
                                <Input 
                                    value={editForm.last_name}
                                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                    className="h-12 bg-white/50 border-glass-border rounded-xl font-bold"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Email Address</label>
                            <Input 
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="h-12 bg-white/50 border-glass-border rounded-xl font-bold"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Job Title</label>
                            <Input 
                                value={editForm.job_title}
                                onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                                className="h-12 bg-white/50 border-glass-border rounded-xl font-bold"
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setShowEditModal(false)}
                            className="font-bold text-primary/40 hover:text-primary transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveProfile}
                            disabled={updating}
                            className="bg-primary text-white font-black px-8 rounded-xl shadow-lg shadow-primary/20 h-12"
                        >
                            {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
