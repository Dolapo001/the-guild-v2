"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 History,
 Search,
 Calendar,
 ShoppingBag,
 ArrowRight,
 ChevronRight,
 Clock,
 CheckCircle2,
 XCircle,
 Filter,
 Star,
 MessageSquare,
 Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { bookingService } from "@/services/booking.service";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ActivityType = 'All' | 'Service' | 'Product';
type ActivityStatus = 'Completed' | 'Pending' | 'Cancelled' | 'In Progress';

interface Activity {
 id: string;
 type: 'Service' | 'Product';
 title: string;
 subtitle: string;
 date: string;
 amount: string;
 status: ActivityStatus;
 image?: string;
 hasReview?: boolean;
}

const statusConfig: Record<ActivityStatus, { color: string; icon: any; bg: string }> = {
 'Completed': { color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10 border-green-500/20' },
 'Pending': { color: 'text-amber-500', icon: Clock, bg: 'bg-amber-500/10 border-amber-500/20' },
 'In Progress': { color: 'text-primary', icon: Clock, bg: 'bg-primary/10 border-primary/20' },
 'Cancelled': { color: 'text-red-500', icon: XCircle, bg: 'bg-red-500/10 border-red-500/20' }
};

export default function ActivitiesPage() {
 const [activeTab, setActiveTab] = useState<ActivityType>('All');
 const [searchTerm, setSearchTerm] = useState("");
 const [activities, setActivities] = useState<Activity[]>([]);
 const [loading, setLoading] = useState(true);
 
 // Review State
 const [reviewingActivity, setReviewingActivity] = useState<Activity | null>(null);
 const [rating, setRating] = useState(0);
 const [comment, setComment] = useState("");
 const [isSubmittingReview, setIsSubmittingReview] = useState(false);

 const fetchActivities = async () => {
    setLoading(true);
    try {
        const bookings = await bookingService.getMyBookings();
        const mapped: Activity[] = bookings.map(b => ({
            id: b.uid,
            type: 'Service',
            title: b.service_details?.name || 'Service',
            subtitle: b.business?.name || 'Business',
            date: b.date,
            amount: `₦${Number(b.total_price).toLocaleString()}`,
            status: b.status.replace('_', ' ').toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ') as any,
            hasReview: !!b.review
        }));
        setActivities(mapped);
    } catch (err) {
        console.warn("Using mock activities", err);
        setActivities([
            { id: "ACT-003", type: "Service", title: "Haircut", subtitle: "Tunde's Barbershop", date: "Oct 20, 2023", amount: "₦5,000", status: "Completed" },
            { id: "ACT-004", type: "Service", title: "Car Wash", subtitle: "Clean Wheels", date: "Oct 15, 2023", amount: "₦3,500", status: "Completed" },
        ]);
    } finally {
        setLoading(false);
    }
 };

 useEffect(() => {
    fetchActivities();
 }, []);

 const handleReviewSubmit = async () => {
    if (!reviewingActivity || rating === 0) return;
    setIsSubmittingReview(true);
    try {
        await bookingService.submitReview({
            booking: reviewingActivity.id,
            rating,
            comment
        });
        toast.success("Review submitted successfully!");
        setReviewingActivity(null);
        setRating(0);
        setComment("");
        fetchActivities();
    } catch (err) {
        console.error("Review failed", err);
        toast.error("Failed to submit review. Please try again.");
    } finally {
        setIsSubmittingReview(false);
    }
 };

 const filteredActivities = activities.filter(activity => {
  const matchesTab = activeTab === 'All' || activity.type === activeTab;
  const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  activity.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesTab && matchesSearch;
 });

 return (
  <div className="space-y-8 pb-24">
  {/* Header */}
  <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col md:flex-row md:items-center justify-between gap-4"
  >
  <div>
  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
  Recent Activities <History className="h-8 w-8 text-primary" />
  </h1>
  <p className="text-foreground/50 font-medium text-lg">Your complete history of services and purchases.</p>
  </div>

  <div className="relative w-full md:w-80">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
  <Input
  placeholder="Search activities..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="pl-11 h-12 rounded-xl bg-white/40 border-glass-border"
  />
  </div>
  </motion.div>

  {/* Filter Tabs */}
  <div className="flex gap-2 p-1 bg-primary/5 rounded-2xl w-fit border border-primary/10">
  {(['All', 'Service', 'Product'] as ActivityType[]).map((tab) => (
  <button
  key={tab}
  onClick={() => setActiveTab(tab)}
  className={cn(
  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
  activeTab === tab
  ? "bg-primary text-white shadow-lg shadow-primary/20"
  : "text-foreground/50 hover:text-primary hover:bg-primary/5"
  )}
  >
  {tab}s
  </button>
  ))}
  </div>

  {/* Activities List */}
  <div className="space-y-4">
  <AnimatePresence mode="popLayout">
  {filteredActivities.length > 0 ? (
  filteredActivities.map((activity, i) => {
  const config = statusConfig[activity.status] || statusConfig['Pending'];
  return (
  <motion.div
  key={activity.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ delay: i * 0.05 }}
  >
  <GlassCard className="p-5 border-white/40 hover:border-primary/30 transition-all group">
  <div className="flex items-center gap-5">
  {/* Icon/Image */}
  <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden relative border border-primary/10">
  {activity.image ? (
  <Image src={activity.image} alt={activity.title} fill className="object-cover" />
  ) : (
  activity.type === 'Service' ? <Calendar className="h-7 w-7 text-primary/40" /> : <ShoppingBag className="h-7 w-7 text-primary/40" />
  )}
  </div>

  {/* Info */}
  <div className="flex-1 min-w-0">
  <div className="flex items-center gap-2 mb-1">
  <span className={cn(
  "text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md",
  activity.type === 'Service' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
  )}>
  {activity.type}
  </span>
  <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{activity.date}</span>
  </div>
  <h3 className="font-bold text-gray-900 truncate text-lg">{activity.title}</h3>
  <p className="text-sm font-medium text-foreground/50">{activity.subtitle}</p>
  </div>

  {/* Price & Status */}
  <div className="text-right space-y-2">
  <p className="text-lg font-extrabold text-primary">{activity.amount}</p>
  <div className={cn(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-widest",
  config.bg,
  config.color
  )}>
  <config.icon className="h-3 w-3" />
  {activity.status}
  </div>
  </div>

  {/* Action */}
  <div className="flex items-center gap-3">
  {activity.status === 'Completed' && activity.type === 'Service' && !activity.hasReview && (
    <Button
        onClick={() => setReviewingActivity(activity)}
        className="h-10 px-4 rounded-xl bg-accent text-white font-bold text-xs"
    >
        <Star className="mr-2 h-4 w-4" /> Rate & Review
    </Button>
  )}
  <Button
  variant="outline"
  size="sm"
  className="hidden md:flex rounded-xl border-glass-border font-bold text-primary hover:bg-primary/5 h-9"
  asChild
  >
  <Link href={activity.type === 'Service' ? `/search` : `/marketplace`}>
  {activity.type === 'Service' ? 'Book Again' : 'Buy Again'}
  </Link>
  </Button>
  <Button
  variant="ghost"
  size="icon"
  className="h-10 w-10 rounded-xl hover:bg-primary/5 group/btn"
  asChild
  >
  <Link href={activity.type === 'Service' ? `/customer` : `/marketplace/order/${activity.id}`}>
  <ChevronRight className="h-5 w-5 text-foreground/20 group-hover/btn:text-primary transition-colors" />
  </Link>
  </Button>
  </div>
  </div>
  </GlassCard>
  </motion.div>
  );
  })
  ) : (
  <div className="py-20 text-center">
  <p className="text-foreground/40 font-medium">{loading ? "Loading activities..." : "No activities found matching your search."}</p>
  </div>
  )}
  </AnimatePresence>
  </div>

  {/* Review Dialog */}
  <Dialog open={!!reviewingActivity} onOpenChange={() => setReviewingActivity(null)}>
    <DialogContent className="bg-white border-none rounded-3xl p-8 max-w-md">
        <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-primary flex items-center gap-3">
                <Star className="h-7 w-7 text-accent" /> Rate your experience
            </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-foreground/50">How would you rate {reviewingActivity?.subtitle}?</p>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            onClick={() => setRating(s)}
                            className="transition-transform active:scale-95"
                        >
                            <Star 
                                className={cn(
                                    "h-10 w-10",
                                    s <= rating ? "fill-accent text-accent" : "text-foreground/10"
                                )} 
                            />
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Share more details</label>
                <Textarea 
                    placeholder="What did you love? Any room for improvement?"
                    className="rounded-2xl border-glass-border h-32 focus:ring-primary/20"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
            <Button
                onClick={handleReviewSubmit}
                disabled={rating === 0 || isSubmittingReview}
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 text-lg"
            >
                {isSubmittingReview ? "Submitting..." : "Post Review"}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
  </div>
 );
}
