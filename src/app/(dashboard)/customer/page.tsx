"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { asList, bookingService } from "@/services/booking.service";
import { maestroService } from "@/services/maestro.service";
import { marketplaceService } from "@/services/marketplace.service";
import { Booking, Service, Product } from "@/types/api";
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
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingModal } from "@/components/shared/booking-modal";
import { ReviewModal } from "@/components/shared/review-modal";
import { ServiceCard } from "@/components/ui/service-card";
import { ProductCard } from "@/components/ui/product-card";
import { CustomerSkeleton } from "@/components/dashboard/customer-skeleton";

// Removed hardcoded RECENT_ORDERS


interface ActiveBooking {
  service_name?: string;
  customer_name?: string;
  business_name?: string;
  staff_name?: string;
  time?: string;
  service_details?: any;
  replacement_proposal?: {
    name: string;
    rating: string;
    image: string;
  };
  status: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [recommendations, setRecommendations] = useState<(Service | Product)[]>([]);
  const [history, setHistory] = useState<Booking[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<{ uid: string, name: string } | null>(null);

  const openReviewModal = (uid: string, name: string) => {
    setReviewBooking({ uid, name });
    setReviewModalOpen(true);
  };

  const displayName = user?.name ?? user?.username ?? "Customer";
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [recFilter, setRecFilter] = useState<'all' | 'service' | 'product'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bksRaw, recsRaw, ordersRaw] = await Promise.all([
          bookingService.getBookings(),
          maestroService.getRecommendations(),
          marketplaceService.getMyOrders()
        ]);

        const bks = asList(bksRaw);
        const recs = asList(recsRaw);
        const orders = asList(ordersRaw);

        setRecentOrders(orders);
        // Find first active/meaningful booking
        const active = bks.find(b => ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DECLINED_WITH_OPTION'].includes(b.status));
        setActiveBooking(active || null);

        // History is completed/cancelled
        const hist = bks.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status));
        setHistory(hist);

        setRecommendations(recs as any);
      } catch (err) {
        console.error("Failed to fetch customer data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleGetDirections = () => {
    if (!activeBooking) return;
    const destination = encodeURIComponent(activeBooking.location || (activeBooking as any).business_name || '');
    const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${destination}`;
    window.open(url, '_blank');
  };

  const handleReschedule = () => {
    setIsRescheduleModalOpen(true);
  };

  const handleAcceptReplacement = async () => {
    if (activeBooking) {
      const toastId = toast.loading("Updating your booking...");
      try {
        await bookingService.updateBookingStatus(activeBooking.uid, "CONFIRMED");
        const bks = await bookingService.getBookings();
        setActiveBooking(bks.find(b => b.uid === activeBooking.uid) || null);
        toast.success("Replacement accepted! See you then.", { id: toastId });
      } catch (err) {
        console.error("Failed to accept replacement", err);
        toast.error("Failed to update booking.", { id: toastId });
      }
    }
  };

  const handleCancelBooking = () => {
    setCancelConfirmOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (activeBooking) {
      const toastId = toast.loading("Cancelling booking...");
      try {
        await bookingService.updateBookingStatus(activeBooking.uid, "CANCELLED");
        setActiveBooking(null);
        setCancelConfirmOpen(false);
        toast.success("Booking cancelled. Refund issued to wallet.", { id: toastId });
      } catch (err) {
        console.error("Failed to cancel booking", err);
        toast.error("Failed to cancel booking.", { id: toastId });
      }
    }
  };

  const getGoogleCalendarUrl = (booking: Booking) => {
    const dateStr = booking.date;
    const timePart = booking.start_time;

    const now = new Date();
    const dateVal = dateStr.toLowerCase() === 'today'
      ? `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
      : dateStr;

    const start = new Date(`${dateVal} ${timePart}`);
    const validStart = isNaN(start.getTime()) ? new Date() : start;
    const end = new Date(validStart.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatISO = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${booking.service_name} - ${(booking as any).business_name}`,
      dates: `${formatISO(validStart)}/${formatISO(end)}`,
      details: `Booking Reference: #${booking.uid.slice(0, 8)}. Staff: ${booking.staff_name || 'TBD'}. Booking with The Guild`,
      location: booking.location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const filteredRecs = recommendations
    .filter((item: any) => recFilter === 'all' || item.type === recFilter)
    .slice(0, 4);

  if (loading) return <CustomerSkeleton />;

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1"
      >
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-primary">Hello, {displayName.split(' ')[0]}.</h1>
        <p className="text-foreground/50 font-semibold text-base sm:text-lg">Ready to glow today?</p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Booking */}
          <section className="space-y-4">
            <h3 className="text-[10px] sm:text-xs font-black text-foreground/30 uppercase tracking-widest px-1">Active Booking</h3>
            {activeBooking ? (
              <GlassCard className={cn(
                "p-5 sm:p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden transition-all duration-500",
                activeBooking.status === "DECLINED_WITH_OPTION" && "border-amber-500/50 bg-amber-500/5 ring-2 ring-amber-500/20"
              )}>
                {activeBooking.status === "DECLINED_WITH_OPTION" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start sm:items-center gap-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-xs sm:text-sm font-bold text-amber-700 ">
                      Appointment Update: {activeBooking.staff_name} is unavailable, but we found a match!
                    </p>
                  </motion.div>
                )}

                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
                  <div className="space-y-6 flex-1 min-w-0">
                    <div>
                      <h4 className="text-xl sm:text-3xl font-black text-primary truncate">{activeBooking.service_name}</h4>
                      <p className="text-xs sm:text-sm font-bold text-foreground/60">{(activeBooking as any).business_name}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-primary/70">
                        <Calendar className="h-4 w-4" /> {activeBooking.date}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-primary/70">
                        <Clock className="h-4 w-4" /> {activeBooking.start_time}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-primary/70">
                        <MapPin className="h-4 w-4" /> {activeBooking.location || 'Location Pending'}
                      </div>
                    </div>

                    {activeBooking.status === "DECLINED_WITH_OPTION" && activeBooking.replacement_proposal ? (
                      <div className="space-y-6">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/40 border border-white/20 backdrop-blur-xl shadow-lg">
                          <p className="text-xs sm:text-sm font-bold text-foreground/80 mb-4">
                            Found <span className="text-primary font-black">{activeBooking.replacement_proposal.name}</span> available for you.
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 border-primary shadow-lg shrink-0">
                              <Image src={activeBooking.replacement_proposal.image} alt={activeBooking.replacement_proposal.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-foreground text-base sm:text-lg truncate">{activeBooking.replacement_proposal.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                  <Star className="h-3 w-3 fill-amber-500" /> {activeBooking.replacement_proposal.rating}
                                </span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 hidden sm:inline-block">
                                  Verified Pro
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={handleAcceptReplacement}
                            className="flex-1 bg-primary text-white rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm"
                          >
                            <Check className="mr-2 h-5 w-5" /> Accept Replacement
                          </Button>
                          <Button
                            onClick={() => setIsRescheduleModalOpen(true)}
                            variant="outline"
                            className="flex-1 border-glass-border bg-white/50 text-primary rounded-xl h-12 px-6 font-bold hover:bg-white text-sm"
                          >
                            Modify Booking
                          </Button>
                          <Button
                            onClick={handleCancelBooking}
                            variant="ghost"
                            className="text-foreground/40 hover:text-red-500 hover:bg-red-500/5 font-bold h-10 px-4 rounded-xl transition-all text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                          {activeBooking.staff_name ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-blue-400" />
                              </div>
                              <p className="text-xs sm:text-sm text-foreground/60 min-w-0 truncate">
                                Confirmed with <span className="text-primary font-bold">{activeBooking.staff_name}</span>
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                <Info className="h-4 w-4 text-amber-400" />
                              </div>
                              <p className="text-xs sm:text-sm font-medium text-foreground/50 truncate">Waiting for confirmation.</p>
                              <div className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-600 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> <span className="hidden sm:inline">Verified by</span> Maestro
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={handleGetDirections}
                            className="bg-primary text-white rounded-xl h-11 px-6 font-black shadow-lg shadow-primary/20 text-sm"
                          >
                            <Navigation className="mr-2 h-4 w-4" /> Get Directions
                          </Button>
                          <Button
                            onClick={handleReschedule}
                            variant="outline"
                            className="border-glass-border text-primary rounded-xl h-11 px-6 font-bold text-sm hover:bg-white"
                          >
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 mt-6 lg:mt-0 shrink-0">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-colors",
                      activeBooking.status === "DECLINED_WITH_OPTION"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : activeBooking.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-secondary/10 text-primary border-secondary/20"
                    )}>
                      {activeBooking.status.replace(/_/g, ' ')}
                    </div>
                    <a
                      href={getGoogleCalendarUrl(activeBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-16 w-16 sm:h-20 sm:w-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 hover:scale-105 transition-all group/cal shrink-0 shadow-lg"
                    >
                      <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white/60 group-hover/cal:text-white transition-colors" />
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
              <div className="flex p-1 bg-white/40 rounded-lg border border-glass-border backdrop-blur-sm">
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
                filteredRecs.map((item: any, index: number) => (
                  item.type === 'service' ? (
                    <ServiceCard key={item.uid || item.id || index} service={item as any} tag={(item as any).tag} isMaestroMatch={(item as any).tag?.includes('Maestro Match')} />
                  ) : (
                    <ProductCard key={item.uid || item.id || index} product={item as any} isMaestroMatch={(item as any).tag?.includes('Maestro Match')} />
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
            <div className="grid gap-3 sm:gap-4">
              {history.map((item) => (
                <GlassCard key={item.uid} className="p-4 sm:p-5 border-white/40 flex items-center justify-between hover:bg-white/60 transition-all group">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary text-sm sm:text-base truncate">{item.service_name}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-foreground/40 truncate">{(item as any).business_name} • {item.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <p className="font-black text-primary text-sm sm:text-base">₦{Number(item.total_price).toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {item.status === 'COMPLETED' && (
                        <button
                          onClick={(e) => { e.preventDefault(); openReviewModal(item.uid, item.service_name); }}
                          className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-colors flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" /> Review
                        </button>
                      )}
                      <Link
                        href={`/marketplace`}
                        className="text-[9px] sm:text-[10px] font-black text-accent uppercase tracking-widest hover:underline transition-colors"
                      >
                        Rebook
                      </Link>
                    </div>
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
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 3).map((order) => {
                  const firstItem = order.items?.[0];
                  const name = firstItem?.product_details?.name || firstItem?.package_details?.name || "Marketplace Order";
                  const image = firstItem?.product_details?.image_url || firstItem?.package_details?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop";

                  return (
                    <Link href={`/marketplace/orders`} key={order.uid} className="flex items-center gap-3 group cursor-pointer">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-glass-border">
                        <Image src={image} alt={name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary truncate group-hover:text-accent transition-colors">{name}</p>
                        <p className="text-[10px] font-mono font-bold text-foreground/40">#{order.uid.slice(0, 8)}</p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-md border text-[9px] font-bold whitespace-nowrap",
                        order.status === 'DELIVERED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-primary/5 border-primary/10 text-primary"
                      )}>
                        {order.status}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold text-foreground/30 italic">No orders yet.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Reschedule Modal */}
      <BookingModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        service={null as any}
        mode="reschedule"
        initialData={{
          selectedServices: [activeBooking?.service_name || ""],
          staffId: 'AUTO',
        }}
      />

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {cancelConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl p-8 border border-glass-border shadow-premium max-w-sm w-full space-y-6"
            >
              <div>
                <h3 className="text-xl font-extrabold text-foreground">Cancel Booking?</h3>
                <p className="text-sm font-medium text-foreground/60 mt-2">You will receive a full refund to your wallet. This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-glass-border text-foreground font-bold hover:bg-muted transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {reviewBooking && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          bookingUid={reviewBooking.uid}
          serviceName={reviewBooking.name}
        />
      )}

    </div>
  );
}
