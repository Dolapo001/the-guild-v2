"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_CUSTOMER_DATA, SERVICES_DATA } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Calendar,
    Clock,
    Navigation,
    ArrowRight,
    Star,
    Sparkles,
    User,
    Info,
    Package,
    ShoppingBag,
    AlertTriangle,
    Check,
    X
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/shared/booking-modal";
import { ServiceCard } from "@/components/ui/service-card";
import { ProductCard } from "@/components/ui/product-card";

// Mock Recent Orders
const RECENT_ORDERS = [
    {
        id: "ORD-882",
        name: "Organic Face Oil",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop",
        status: "Out for Delivery"
    },
    {
        id: "ORD-754",
        name: "Shea Butter Tub",
        image: "https://images.unsplash.com/photo-1556228720-1987594a8a63?q=80&w=200&auto=format&fit=crop",
        status: "Delivered"
    }
];

interface ActiveBooking {
    service: string;
    business: string;
    time: string;
    location: string;
    status: string;
    staffName: string;
    replacementProposal?: {
        name: string;
        rating: string;
        image: string;
        isVerified: boolean;
    };
}

export default function CustomerDashboard() {
    const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(MOCK_CUSTOMER_DATA.activeBooking);
    const data = MOCK_CUSTOMER_DATA;

    // Reschedule Modal State
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [recFilter, setRecFilter] = useState<'all' | 'service' | 'product'>('all');

    // Mock Service for Reschedule (Using first service as mock)
    const activeService = SERVICES_DATA[0];

    const handleGetDirections = () => {
        const destination = encodeURIComponent(data.activeBooking.location);
        const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${destination}`;
        window.open(url, '_blank');
    };

    const handleReschedule = () => {
        setIsRescheduleModalOpen(true);
    };

    const handleAcceptReplacement = () => {
        if (activeBooking?.replacementProposal) {
            setActiveBooking({
                ...activeBooking,
                staffName: activeBooking.replacementProposal.name,
                status: "accepted",
                replacementProposal: undefined
            });
        }
    };

    const handleCancelBooking = () => {
        if (confirm("Are you sure you want to cancel this booking? You will receive a full refund to your wallet.")) {
            setActiveBooking(null as any);
        }
    };

    const getGoogleCalendarUrl = (booking: typeof data.activeBooking) => {
        let datePart = booking.time.split(',')[0].trim();
        const timePart = booking.time.split(',')[1].trim();

        const now = new Date();
        const dateStr = datePart.toLowerCase() === 'today'
            ? `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
            : datePart;

        const start = new Date(`${dateStr} ${timePart}`);
        const validStart = isNaN(start.getTime()) ? new Date() : start;
        const end = new Date(validStart.getTime() + 60 * 60 * 1000); // 1 hour duration

        const formatISO = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `${booking.service} - ${booking.business}`,
            dates: `${formatISO(validStart)}/${formatISO(end)}`,
            details: `Booking Reference: #GLO-8829. Staff: ${booking.staffName || 'TBD'}. Booking with The Guild`,
            location: booking.location
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const recommendations = [
        {
            id: 's1',
            type: 'service',
            name: "Premium Nail Studio",
            businessName: "Luxe Nails",
            category: "beauty",
            image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400&auto=format&fit=crop",
            rating: 4.8,
            price: 8000,
            tag: "Maestro Match: 98%",
            location: "Lekki, Lagos",
            reviewsCount: 45,
            isVerified: true,
            isTopRated: true,
            description: "Premium nail services",
            portfolio: [],
            services: []
        },
        {
            id: 's2',
            type: 'service',
            name: "Mobile Makeup Artist",
            businessName: "Glow Up",
            category: "beauty",
            image: "https://images.unsplash.com/photo-1487412947132-26c5c1b151d5?q=80&w=400&auto=format&fit=crop",
            rating: 4.9,
            price: 15000,
            tag: "Maestro Match: 95%",
            location: "On-site",
            reviewsCount: 120,
            isVerified: true,
            isTopRated: true,
            description: "Professional makeup services",
            portfolio: [],
            services: []
        },
        {
            id: 'p1',
            type: 'product',
            name: "Organic Shea Butter",
            category: "Skincare",
            image: "https://images.unsplash.com/photo-1556228720-1987594a8a63?q=80&w=400&auto=format&fit=crop",
            rating: 4.7,
            price: 4500,
            tag: "🛍️ Recommended for Skin"
        },
        {
            id: 'p2',
            type: 'product',
            name: "Lavender Scented Candle",
            category: "Home",
            image: "https://images.unsplash.com/photo-1602364956828-d89d6e529c6e?q=80&w=400&auto=format&fit=crop",
            rating: 4.9,
            price: 7000,
            tag: "🛍️ Relax at home"
        }
    ];

    const filteredRecs = recommendations
        .filter(item => recFilter === 'all' || item.type === recFilter)
        .slice(0, 4);

    return (
        <div className="space-y-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-extrabold tracking-tight text-primary">Hello, {user?.name || "Customer"}.</h1>
                <p className="text-foreground/50 font-medium text-lg">Ready to glow today?</p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-12">
                    {/* Active Booking */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Active Booking</h3>
                        {activeBooking ? (
                            <GlassCard className={cn(
                                "p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden transition-all duration-500",
                                activeBooking.status === "DECLINED_WITH_OPTION" && "border-amber-500/50 bg-amber-500/5 ring-2 ring-amber-500/20"
                            )}>
                                {activeBooking.status === "DECLINED_WITH_OPTION" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
                                    >
                                        <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                                            ⚠️ Update on your appointment: {activeBooking.staffName} is unavailable, but Maestro found a match!
                                        </p>
                                    </motion.div>
                                )}
                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-2xl font-extrabold text-primary">{activeBooking.service}</h4>
                                            <p className="text-sm font-bold text-foreground/60">{activeBooking.business}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary/70">
                                                <Calendar className="h-4 w-4" /> {activeBooking.time.split(',')[0]}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary/70">
                                                <Clock className="h-4 w-4" /> {activeBooking.time.split(',')[1]}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary/70">
                                                <MapPin className="h-4 w-4" /> {activeBooking.location}
                                            </div>
                                        </div>

                                        {activeBooking.status === "DECLINED_WITH_OPTION" ? (
                                            <div className="space-y-6">
                                                <div className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-xl shadow-xl">
                                                    <p className="text-sm font-bold text-foreground/80 mb-4">
                                                        Don't worry! Maestro checked the schedule and found <span className="text-primary font-extrabold">{activeBooking.replacementProposal.name}</span> is available at this time.
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                                                            <Image src={activeBooking.replacementProposal.image} alt={activeBooking.replacementProposal.name} fill className="object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-foreground text-lg">{activeBooking.replacementProposal.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                                    <Star className="h-3 w-3 fill-amber-500" /> {activeBooking.replacementProposal.rating}
                                                                </span>
                                                                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                                    Verified Pro
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <Button
                                                        onClick={handleAcceptReplacement}
                                                        className="bg-primary text-white rounded-xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20 hover:scale-105 transition-all group"
                                                    >
                                                        <Check className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                                        Accept {activeBooking.replacementProposal.name.split(' ')[0]}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setIsRescheduleModalOpen(true)}
                                                        variant="outline"
                                                        className="border-glass-border bg-white/50 dark:bg-white/5 text-primary rounded-xl h-12 px-6 font-bold hover:bg-white/80 transition-all"
                                                    >
                                                        Choose Someone Else
                                                    </Button>
                                                    <Button
                                                        onClick={handleCancelBooking}
                                                        variant="ghost"
                                                        className="text-foreground/40 hover:text-red-500 hover:bg-red-500/5 font-bold h-12 px-4 rounded-xl transition-all"
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Cancel Booking
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-white/5 dark:bg-black/20 border border-white/10 backdrop-blur-md rounded-lg p-3 flex items-center gap-3">
                                                    {activeBooking.staffName ? (
                                                        <>
                                                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                                <User className="h-4 w-4 text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">Confirmed with </span>
                                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{activeBooking.staffName}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                                                <Info className="h-4 w-4 text-amber-400" />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Waiting for <span className="text-gray-900 dark:text-white font-semibold">{activeBooking.business}</span> to confirm.</p>
                                                            <div className="ml-auto px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-600 flex items-center gap-1">
                                                                <Sparkles className="h-3 w-3" /> Verified by <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex gap-3 pt-2">
                                                    <Button
                                                        onClick={handleGetDirections}
                                                        className="bg-primary text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20"
                                                    >
                                                        <Navigation className="mr-2 h-4 w-4" /> Get Directions
                                                    </Button>
                                                    <Button
                                                        onClick={handleReschedule}
                                                        variant="outline"
                                                        className="border-glass-border text-primary rounded-xl h-11 px-6 font-bold"
                                                    >
                                                        Reschedule
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-colors",
                                            activeBooking.status === "DECLINED_WITH_OPTION"
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                : activeBooking.status === "accepted"
                                                    ? "bg-accent/10 text-accent border-accent/20"
                                                    : "bg-secondary/10 text-primary border-secondary/20"
                                        )}>
                                            {activeBooking.status.replace(/_/g, ' ')}
                                        </div>
                                        <a
                                            href={getGoogleCalendarUrl(activeBooking)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Add to Google Calendar"
                                            className="h-20 w-20 bg-white/5 dark:bg-black/20 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 hover:scale-105 transition-all group/cal"
                                        >
                                            <Calendar className="h-10 w-10 text-white/80 group-hover/cal:text-white transition-colors" />
                                        </a>
                                    </div>
                                </div>
                                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-0" />
                            </GlassCard>
                        ) : (
                            <GlassCard className="p-12 text-center border-dashed border-foreground/10 bg-foreground/5">
                                <p className="text-foreground/40 font-bold">No active bookings. Ready to glow?</p>
                                <Button className="mt-4 bg-primary text-white rounded-xl font-bold" asChild>
                                    <Link href="/marketplace">Explore Services</Link>
                                </Button>
                            </GlassCard>
                        )}
                    </section>

                    {/* AI Recommendations - Smart Mix */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-extrabold text-primary flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-secondary" /> ✨ Hand-picked by <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent ml-1">Maestro</span>
                            </h3>
                            <div className="flex p-1 bg-white/40 dark:bg-white/5 rounded-lg border border-glass-border backdrop-blur-sm">
                                <button
                                    onClick={() => setRecFilter('all')}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                                        recFilter === 'all' ? "bg-primary text-white shadow-sm" : "text-foreground/40 hover:text-primary"
                                    )}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setRecFilter('service')}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                                        recFilter === 'service' ? "bg-primary text-white shadow-sm" : "text-foreground/40 hover:text-primary"
                                    )}
                                >
                                    Services
                                </button>
                                <button
                                    onClick={() => setRecFilter('product')}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                                        recFilter === 'product' ? "bg-primary text-white shadow-sm" : "text-foreground/40 hover:text-primary"
                                    )}
                                >
                                    Products
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                            {filteredRecs.length > 0 ? (
                                filteredRecs.map((item) => (
                                    item.type === 'service' ? (
                                        <ServiceCard key={item.id} service={item as any} tag={item.tag} isMaestroMatch={item.tag?.includes('Maestro Match')} />
                                    ) : (
                                        <ProductCard key={item.id} product={item as any} isMaestroMatch={item.tag?.includes('Maestro Match')} />
                                    )
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <p className="text-foreground/40 font-medium italic">Maestro is learning your style...</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Unified Recent History */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Recent Activities</h3>
                            <Button variant="ghost" className="h-auto p-0 text-[10px] font-extrabold text-primary uppercase tracking-widest hover:bg-transparent" asChild>
                                <Link href="/customer/activities">
                                    View All <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {/* Mocking mixed history with IDs */}
                            {([
                                ...data.recentHistory.map(h => ({ ...h, type: 'service' as const, businessId: 'glow-spa' })),
                                { id: 99, service: "Organic Face Oil", business: "Nature's Best", date: "Yesterday", price: "₦4,500", type: 'product' as const, businessId: null }
                            ] as const).map((item) => (
                                <GlassCard key={item.id} className="p-5 border-white/40 flex items-center justify-between hover:bg-white/60 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {item.type === 'service' ? (
                                                <Calendar className="h-6 w-6 text-primary/40" />
                                            ) : (
                                                <Package className="h-6 w-6 text-primary/40" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">{item.service}</p>
                                            <p className="text-xs font-medium text-foreground/40">{item.business} • {item.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="font-extrabold text-primary">{item.price}</p>
                                        {item.type === 'service' ? (
                                            <Link
                                                href={`/service/${item.businessId}`}
                                                className="text-[10px] font-extrabold text-accent uppercase tracking-widest mt-1 hover:underline hover:text-accent/80 transition-colors"
                                            >
                                                Book Again
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/marketplace"
                                                className="text-[10px] font-extrabold text-accent uppercase tracking-widest mt-1 hover:underline hover:text-accent/80 transition-colors"
                                            >
                                                Buy Again
                                            </Link>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Recent Orders Widget */}
                    <GlassCard className="p-6 border-white/40">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-extrabold text-primary flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-primary" /> Recent Orders
                            </h3>
                            <Link href="/marketplace/orders" className="text-[10px] font-bold text-primary/60 hover:text-primary">
                                See All
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {RECENT_ORDERS.map((order) => (
                                <Link href={`/marketplace/order/${order.id}`} key={order.id} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-glass-border">
                                        <Image src={order.image} alt={order.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-primary truncate group-hover:text-accent transition-colors">{order.name}</p>
                                        <p className="text-[10px] font-mono font-bold text-foreground/40">#{order.id}</p>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary whitespace-nowrap">
                                        {order.status}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Reschedule Modal */}
            <BookingModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                service={activeService}
                mode="reschedule"
                initialData={{
                    selectedServices: [activeBooking?.service || ""],
                    staffId: 'AUTO',
                }}
            />
        </div>
    );
}
