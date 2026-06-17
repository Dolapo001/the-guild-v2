"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
 Star,
 MessageSquare,
 Image as ImageIcon,
 Send,
 ThumbsUp,
 Loader2,
 Search,
 Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { socialService } from "@/services/social.service";

interface Review {
 uid: string;
 customerName: string;
 avatar: string | null;
 rating: number;
 comment: string;
 reply: string | null;
 replied_at: string | null;
 createdAt: string;
 serviceName?: string;
}

export default function ReviewsPage() {
 const [reviews, setReviews] = useState<Review[]>([]);
 const [loading, setLoading] = useState(true);
 const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

 const fetchReviews = async () => {
    setLoading(true);
    try {
        const data = await socialService.getReviews();
        setReviews(data);
    } catch (err) {
        console.error("Failed to fetch reviews", err);
    } finally {
        setLoading(false);
    }
 };

 useEffect(() => {
    fetchReviews();
 }, []);

 const handleReply = async (uid: string) => {
  if (!replyText[uid]) return;
  try {
    await socialService.replyToReview(uid, replyText[uid]);
    setReviews(prev => prev.map(rev =>
        rev.uid === uid ? { ...rev, reply: replyText[uid], replied_at: new Date().toISOString() } : rev
    ));
    setReplyText(prev => ({ ...prev, [uid]: "" }));
  } catch (err) {
    console.error("Reply failed", err);
  }
 };

 const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

 return (
 <div className="space-y-10">
 <div className="flex flex-col md:flex-row justify-between gap-6">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 >
 <h1 className="text-3xl font-extrabold tracking-tight text-primary">Reviews & Feedback</h1>
 <p className="text-foreground/50 font-medium">Monitor and respond to customer experiences.</p>
 </motion.div>

 <div className="flex flex-col md:flex-row items-center gap-4">
 <GlassCard className="px-6 py-4 border-accent/20 bg-accent/5 flex items-center gap-6 w-full md:w-auto">
 <div className="text-center">
 <div className="flex items-center justify-center gap-1 text-accent mb-1">
 <Star className="h-6 w-6 fill-accent" />
 <span className="text-3xl font-black">{averageRating}</span>
 </div>
 <p className="text-[10px] font-extrabold text-accent uppercase tracking-widest">{reviews.length} Total Reviews</p>
 </div>
 
 <div className="h-16 w-px bg-accent/20 hidden md:block" />
 
 <div className="space-y-1">
  {ratingCounts.map(rc => (
    <div key={rc.stars} className="flex items-center gap-2 text-[10px] font-bold text-foreground/60">
      <div className="w-6 text-right">{rc.stars} <Star className="inline h-2 w-2 fill-current -mt-0.5" /></div>
      <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
        <div className="h-full bg-accent" style={{ width: `${rc.percentage}%` }} />
      </div>
      <div className="w-4">{rc.count}</div>
    </div>
  ))}
 </div>
 </GlassCard>
 </div>
 </div>

 <div className="flex flex-col md:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
 <input
 placeholder="Search reviews by customer name or content..."
 className="w-full pl-11 h-12 bg-white/40 border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-medium"
 />
 </div>
 <Button variant="outline" className="h-12 rounded-xl border-glass-border font-bold text-primary px-6">
 <Filter className="mr-2 h-4 w-4" /> All Ratings
 </Button>
 </div>

 <div className="space-y-6">
 {loading ? (
    <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="font-bold text-foreground/40 uppercase tracking-widest">Fetching reviews...</p>
    </div>
 ) : reviews.length === 0 ? (
    <div className="text-center py-20 opacity-40">
        <MessageSquare className="h-12 w-12 mx-auto mb-4" />
        <p className="font-bold uppercase tracking-widest">No reviews yet</p>
    </div>
 ) : (
    reviews.map((review, index) => (
    <motion.div
    key={review.uid}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    >
    <GlassCard className="p-8 border-white/40 space-y-6">
    <div className="flex justify-between items-start">
    <div className="flex items-center gap-4">
    <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
    <AvatarImage src={review.avatar || ""} />
    <AvatarFallback>{review.customerName[0]}</AvatarFallback>
    </Avatar>
    <div>
    <p className="font-bold text-primary">{review.customerName}</p>
    <p className="text-xs font-medium text-foreground/40">
        {new Date(review.createdAt).toLocaleDateString()} {review.serviceName ? `• ${review.serviceName}` : ''}
    </p>
    </div>
    </div>
    <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
    <Star
    key={i}
    className={`h-4 w-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-foreground/10'}`}
    />
    ))}
    </div>
    </div>

    <p className="text-sm font-medium text-foreground/70 leading-relaxed">
    {review.comment}
    </p>

    {review.images && review.images.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {review.images.map((img: any, idx: number) => (
          <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-glass-border shadow-sm">
            <img src={img.imageUrl || img.image} alt="Review attachment" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    )}

    <div className="pt-4 border-t border-glass-border flex flex-col gap-4">
    {review.reply ? (
    <div className="bg-primary/[0.03] border border-primary/5 rounded-2xl p-6 space-y-2">
    <div className="flex items-center gap-2 text-[10px] font-extrabold text-primary uppercase tracking-widest">
    <MessageSquare className="h-3 w-3" /> Your Reply
    </div>
    <p className="text-sm font-medium text-primary/80 italic">"{review.reply}"</p>
    </div>
    ) : (
    <div className="flex gap-3">
    <div className="flex-1 relative">
    <input
    placeholder="Write a reply..."
    value={replyText[review.uid] || ""}
    onChange={(e) => setReplyText({ ...replyText, [review.uid]: e.target.value })}
    className="w-full h-12 pl-4 pr-12 bg-white/50 border border-glass-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10"
    />
    <button
    onClick={() => handleReply(review.uid)}
    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
    >
    <Send className="h-4 w-4" />
    </button>
    </div>
    <Button variant="outline" className="h-12 w-12 rounded-xl border-glass-border">
    <ThumbsUp className="h-5 w-5 text-primary/40" />
    </Button>
    </div>
    )}
    </div>
    </GlassCard>
    </motion.div>
    ))
 )}
 </div>
 </div>
 );
}
