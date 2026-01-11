"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShoppingBag,
    Search,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    ArrowRight,
    ChevronRight,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OrderStatus = 'Pending' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

interface Order {
    id: string;
    date: string;
    total: number;
    status: OrderStatus;
    items: {
        name: string;
        image: string;
    }[];
}

const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-882",
        date: "Jan 10, 2026",
        total: 12500,
        status: "Out for Delivery",
        items: [
            {
                name: "Organic Face Oil",
                image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop"
            }
        ]
    },
    {
        id: "ORD-754",
        date: "Jan 08, 2026",
        total: 4500,
        status: "Delivered",
        items: [
            {
                name: "Shea Butter Tub",
                image: "https://images.unsplash.com/photo-1556228720-1987594a8a63?q=80&w=200&auto=format&fit=crop"
            }
        ]
    },
    {
        id: "ORD-612",
        date: "Jan 05, 2026",
        total: 18000,
        status: "Pending",
        items: [
            {
                name: "Lavender Scented Candle",
                image: "https://images.unsplash.com/photo-1602364956828-d89d6e529c6e?q=80&w=200&auto=format&fit=crop"
            },
            {
                name: "African Black Soap",
                image: "https://images.unsplash.com/photo-1602364956828-d89d6e529c6e?q=80&w=200&auto=format&fit=crop"
            }
        ]
    },
    {
        id: "ORD-501",
        date: "Dec 28, 2025",
        total: 6000,
        status: "Cancelled",
        items: [
            {
                name: "Beard Growth Oil",
                image: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=200&auto=format&fit=crop"
            }
        ]
    }
];

const statusConfig: Record<OrderStatus, { color: string; icon: any; bg: string; badge: string }> = {
    'Pending': { color: 'text-amber-500', icon: Clock, bg: 'bg-amber-500/10 border-amber-500/20', badge: 'bg-amber-500' },
    'Out for Delivery': { color: 'text-blue-500', icon: Truck, bg: 'bg-blue-500/10 border-blue-500/20', badge: 'bg-blue-500' },
    'Delivered': { color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10 border-green-500/20', badge: 'bg-green-500' },
    'Cancelled': { color: 'text-red-500', icon: XCircle, bg: 'bg-red-500/10 border-red-500/20', badge: 'bg-red-500' }
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<'All' | OrderStatus>('All');
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = MOCK_ORDERS.filter(order => {
        const matchesTab = activeTab === 'All' || order.status === activeTab;
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const tabs: ('All' | OrderStatus)[] = ['All', 'Pending', 'Out for Delivery', 'Delivered', 'Cancelled'];

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        My Orders <ShoppingBag className="h-8 w-8 text-primary" />
                    </h1>
                    <p className="text-foreground/50 font-medium text-lg">Track and manage your purchases.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <Input
                        placeholder="Search by Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-white/40 dark:bg-white/5 border-glass-border"
                    />
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 -mx-1 px-1 gap-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                : "bg-white/40 dark:bg-white/5 text-foreground/60 border-glass-border hover:border-primary/30"
                        )}
                    >
                        {tab}
                        {tab !== 'All' && (
                            <span className={cn(
                                "h-2 w-2 rounded-full",
                                statusConfig[tab as OrderStatus].badge
                            )} />
                        )}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, i) => {
                            const config = statusConfig[order.status];
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <GlassCard className="p-5 md:p-6 border-white/40 hover:border-primary/30 transition-all group">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            {/* Thumbnails */}
                                            <div className="flex -space-x-4">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="h-16 w-16 rounded-xl border-2 border-white dark:border-slate-900 overflow-hidden relative shadow-sm"
                                                    >
                                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="h-16 w-16 rounded-xl border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-foreground/40 shadow-sm">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Info */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-wider">#{order.id}</span>
                                                    <span className="h-1 w-1 rounded-full bg-foreground/20" />
                                                    <span className="text-xs font-bold text-foreground/40">{order.date}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                                    {order.items.map(item => item.name).join(", ")}
                                                </h3>
                                                <p className="text-lg font-extrabold text-primary">₦{order.total.toLocaleString()}</p>
                                            </div>

                                            {/* Status & Action */}
                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest",
                                                    config.bg,
                                                    config.color
                                                )}>
                                                    <config.icon className="h-3 w-3" />
                                                    {order.status}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="h-10 px-4 rounded-xl font-bold text-primary hover:bg-primary/5 group/btn"
                                                    asChild
                                                >
                                                    <Link href={`/marketplace/order/${order.id}`}>
                                                        Track Order <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
                                <Package className="h-12 w-12 text-primary/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No orders found</h3>
                                <p className="text-foreground/40 max-w-xs mx-auto">We couldn&apos;t find any orders matching your current filter.</p>
                            </div>
                            <Button className="rounded-xl font-bold px-8 h-12 shadow-lg shadow-primary/20" asChild>
                                <Link href="/marketplace">
                                    Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
