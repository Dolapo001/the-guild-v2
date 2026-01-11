"use client";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Star,
    CheckCircle2,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export interface StaffMember {
    id: string;
    name: string;
    role: string;
    rating: number;
    image: string;
    status: string;
}

interface StaffProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffMember | null;
    onBookNow?: (staffId: string) => void;
}

export function StaffProfileModal({ isOpen, onClose, staff, onBookNow }: StaffProfileModalProps) {
    const [activeTab, setActiveTab] = useState("portfolio");

    if (!staff) return null;

    const handleBookNow = () => {
        if (onBookNow) {
            onBookNow(staff.id);
        }
    };

    // Mock data for specific staff member
    const staffPortfolio = [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400&auto=format&fit=crop"
    ];

    const staffReviews = [
        {
            id: 1,
            user: "Alice M.",
            rating: 5,
            text: "Sarah is amazing! She really understood what I wanted and delivered perfectly.",
            date: "2 days ago"
        },
        {
            id: 2,
            user: "John D.",
            rating: 4.8,
            text: "Great professional, very attentive to details.",
            date: "1 week ago"
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                <GlassCard className="border-white/40 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl">

                    {/* Header / Cover */}
                    <div className="relative h-32 bg-gradient-to-r from-primary to-primary/60">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Profile Info */}
                    <div className="px-8 pb-6 -mt-12 flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-xl">
                                <AvatarImage src={staff.image} />
                                <AvatarFallback>{staff.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 bg-green-500 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                        </div>

                        <div className="pt-14 md:pt-12 flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                        {staff.name}
                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary dark:text-white">
                                            {staff.role}
                                        </Badge>
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm font-medium text-foreground/60">
                                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                                            <Star className="h-4 w-4 fill-amber-500" /> {staff.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="h-4 w-4" /> 140+ Jobs Completed
                                        </span>
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <ShieldCheck className="h-4 w-4" /> Verified Pro
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleBookNow}
                                    className="hidden md:flex bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                                >
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-8 border-b border-glass-border flex gap-8">
                        <button
                            onClick={() => setActiveTab("portfolio")}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "portfolio" ? "text-primary dark:text-white" : "text-foreground/40 hover:text-primary/60"
                                }`}
                        >
                            Portfolio
                            {activeTab === "portfolio" && (
                                <motion.div layoutId="staffTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "reviews" ? "text-primary dark:text-white" : "text-foreground/40 hover:text-primary/60"
                                }`}
                        >
                            Reviews (124)
                            {activeTab === "reviews" && (
                                <motion.div layoutId="staffTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 min-h-[300px]">
                        {activeTab === "portfolio" && (
                            <div className="grid grid-cols-2 gap-4">
                                {staffPortfolio.map((img, i) => (
                                    <div key={i} className="relative h-48 rounded-xl overflow-hidden group cursor-pointer">
                                        <Image
                                            src={img}
                                            alt="Portfolio"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-4">
                                {staffReviews.map((review) => (
                                    <div key={review.id} className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-glass-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                    {review.user[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{review.user}</p>
                                                    <div className="flex text-amber-500">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(review.rating) ? "fill-amber-500" : "opacity-30"}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-foreground/40 uppercase">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 font-medium leading-relaxed">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Footer Action */}
                    <div className="p-4 border-t border-glass-border md:hidden bg-white/40 dark:bg-white/5 backdrop-blur-xl">
                        <Button
                            onClick={handleBookNow}
                            className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            Book {staff.name}
                        </Button>
                    </div>

                </GlassCard>
            </DialogContent>
        </Dialog>
    );
}
