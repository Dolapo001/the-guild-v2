"use client";

import { useState } from "react";
import { MOCK_ADMIN_QUEUE } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    Users,
    TrendingUp,
    Eye,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    MoreVertical,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
    const [queue, setQueue] = useState(MOCK_ADMIN_QUEUE);
    const [selectedBusiness, setSelectedBusiness] = useState<typeof MOCK_ADMIN_QUEUE[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAction = (id: string, action: "approve" | "reject") => {
        setQueue(prev => prev.filter(item => item.id !== id));
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-extrabold tracking-tight text-primary">Admin Command Center</h1>
                <p className="text-foreground/50 font-medium">Monitoring trust and safety across The Guild.</p>
            </motion.div>

            {/* Platform Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { label: "Total Users", value: "12,482", icon: Users, color: "text-primary" },
                    { label: "Verified SMEs", value: "856", icon: ShieldCheck, color: "text-accent" },
                    { label: "Revenue Volume", value: "₦4.2M", icon: TrendingUp, color: "text-secondary" },
                    { label: "Pending Verifications", value: queue.length.toString(), icon: FileText, color: "text-amber-500" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 border-white/40">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-extrabold text-primary">{stat.value}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Verification Queue */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                    <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Verification Queue</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                            <input
                                placeholder="Search businesses..."
                                className="pl-10 pr-4 py-2 rounded-xl bg-white/40 border border-glass-border text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 w-64"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl border-glass-border font-bold text-primary">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>
                </div>

                <GlassCard className="overflow-hidden border-white/40">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary/5 border-b border-glass-border">
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Business Name</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">CAC Number</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Date Submitted</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass-border">
                                {queue.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                    {item.businessName[0]}
                                                </div>
                                                <span className="font-bold text-primary">{item.businessName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-foreground/60">{item.cacNumber}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-foreground/60">{item.dateSubmitted}</td>
                                        <td className="px-6 py-4">
                                            <Badge className="bg-amber-500/10 text-amber-600 border-0 font-bold text-[10px] uppercase tracking-widest">
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg font-bold text-primary hover:bg-primary/5"
                                                onClick={() => {
                                                    setSelectedBusiness(item);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> View Docs
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {queue.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <CheckCircle2 className="h-12 w-12 text-accent/20 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-foreground/30">Queue is empty. All businesses are verified!</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </section>

            {/* Verification Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <GlassCard className="border-white/40 shadow-2xl overflow-hidden flex flex-col">
                        <DialogHeader className="p-6 border-b border-glass-border bg-white/40">
                            <DialogTitle className="text-xl font-extrabold text-primary">Review Verification</DialogTitle>
                        </DialogHeader>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Business Name</p>
                                    <p className="font-bold text-primary">{selectedBusiness?.businessName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">CAC Number</p>
                                    <p className="font-bold text-primary">{selectedBusiness?.cacNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">CAC Certificate</p>
                                <div className="aspect-[4/3] rounded-2xl bg-primary/5 border-2 border-dashed border-glass-border flex items-center justify-center relative overflow-hidden group">
                                    <FileText className="h-12 w-12 text-primary/10 group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="secondary" className="font-bold">
                                            <Eye className="mr-2 h-4 w-4" /> Preview Full Document
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-accent text-white font-bold shadow-xl shadow-accent/20"
                                    onClick={() => handleAction(selectedBusiness?.id!, "approve")}
                                >
                                    <CheckCircle2 className="mr-2 h-5 w-5" /> Approve Business
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl border-red-500/20 text-red-500 font-bold hover:bg-red-500/5"
                                    onClick={() => handleAction(selectedBusiness?.id!, "reject")}
                                >
                                    <XCircle className="mr-2 h-5 w-5" /> Reject
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </DialogContent>
            </Dialog>
        </div>
    );
}
