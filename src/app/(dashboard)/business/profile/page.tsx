"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MapPin,
    Clock,
    Phone,
    Mail,
    Globe,
    Edit2,
    Save,
    ShieldCheck,
    Camera,
    CheckCircle2,
    Building2,
    Rocket,
    Users,
    User,
    Check,
    AlertTriangle,
    ArrowRight,
    TrendingUp,
    Wallet,
    ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_STAFF } from "@/lib/mock-data";

export default function BusinessProfilePage() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
    const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSolo = user?.isSoloOperator ?? true;

    const handleScaleUp = () => {
        updateUser({ isSoloOperator: false });
        setIsScaleModalOpen(false);
        // In a real app, we'd use a toast library
        alert("Dashboard updated! Welcome to Team Mode.");
    };

    const handleRevertToSolo = () => {
        // Mock check for active staff
        const activeStaff = MOCK_STAFF.filter(s => s.id !== 's0'); // s0 is the owner

        if (activeStaff.length > 0) {
            setError("You cannot switch to Solo Mode while you have active staff profiles. Please archive them first.");
            return;
        }

        updateUser({ isSoloOperator: true });
        setIsRevertModalOpen(false);
        alert("Dashboard updated! Reverted to Solo Mode.");
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">Business Profile</h1>
                    <p className="text-foreground/50 font-medium">Manage your public presence, verification, and business details.</p>
                </motion.div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`${isEditing ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'} text-white rounded-xl h-11 px-6 font-bold shadow-lg transition-all`}
                >
                    {isEditing ? (
                        <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </>
                    ) : (
                        <>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <motion.div
                    className="lg:col-span-2 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-10 border-white/40 shadow-glass">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                                    <AvatarImage src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&auto=format&fit=crop" />
                                    <AvatarFallback className="bg-primary text-white text-2xl font-bold">GS</AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    {isEditing ? (
                                        <Input defaultValue="Glow Spa Lekki" className="text-3xl font-extrabold h-auto py-2 px-4 bg-white/50 border-glass-border rounded-xl text-primary" />
                                    ) : (
                                        <h2 className="text-3xl font-extrabold text-primary">Glow Spa Lekki</h2>
                                    )}
                                    <Badge className="bg-accent/10 text-accent border-0 px-3 py-1 font-bold flex items-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4" /> VERIFIED
                                    </Badge>
                                </div>
                                {isEditing ? (
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-2xl border border-glass-border bg-white/50 px-4 py-3 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 backdrop-blur-sm"
                                        defaultValue="Premium spa services in the heart of Lekki, Lagos. We offer massages, facials, and body treatments using organic products tailored for the Nigerian skin."
                                    />
                                ) : (
                                    <p className="text-foreground/60 font-medium leading-relaxed max-w-2xl">
                                        Premium spa services in the heart of Lekki, Lagos. We offer massages, facials, and body treatments using organic products tailored for the Nigerian skin.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-10 md:grid-cols-2 mt-12 pt-10 border-t border-primary/5">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location
                                </h3>
                                {isEditing ? (
                                    <Input defaultValue="12 Adeola Odeku St, Victoria Island, Lagos" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                ) : (
                                    <p className="text-sm font-bold text-primary">12 Adeola Odeku St, Victoria Island, Lagos</p>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-primary" /> Opening Hours
                                </h3>
                                {isEditing ? (
                                    <Input defaultValue="Mon - Sat: 9:00 AM - 8:00 PM" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                ) : (
                                    <p className="text-sm font-bold text-primary">Mon - Sat: 9:00 AM - 8:00 PM</p>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-primary" /> Contact
                                </h3>
                                {isEditing ? (
                                    <Input defaultValue="+234 801 234 5678" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                ) : (
                                    <p className="text-sm font-bold text-primary">+234 801 234 5678</p>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5 text-primary" /> Website
                                </h3>
                                {isEditing ? (
                                    <Input defaultValue="www.glowspa.ng" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                ) : (
                                    <p className="text-sm font-bold text-primary">www.glowspa.ng</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* New Section: Operations & Scaling */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-10 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <h3 className="text-2xl font-extrabold text-primary">Operations & Scaling</h3>
                                        <Badge className={cn(
                                            "px-3 py-1 font-bold rounded-full",
                                            isSolo ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        )}>
                                            {isSolo ? "SOLO" : "TEAM"}
                                        </Badge>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/40 border border-glass-border">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                                isSolo ? "bg-slate-500/10 text-slate-500" : "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {isSolo ? <User className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary text-lg">
                                                    Current Mode: {isSolo ? "Solo Professional" : "Team / Agency"}
                                                </h4>
                                                <p className="text-sm text-foreground/50 font-medium leading-relaxed">
                                                    {isSolo
                                                        ? "Optimized for personal bookings. Staff management features are hidden to keep your workspace clean."
                                                        : "Full features enabled: Staff management, payroll, and approval workflows are active."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {isSolo ? (
                                        <Button
                                            onClick={() => setIsScaleModalOpen(true)}
                                            className="h-14 px-8 bg-primary text-white font-extrabold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            <Rocket className="h-5 w-5" /> Upgrade to Team Mode
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setIsRevertModalOpen(true)}
                                            variant="outline"
                                            className="h-14 px-8 border-glass-border text-primary font-bold rounded-2xl hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-all"
                                        >
                                            Revert to Solo Mode
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2">
                            <Building2 className="h-5 w-5 opacity-40" /> Verification
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "CAC Registration", status: "Verified" },
                                { label: "Identity Check", status: "Verified" },
                                { label: "Address Check", status: "Verified" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground/50">{item.label}</span>
                                    <div className="flex items-center gap-1.5 text-accent text-xs font-extrabold uppercase tracking-wider">
                                        <CheckCircle2 className="h-4 w-4" /> {item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-10 h-12 rounded-xl border-glass-border font-bold text-primary hover:bg-primary/5" asChild>
                            <Link href="/business-profile/verification">View Documents</Link>
                        </Button>
                    </GlassCard>

                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-xl font-extrabold text-primary mb-6">Profile Completion</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-extrabold text-primary">85%</span>
                                <span className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Completed</span>
                            </div>
                            <div className="h-2.5 w-full bg-primary/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                            <p className="text-xs font-bold text-foreground/40 pt-2 leading-relaxed">
                                Add more portfolio photos to reach 100% and get a "Top Rated" badge.
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Scale Up Modal */}
            <Dialog open={isScaleModalOpen} onOpenChange={setIsScaleModalOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <GlassCard className="border-white/40 shadow-2xl p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-extrabold text-primary text-center">
                                Ready to grow, Glow Spa?
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            <p className="text-center text-foreground/60 font-medium">
                                Switching to Team Mode unlocks powerful tools to help you manage and scale your workforce.
                            </p>

                            <div className="grid gap-4">
                                {[
                                    { title: "Unlimited Staff", desc: "Create profiles for your employees.", icon: Users },
                                    { title: "Delegation", desc: "Assign bookings to specific staff members.", icon: Check },
                                    { title: "Payroll", desc: "Track individual earnings and commissions.", icon: Wallet },
                                    { title: "Approvals", desc: "Review jobs before accepting them.", icon: ShieldAlert },
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <benefit.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary">{benefit.title}</h4>
                                            <p className="text-xs text-foreground/50 font-medium">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleScaleUp}
                                className="h-14 w-full bg-primary text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20"
                            >
                                Switch to Team Dashboard
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsScaleModalOpen(false)}
                                className="h-12 w-full font-bold text-foreground/40"
                            >
                                Not now, maybe later
                            </Button>
                        </div>
                    </GlassCard>
                </DialogContent>
            </Dialog>

            {/* Revert Modal */}
            <Dialog open={isRevertModalOpen} onOpenChange={(open) => {
                setIsRevertModalOpen(open);
                if (!open) setError(null);
            }}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-primary text-center">
                                Revert to Solo Mode?
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {error ? (
                                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4">
                                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                                    <p className="text-sm font-bold text-red-600 leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-center text-foreground/60 font-medium leading-relaxed">
                                    This will hide all team management features. You can switch back at any time.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {!error && (
                                <Button
                                    onClick={handleRevertToSolo}
                                    className="h-14 w-full bg-primary text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20"
                                >
                                    Confirm Revert
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                onClick={() => setIsRevertModalOpen(false)}
                                className="h-12 w-full font-bold text-foreground/40"
                            >
                                {error ? "Close" : "Cancel"}
                            </Button>
                        </div>
                    </GlassCard>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
