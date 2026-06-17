"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag, Search, Package, Truck, CheckCircle2, XCircle, ArrowRight,
  ChevronRight, Clock, HelpCircle, Ban, Hourglass, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { marketplaceService, Order } from "@/services/marketplace.service";
import { toast } from "sonner";

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any; bg: string; badge: string }> = {
  'PENDING': { label: 'Pending', color: 'text-amber-500', icon: Hourglass, bg: 'bg-amber-500/10 border-amber-500/20', badge: 'bg-amber-500' },
  'PAID': { label: 'Paid', color: 'text-teal-500', icon: Clock, bg: 'bg-teal-500/10 border-teal-500/20', badge: 'bg-teal-500' },
  'PROCESSING': { label: 'Processing', color: 'text-blue-500', icon: RefreshCw, bg: 'bg-blue-500/10 border-blue-500/20', badge: 'bg-blue-500' },
  'SHIPPED': { label: 'Shipped', color: 'text-purple-500', icon: Truck, bg: 'bg-purple-500/10 border-purple-500/20', badge: 'bg-purple-500' },
  'DELIVERED': { label: 'Delivered', color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10 border-green-500/20', badge: 'bg-green-500' },
  'CANCELLED': { label: 'Cancelled', color: 'text-red-500', icon: XCircle, bg: 'bg-red-500/10 border-red-500/20', badge: 'bg-red-500' }
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'All' | OrderStatus>('All');
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Could not load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order? This will restore item stock levels.");
    if (!confirmCancel) return;

    try {
      await marketplaceService.updateOrderStatus(orderId, 'CANCELLED');
      toast.success("Order cancelled successfully!");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to cancel order.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = order.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.items.some(item => {
                            const name = item.productDetails?.name || item.packageDetails?.name || "";
                            return name.toLowerCase().includes(searchTerm.toLowerCase());
                          });
    return matchesTab && matchesSearch;
  });

  const tabs: ('All' | OrderStatus)[] = ['All', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            My Orders <ShoppingBag className="h-8 w-8 text-primary" />
          </h1>
          <p className="text-foreground/50 font-medium text-lg">Track, review, or cancel your marketplace orders.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 rounded-xl bg-white/40 border-glass-border"
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
              "px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 border",
              activeTab === tab
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white/40 text-foreground/60 border-glass-border hover:border-primary/30"
            )}
          >
            {tab === 'All' ? 'All' : statusConfig[tab as OrderStatus].label}
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
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-white/40 animate-pulse border border-glass-border" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, i) => {
                const config = statusConfig[order.status as OrderStatus] || {
                  label: order.status, color: 'text-gray-500', icon: HelpCircle, bg: 'bg-gray-100', badge: 'bg-gray-500'
                };
                
                return (
                  <motion.div
                    key={order.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard className="p-5 md:p-6 border-white/40 hover:border-primary/30 transition-all group">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Thumbnails */}
                        <div className="flex -space-x-4">
                          {order.items.slice(0, 3).map((item, idx) => {
                            const detail = (item.productDetails || item.packageDetails) as any;
                            const image = detail?.imageUrl || "/placeholder-product.png";
                            return (
                              <div
                                key={idx}
                                className="h-16 w-16 rounded-xl border-2 border-white overflow-hidden relative shadow-sm shrink-0 bg-gray-50"
                              >
                                <Image src={image} alt={detail?.name || "Item"} fill className="object-cover" />
                              </div>
                            );
                          })}
                          {order.items.length > 3 && (
                            <div className="h-16 w-16 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-black text-foreground/40 shadow-sm shrink-0">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-wider">ID: {order.uid.substring(0, 8)}</span>
                            <span className="h-1 w-1 rounded-full bg-foreground/20" />
                            <span className="text-xs font-bold text-foreground/40">City: {order.city}</span>
                          </div>
                          <h3 className="font-extrabold text-gray-900 line-clamp-1">
                            {order.items.map(item => item.productDetails?.name || item.packageDetails?.name || "Service Package").join(", ")}
                          </h3>
                          <p className="text-lg font-black text-primary">₦{Number(order.totalPrice).toLocaleString()}</p>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 shrink-0">
                          <div className={cn(
                            "px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest",
                            config.bg,
                            config.color
                          )}>
                            <config.icon className="h-3 w-3" />
                            {config.label}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Cancellation Button: only pre-processing */}
                            {(order.status === 'PENDING' || order.status === 'PAID') && (
                              <Button
                                variant="outline"
                                onClick={() => handleCancelOrder(order.uid)}
                                className="h-10 px-4 rounded-xl font-bold border-red-200 text-red-500 hover:bg-red-50"
                              >
                                Cancel Order
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              className="h-10 px-4 rounded-xl font-bold text-primary hover:bg-primary/5 group/btn"
                              asChild
                            >
                              <Link href={`/marketplace/order/${order.uid}`}>
                                Track Order <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                              </Link>
                            </Button>
                          </div>
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
                  <h3 className="text-xl font-bold text-gray-900 ">No orders found</h3>
                  <p className="text-foreground/40 max-w-xs mx-auto">We couldn&apos;t find any orders matching your selection.</p>
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
      )}
    </div>
  );
}
