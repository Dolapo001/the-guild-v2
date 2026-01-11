"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    MapPin,
    Clock,
    ChevronLeft,
    Download,
    Share2,
    Truck,
    Phone,
    Bike,
    ExternalLink,
    AlertCircle,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mock Order Data
const ORDER_ITEMS = [
    {
        id: 1,
        name: "Organic Shea Butter",
        price: 4500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1556228720-1987594a8a63?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "African Black Soap",
        price: 3500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1602364956828-d89d6e529c6e?q=80&w=200&auto=format&fit=crop"
    }
];

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.id;
    const [loading, setLoading] = useState(true);

    // Mock Order State (Simulating real-time updates)
    const [order, setOrder] = useState({
        id: orderId,
        status: 'out-for-delivery', // 'pending', 'processing', 'out-for-delivery'
        deliveryFee: 1500, // or null if not set yet
        rider: {
            name: "Musa Aliyu",
            phone: "08012345678",
            company: "Gokada",
            plate: "LAG-992-QA",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
        },
        items: ORDER_ITEMS,
        subtotal: 8000,
        address: "10 Admiralty Way, Lekki Phase 1, Lagos"
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const timeline = [
        { id: 1, title: "Order Paid", description: "Funds secured in escrow.", status: "completed", date: "Oct 24, 10:30 AM" },
        { id: 2, title: "Order Processed", description: "Vendor has packed your items.", status: "completed", date: "Oct 24, 11:15 AM" },
        { id: 3, title: "Out for Delivery", description: "Rider is en route to your location.", status: order.status === 'out-for-delivery' ? "current" : "pending", date: order.status === 'out-for-delivery' ? "Just now" : "-" },
        { id: 4, title: "Delivered", description: "Package delivered to you.", status: "pending", date: "-" },
    ];

    const grandTotal = order.subtotal + (order.deliveryFee || 0);

    return (
        <div className="min-h-screen bg-background bg-mesh-gradient pb-24 pt-24">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild className="font-bold text-primary dark:text-white mb-4 pl-0 hover:bg-transparent hover:text-primary/80">
                        <Link href="/marketplace">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                {order.status === 'out-for-delivery' ? "Your Order is on the way!" : "Order Placed Successfully!"}
                                {order.status === 'out-for-delivery' ? <Truck className="h-8 w-8 text-primary animate-bounce" /> : <CheckCircle2 className="h-8 w-8 text-green-500" />}
                            </h1>
                            <p className="text-foreground/60 font-medium mt-2">Order ID: <span className="font-mono font-bold text-primary">{orderId}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="rounded-xl border-glass-border font-bold">
                                <Download className="mr-2 h-4 w-4" /> Receipt
                            </Button>
                            <Button variant="outline" className="rounded-xl border-glass-border font-bold">
                                <Share2 className="mr-2 h-4 w-4" /> Share
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Timeline & Status */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Rider / Logistics Card (Conditional) */}
                        <AnimatePresence>
                            {order.rider && order.status === 'out-for-delivery' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="relative overflow-hidden"
                                >
                                    <GlassCard className="p-8 border-primary/20 bg-primary/5 relative overflow-hidden group">
                                        {/* Background Pattern */}
                                        <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                            <Bike className="h-64 w-64" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Out for Delivery</h2>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                                    Powered by {order.rider.company}
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white dark:border-white/10 shadow-lg">
                                                        <img src={order.rider.avatar} alt={order.rider.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-extrabold text-gray-900 dark:text-white">{order.rider.name}</p>
                                                        <p className="text-sm font-bold text-foreground/50 flex items-center gap-1.5 mt-0.5">
                                                            <Bike className="h-3.5 w-3.5" />
                                                            {order.rider.plate}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className="rounded-xl border-glass-border font-bold h-12 px-6 hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <a href={`tel:${order.rider.phone}`}>
                                                            <Phone className="mr-2 h-4 w-4" /> Call Rider
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        className="rounded-xl bg-primary text-white font-bold h-12 px-6 shadow-lg shadow-primary/20 group/btn"
                                                        onClick={() => alert("Live tracking is connecting...")}
                                                    >
                                                        Track on Map <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Timeline Card */}
                        <GlassCard className="p-8 border-white/40 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Status</h2>
                            <div className="relative pl-4 border-l-2 border-glass-border space-y-8">
                                {timeline.map((step) => (
                                    <div key={step.id} className="relative pl-6">
                                        {/* Dot */}
                                        <div className={cn(
                                            "absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 transition-colors bg-background",
                                            step.status === "completed" ? "border-green-500 bg-green-500" :
                                                step.status === "current" ? "border-primary bg-primary animate-pulse" :
                                                    "border-gray-300 dark:border-white/20"
                                        )} />

                                        <div>
                                            <h3 className={cn(
                                                "font-bold text-base",
                                                step.status === "completed" ? "text-green-600 dark:text-green-400" :
                                                    step.status === "current" ? "text-primary dark:text-white" :
                                                        "text-foreground/40"
                                            )}>
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-foreground/60 font-medium mt-1">{step.description}</p>
                                            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-2">{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Delivery Info */}
                        <GlassCard className="p-8 border-white/40 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Delivery Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">Delivery Address</p>
                                        <p className="font-bold text-gray-900 dark:text-white">10 Admiralty Way</p>
                                        <p className="text-sm text-foreground/60">Lekki Phase 1, Lagos</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                        order.deliveryFee ? "bg-green-500/10" : "bg-amber-500/10"
                                    )}>
                                        {order.deliveryFee ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">Delivery Fee Status</p>
                                        {order.deliveryFee ? (
                                            <>
                                                <p className="font-bold text-green-600 dark:text-green-400">Fee Confirmed</p>
                                                <p className="text-[10px] font-medium text-foreground/60 mt-1">₦{order.deliveryFee.toLocaleString()} added to total.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-amber-600 dark:text-amber-400">Pending Vendor Review</p>
                                                <p className="text-[10px] font-medium text-foreground/60 mt-1">Vendor will set the fee shortly.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Receipt */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 border-white/40 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl sticky top-28">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Order Receipt</h3>

                            <div className="space-y-4 mb-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="h-8 w-8 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-foreground/60">
                                                x{item.quantity}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-foreground/80">₦{item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-glass-border mb-4" />

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground/60 font-medium">Subtotal</span>
                                    <span className="font-bold">₦{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground/60 font-medium">Delivery Fee</span>
                                    {order.deliveryFee ? (
                                        <span className="font-bold text-primary">₦{order.deliveryFee.toLocaleString()}</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider">To be calculated</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-lg pt-2 border-t border-dashed border-glass-border mt-2">
                                    <span className="font-extrabold text-gray-900 dark:text-white">Grand Total</span>
                                    <span className="font-extrabold text-primary">₦{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Payment Secured</p>
                                    <p className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">Funds held in escrow</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
