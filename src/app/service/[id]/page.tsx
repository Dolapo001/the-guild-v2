"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SERVICES_DATA, MOCK_STAFF, MOCK_REVIEWS } from "@/lib/mock-data";
import {
    Star,
    ShieldCheck,
    MapPin,
    Clock,
    ChevronLeft,
    Share2,
    Heart,
    CheckCircle2,
    Calendar as CalendarIcon,
    ArrowRight,
    Users,
    Briefcase,
    MessageSquare,
    Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/shared/booking-modal";
import { StaffProfileModal, StaffMember } from "@/components/shared/staff-profile-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ServiceDetailPage() {
    const params = useParams();
    const service = SERVICES_DATA.find(s => s.id === params.id);
    const [activeTab, setActiveTab] = useState("services");
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const [preSelectedStaffId, setPreSelectedStaffId] = useState<string | null>(null);

    // Staff Modal State
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

    if (!service) return null;

    const handleViewStaff = (staff: StaffMember) => {
        setSelectedStaff(staff);
        setIsStaffModalOpen(true);
    };

    const handleBookStaff = (staffId: string) => {
        setIsStaffModalOpen(false);
        setPreSelectedStaffId(staffId);
        setIsBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        // Reset pre-selected staff after modal closes to avoid persistence on next open
        setTimeout(() => setPreSelectedStaffId(null), 300);
    };

    return (
        <div className="min-h-screen bg-background bg-mesh-gradient pb-24">
            {/* Top Nav */}
            <div className="fixed top-0 w-full z-50 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-glass-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="font-bold text-primary dark:text-white">
                        <Link href="/search">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Search
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/20 dark:hover:bg-white/10">
                            <Share2 className="h-5 w-5 text-foreground/60" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/20 dark:hover:bg-white/10">
                            <Heart className="h-5 w-5 text-foreground/60" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 pt-24">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Content */}
                    <div className="flex-1 space-y-10">
                        {/* Hero Image */}
                        <div className="relative h-[400px] md:h-[500px] w-full rounded-[32px] overflow-hidden shadow-2xl">
                            <Image
                                src={service.image}
                                alt={service.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {service.isVerified && (
                                        <Badge className="bg-accent text-white border-0 px-3 py-1 font-bold flex items-center gap-1.5">
                                            <ShieldCheck className="h-4 w-4" /> CAC VERIFIED
                                        </Badge>
                                    )}
                                    <Badge className="bg-secondary text-primary border-0 px-3 py-1 font-bold flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-primary" /> {service.rating} ({service.reviewsCount} Reviews)
                                    </Badge>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{service.businessName}</h1>
                                <p className="text-white/80 font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {service.location}
                                </p>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-8 border-b border-glass-border overflow-x-auto no-scrollbar">
                            {[
                                { id: "services", name: "Services", icon: Briefcase },
                                { id: "reviews", name: "Reviews", icon: MessageSquare },
                                { id: "staff", name: "Staff", icon: Users },
                                { id: "portfolio", name: "Portfolio", icon: ImageIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary dark:text-white' : 'text-foreground/40 hover:text-primary/60 dark:hover:text-white/60'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.name}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary dark:bg-white rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {activeTab === "services" && (
                                <div className="space-y-6">
                                    <div className="prose prose-slate max-w-none">
                                        <h3 className="text-xl font-bold text-primary dark:text-white mb-4">About this business</h3>
                                        <p className="text-foreground/60 leading-relaxed font-medium">{service.description}</p>
                                    </div>
                                    <div className="grid gap-4">
                                        {service.services.map((s, i) => (
                                            <GlassCard
                                                key={i}
                                                className={`p-6 cursor-pointer transition-all border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 ${selectedService === s.name ? 'ring-2 ring-primary dark:ring-white bg-white/90 dark:bg-slate-800' : ''
                                                    }`}
                                                onClick={() => setSelectedService(s.name)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-primary dark:text-white mb-1">{s.name}</h4>
                                                        <p className="text-xs text-foreground/40 font-bold flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> 60 - 90 mins
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-extrabold text-primary dark:text-white">₦{s.price.toLocaleString()}</p>
                                                        {selectedService === s.name && (
                                                            <div className="text-accent flex items-center gap-1 text-[10px] font-bold uppercase mt-1">
                                                                <CheckCircle2 className="h-3 w-3" /> Selected
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div className="space-y-8">
                                    {/* Rating Header */}
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-glass-border">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <span className="text-5xl font-extrabold text-primary dark:text-white">{service.rating}</span>
                                                <div className="flex text-amber-500 mt-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(service.rating) ? "fill-amber-500" : "opacity-30"}`} />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] font-bold text-foreground/40 uppercase mt-1">{service.reviewsCount} Reviews</p>
                                            </div>
                                            <div className="h-16 w-px bg-glass-border hidden md:block" />
                                            <div className="space-y-1 hidden md:block">
                                                {[5, 4, 3, 2, 1].map((star) => (
                                                    <div key={star} className="flex items-center gap-2 text-xs font-bold text-foreground/60">
                                                        <span className="w-3">{star}</span>
                                                        <div className="w-32 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-500 rounded-full"
                                                                style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Filters */}
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="rounded-xl border-glass-border font-bold text-xs h-9 bg-primary text-white border-primary">
                                                All Reviews
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-xl border-glass-border font-bold text-xs h-9 text-foreground/60">
                                                With Photos
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-xl border-glass-border font-bold text-xs h-9 text-foreground/60">
                                                Most Recent
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Review Cards */}
                                    <div className="space-y-4">
                                        {MOCK_REVIEWS.map((review) => (
                                            <GlassCard key={review.id} className="p-6 border-white/40 dark:border-white/5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border border-white/20">
                                                            <AvatarImage src={review.avatar} />
                                                            <AvatarFallback>{review.user[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-primary dark:text-white">{review.user}</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex text-amber-500">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-500" : "opacity-30"}`} />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-foreground/40 uppercase">• {review.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-bold uppercase flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Verified Booking
                                                    </Badge>
                                                </div>

                                                <p className="text-foreground/80 font-medium leading-relaxed mb-4">{review.text}</p>

                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex gap-3 overflow-x-auto pb-2 mb-4 no-scrollbar">
                                                        {review.images.map((img, i) => (
                                                            <div key={i} className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                                                <Image src={img} alt="Review" fill className="object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] font-bold text-foreground/40 border-glass-border bg-black/5 dark:bg-white/5">
                                                        Booked: Deep Tissue Massage
                                                    </Badge>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "staff" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {MOCK_STAFF.map((staff) => (
                                        <GlassCard key={staff.id} className="p-6 flex items-center gap-6 border-white/40 dark:border-white/5 hover:border-primary/30 transition-all group">
                                            <div className="relative">
                                                <Avatar className="h-20 w-20 border-2 border-white dark:border-slate-800 shadow-lg">
                                                    <AvatarImage src={staff.image} />
                                                    <AvatarFallback>{staff.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-extrabold text-primary dark:text-white truncate">{staff.name}</h4>
                                                <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-2">{staff.role}</p>

                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                        <Star className="h-3.5 w-3.5 fill-amber-500" /> {staff.rating}
                                                    </div>
                                                    <div className="h-3 w-px bg-glass-border" />
                                                    <div className="text-xs font-bold text-foreground/40">
                                                        140 Jobs
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleViewStaff(staff)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-xl border-glass-border font-bold text-xs h-8 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                                >
                                                    View Profile
                                                </Button>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            )}

                            {activeTab === "portfolio" && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {service.portfolio.map((img, i) => (
                                        <div key={i} className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                                            <Image
                                                src={img}
                                                alt={`Portfolio ${i}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Booking Widget */}
                    <aside className="lg:w-[400px]">
                        <div className="sticky top-28">
                            <GlassCard className="p-8 border-white/60 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                                <h3 className="text-xl font-extrabold text-primary dark:text-white mb-8">Book an Appointment</h3>

                                <div className="space-y-8">
                                    <div>
                                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-4">Selected Service</p>
                                        {selectedService ? (
                                            <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 flex justify-between items-center">
                                                <span className="font-bold text-primary dark:text-white">{selectedService}</span>
                                                <span className="font-extrabold text-primary dark:text-white">₦{service.services.find(s => s.name === selectedService)?.price.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl border-2 border-dashed border-glass-border text-center">
                                                <p className="text-sm font-bold text-foreground/30 italic">Please select a service from the list</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-4">Date</p>
                                            <Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary dark:text-white justify-start hover:bg-primary/5 dark:hover:bg-white/5">
                                                <CalendarIcon className="mr-2 h-4 w-4 opacity-40" /> Select Date
                                            </Button>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-4">Time</p>
                                            <Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary dark:text-white justify-start hover:bg-primary/5 dark:hover:bg-white/5">
                                                <Clock className="mr-2 h-4 w-4 opacity-40" /> Select Time
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-glass-border">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="font-bold text-foreground/60">Total Amount</span>
                                            <span className="text-2xl font-extrabold text-primary dark:text-white">
                                                ₦{selectedService ? service.services.find(s => s.name === selectedService)?.price.toLocaleString() : '0'}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => setIsBookingModalOpen(true)}
                                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-lg shadow-xl shadow-primary/20"
                                        >
                                            Proceed to Book <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                        <p className="text-center text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                                            Secure Escrow Payment
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>

                            <div className="mt-6 p-6 rounded-2xl bg-accent/5 border border-accent/10">
                                <h4 className="font-bold text-accent text-sm mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" /> Why book on The Guild?
                                </h4>
                                <ul className="space-y-2">
                                    {["Verified CAC Registration", "Escrow Payment Protection", "Verified Customer Reviews"].map((item, i) => (
                                        <li key={i} className="text-xs font-bold text-foreground/50 flex items-center gap-2">
                                            <div className="h-1 w-1 bg-accent rounded-full" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Mobile Bottom Sheet (Simplified) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-glass-border z-40">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Total</p>
                        <p className="text-xl font-extrabold text-primary dark:text-white">
                            ₦{selectedService ? service.services.find(s => s.name === selectedService)?.price.toLocaleString() : '0'}
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="flex-1 h-12 rounded-xl bg-primary text-white font-bold"
                    >
                        Book Now
                    </Button>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                service={service}
                initialStaffId={preSelectedStaffId}
            />

            <StaffProfileModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                staff={selectedStaff}
                onBookNow={handleBookStaff}
            />
        </div>
    );
}
