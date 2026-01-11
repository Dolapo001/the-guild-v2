"use client";

import { useState } from "react";
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
    Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { MOCK_STAFF } from "@/lib/mock-data";

export default function StaffPage() {
    const [staffList] = useState(MOCK_STAFF);
    const [selectedStaff, setSelectedStaff] = useState(MOCK_STAFF[0]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">Workforce Management</h1>
                    <p className="text-foreground/50 font-medium">Manage your team, schedules, and performance.</p>
                </motion.div>

                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Invite Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                        <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-extrabold text-primary">Invite Team Member</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-foreground/50">Send an invitation to join your business workspace.</p>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                                        <Input placeholder="staff@example.com" className="pl-11 h-12 rounded-xl bg-white/50 border-glass-border" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Assign Role</label>
                                    <select className="w-full h-12 rounded-xl border border-glass-border bg-white/50 px-4 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10">
                                        <option>Stylist</option>
                                        <option>Therapist</option>
                                        <option>Technician</option>
                                        <option>Receptionist</option>
                                    </select>
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20" onClick={() => setIsInviteModalOpen(false)}>
                                Send Invitation
                            </Button>
                        </GlassCard>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Staff List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Team Members</h3>
                        <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-2 py-1 rounded-lg">{staffList.length} Total</span>
                    </div>
                    <div className="space-y-4">
                        {staffList.map((staff) => (
                            <motion.div
                                key={staff.id}
                                whileHover={{ x: 4 }}
                                onClick={() => setSelectedStaff(staff)}
                                className={`cursor-pointer transition-all ${selectedStaff.id === staff.id ? 'scale-[1.02]' : ''}`}
                            >
                                <GlassCard className={`p-4 border-white/40 hover:bg-white/60 transition-all ${selectedStaff.id === staff.id ? 'bg-white/80 border-primary/20 shadow-xl shadow-primary/5' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                                            <AvatarImage src={staff.image} />
                                            <AvatarFallback>{staff.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-primary truncate">{staff.name}</p>
                                                {staff.isOwner && (
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] font-extrabold px-1.5 py-0">
                                                        OWNER
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs font-medium text-foreground/40">{staff.role}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-accent">
                                            <Star className="h-3 w-3 fill-accent" />
                                            <span className="text-xs font-bold">{staff.rating}</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Staff Detail & Performance */}
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8 border-white/40">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-xl">
                                    <AvatarImage src={selectedStaff.image} />
                                    <AvatarFallback>{selectedStaff.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-primary">{selectedStaff.name}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm font-bold text-foreground/40">{selectedStaff.role}</span>
                                        <span className="h-1 w-1 rounded-full bg-foreground/20" />
                                        <span className="text-xs font-extrabold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{selectedStaff.status}</span>
                                        {selectedStaff.isOwner && (
                                            <Badge className="bg-amber-500 text-white border-0 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-amber-500/20">
                                                Owner / Master Pro
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {selectedStaff.isOwner && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-xl border border-glass-border">
                                        <span className="text-xs font-bold text-primary/60">Available for Bookings</span>
                                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <Button variant="outline" className="h-11 rounded-xl border-glass-border font-bold text-primary">
                                        <CalendarIcon className="mr-2 h-4 w-4" /> Schedule
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-glass-border">
                                        <MoreVertical className="h-5 w-5 text-foreground/40" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Revenue Performance (₦)</h3>
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                                        <TrendingUp className="h-4 w-4" /> +12% vs last month
                                    </div>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={selectedStaff.revenue}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                                                tickFormatter={(value) => `₦${value / 1000}k`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(8px)'
                                                }}
                                            />
                                            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                                {selectedStaff.revenue.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={index === selectedStaff.revenue.length - 1 ? '#0F172A' : '#94A3B8'}
                                                        fillOpacity={index === selectedStaff.revenue.length - 1 ? 1 : 0.2}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Jobs Completed", value: "142", icon: Users },
                                    { label: "Avg. Rating", value: selectedStaff.rating, icon: Star },
                                    { label: "Retention Rate", value: "84%", icon: TrendingUp },
                                    { label: "Active Hours", value: "160h", icon: CalendarIcon },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-primary/[0.02] border border-primary/5">
                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-xl font-extrabold text-primary">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
