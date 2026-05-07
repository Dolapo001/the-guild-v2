"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, XCircle, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { socialService } from "@/services/social.service";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface Review {
 uid: string;
 customer_name: string;
 rating: number;
 comment: string;
 status: string;
 created_at: string;
 service_name?: string;
 images?: {uid: string, image_url: string}[];
}

export default function AdminReviewsPage() {
 const [reviews, setReviews] = useState<Review[]>([]);
 const [loading, setLoading] = useState(true);

 const fetchReviews = async () => {
    setLoading(true);
    try {
        const data = await api.get<Review[]>('/social/reviews/'); // Actually admin can see all reviews or we need to pass a special param or get all from the model
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

 const handleModerate = async (uid: string, status: 'APPROVED' | 'REJECTED' | 'DELETED') => {
  try {
    await socialService.moderateReview(uid, status);
    toast.success(`Review ${status.toLowerCase()}`);
    if (status === 'DELETED') {
        setReviews(prev => prev.filter(r => r.uid !== uid));
    } else {
        setReviews(prev => prev.map(r => r.uid === uid ? { ...r, status } : r));
    }
  } catch (err: any) {
    toast.error(err.message || "Action failed");
  }
 };

 return (
  <div className="space-y-10">
   <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
    <h1 className="text-3xl font-extrabold tracking-tight text-primary">Review Moderation</h1>
    <p className="text-foreground/50 font-medium">Ensure trust and safety by moderating feedback.</p>
   </motion.div>

   <GlassCard className="overflow-hidden border-white/40 min-h-[400px]">
    <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse">
      <thead>
       <tr className="bg-primary/5 border-b border-glass-border">
        <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Customer</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Rating</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Comment</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Status</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest text-right">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-glass-border">
       {loading ? (
         <tr>
             <td colSpan={5} className="px-6 py-20 text-center text-foreground/40">Loading reviews...</td>
         </tr>
       ) : reviews.length === 0 ? (
         <tr>
             <td colSpan={5} className="px-6 py-20 text-center text-foreground/40">No reviews found.</td>
         </tr>
       ) : reviews.map((item) => (
       <tr key={item.uid} className="hover:bg-primary/[0.02] transition-colors">
        <td className="px-6 py-4 font-bold text-primary">{item.customer_name}</td>
        <td className="px-6 py-4 font-bold text-accent">{item.rating} / 5</td>
        <td className="px-6 py-4 text-sm font-medium text-foreground/70 max-w-xs truncate">{item.comment}</td>
        <td className="px-6 py-4">
         <Badge className={`font-bold text-[10px] uppercase tracking-widest ${item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : item.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
          {item.status}
         </Badge>
        </td>
        <td className="px-6 py-4 text-right flex justify-end gap-2">
         {item.status !== 'APPROVED' && (
           <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => handleModerate(item.uid, 'APPROVED')}>
            <CheckCircle2 className="h-4 w-4" />
           </Button>
         )}
         {item.status !== 'REJECTED' && (
           <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" onClick={() => handleModerate(item.uid, 'REJECTED')}>
            <XCircle className="h-4 w-4" />
           </Button>
         )}
         <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleModerate(item.uid, 'DELETED')}>
          <Trash2 className="h-4 w-4" />
         </Button>
        </td>
       </tr>
       ))}
      </tbody>
     </table>
    </div>
   </GlassCard>
  </div>
 );
}
