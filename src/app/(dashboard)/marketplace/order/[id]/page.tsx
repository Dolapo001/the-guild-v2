"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, MapPin, Clock, ChevronLeft, Download, Share2, Truck, Phone, Bike,
  ExternalLink, AlertCircle, Package, Hourglass, RefreshCw, HelpCircle, Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { marketplaceService, Order } from "@/services/marketplace.service";
import Image from "next/image";

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrderDetail = async () => {
    try {
      const data = await marketplaceService.getOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order details:", err);
      toast.error("Could not find this order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-mesh-gradient">
        <LoaderComponent />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-mesh-gradient space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-bold text-gray-900">Order not found</p>
        <Button asChild className="rounded-xl font-bold bg-primary text-white">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  // Define Timeline steps dynamically based on backend status
  const getTimelineSteps = (status: OrderStatus) => {
    const isCancelled = status === 'CANCELLED';
    if (isCancelled) {
      return [
        { title: "Order Created", description: "Your checkout request was created.", status: "completed" },
        { title: "Order Cancelled", description: "This order was cancelled and inventory was restored.", status: "cancelled" }
      ];
    }

    return [
      {
        title: "Order Placed",
        description: "Your order is pending confirmation.",
        status: status === 'PENDING' ? "current" : "completed"
      },
      {
        title: "Escrow Payment Secured",
        description: "Funds are locked safely in Escrow.",
        status: status === 'PENDING' ? "pending" : status === 'PAID' ? "current" : "completed"
      },
      {
        title: "Order Processing",
        description: "The provider is bundling and packaging your items.",
        status: ['PENDING', 'PAID'].includes(status) ? "pending" : status === 'PROCESSING' ? "current" : "completed"
      },
      {
        title: "Out for Delivery / Shipped",
        description: "Rider has been assigned and is en route.",
        status: ['PENDING', 'PAID', 'PROCESSING'].includes(status) ? "pending" : status === 'SHIPPED' ? "current" : "completed"
      },
      {
        title: "Delivered",
        description: "Package received. Revenue released to the business.",
        status: status === 'DELIVERED' ? "completed" : "pending"
      }
    ];
  };

  const steps = getTimelineSteps(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-background bg-mesh-gradient pb-24 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="font-bold text-primary mb-4 pl-0 hover:bg-transparent hover:text-primary/80">
            <Link href="/marketplace/orders">
              <ChevronLeft className="mr-2 h-4 w-4" /> View My Orders
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                {order.status === 'DELIVERED' ? "Order Delivered!" : 
                 order.status === 'SHIPPED' ? "Order on its way!" : 
                 order.status === 'CANCELLED' ? "Order Cancelled" : "Tracking Your Order"}
                {order.status === 'SHIPPED' && <Truck className="h-8 w-8 text-primary animate-bounce" />}
                {order.status === 'DELIVERED' && <CheckCircle2 className="h-8 w-8 text-green-500" />}
                {order.status === 'CANCELLED' && <Ban className="h-8 w-8 text-red-500" />}
              </h1>
              <p className="text-foreground/60 font-medium mt-2">Order ID: <span className="font-mono font-bold text-primary">{order.uid}</span></p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-glass-border font-bold">
                <Download className="mr-2 h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Timeline & Status */}
          <div className="lg:col-span-2 space-y-6">

            {/* Simulated Logistics Tracker for Shipped Stage */}
            {order.status === 'SHIPPED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <GlassCard className="p-6 border-blue-200 bg-blue-50/50 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-500 text-white rounded-2xl shrink-0">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">Rider En Route</h4>
                    <p className="text-xs text-foreground/60 font-medium mt-0.5">
                      Your rider has loaded your city delivery package and is navigating to your address.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Timeline Card */}
            <GlassCard className="p-8 border-white/40 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Milestones</h2>
              <div className="relative pl-4 border-l-2 border-glass-border space-y-8">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    {/* Circle Pin */}
                    <div className={cn(
                      "absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 bg-background transition-all",
                      step.status === "completed" ? "border-green-500 bg-green-500" :
                      step.status === "current" ? "border-primary bg-primary animate-pulse" :
                      step.status === "cancelled" ? "border-red-500 bg-red-500" :
                      "border-gray-200 "
                    )} />

                    <div>
                      <h3 className={cn(
                        "font-extrabold text-sm",
                        step.status === "completed" ? "text-green-600" :
                        step.status === "current" ? "text-primary font-black" :
                        step.status === "cancelled" ? "text-red-500" :
                        "text-foreground/40"
                      )}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-foreground/60 font-medium mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Delivery Address Block */}
            <GlassCard className="p-8 border-white/40 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Destination</h2>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Registered Location</p>
                  <p className="text-sm font-extrabold text-gray-900 leading-snug">{order.delivery_address}</p>
                  <p className="text-xs font-bold text-blue-500 uppercase">City Gated Destination: {order.city}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Order Items & Pricing Breakdown */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 border-white/40 bg-white/80 backdrop-blur-2xl sticky top-28 shadow-lg space-y-6">
              <h3 className="text-lg font-extrabold text-gray-900">Receipt</h3>

              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {order.items.map((item) => {
                  const detail = (item.product_details || item.package_details) as any;
                  return (
                    <div key={item.uid} className="flex justify-between items-start gap-3">
                      <div className="flex gap-2 min-w-0">
                        <div className="h-8 px-2 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-foreground/60">
                          x{item.quantity}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-gray-900 truncate leading-snug">{detail?.name || "Service Package"}</p>
                          <p className="text-[10px] text-foreground/40 font-bold uppercase">{detail?.category || "Bundle"}</p>
                        </div>
                      </div>
                      <p className="text-xs font-black text-gray-900 shrink-0">
                        ₦{(Number(item.price_at_order) || 0).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-glass-border" />

              {/* Price list */}
              <div className="space-y-2.5 text-xs font-bold">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₦{Number(order.total_items_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Delivery Fee</span>
                  <span className="text-amber-500">Pay on Delivery</span>
                </div>
                <div className="flex justify-between text-base pt-3 border-t border-dashed border-glass-border">
                  <span className="font-black text-gray-900">Total Price</span>
                  <span className="font-black text-primary">₦{Number(order.total_price).toLocaleString()}</span>
                </div>
              </div>

              {/* Escrow Badge */}
              {order.status !== 'CANCELLED' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-emerald-800 leading-none">Payment Secured</p>
                    <p className="text-[9px] font-bold text-emerald-600/80 mt-1 leading-none">Funds held in platform escrow</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderComponent() {
  return (
    <div className="flex flex-col items-center gap-2">
      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Loading status details...</p>
    </div>
  );
}
