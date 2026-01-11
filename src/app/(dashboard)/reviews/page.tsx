"use client";

import { useState } from "react";
import { MOCK_REVIEWS } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
    Star,
    MessageSquare,
    Image as ImageIcon,
    Send,
    ThumbsUp,
    MoreHorizontal,
    Search,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState(MOCK_REVIEWS);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    const handleReply = (id: string) => {
        if (!replyText[id]) return;
        setReviews(prev => prev.map(rev =>
            rev.id === id ? { ...rev, reply: replyText[id] } : rev
        ));
        setReplyText(prev => ({ ...prev, [id]: "" }));
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">Reviews & Feedback</h1>
                    <p className="text-foreground/50 font-medium">Monitor and respond to customer experiences.</p>
                </motion.div>

                <div className="flex items-center gap-4">
                    <GlassCard className="px-6 py-3 border-accent/20 bg-accent/5 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-accent">
                            <Star className="h-5 w-5 fill-accent" />
                            <span className="text-xl font-extrabold">4.8</span>
                        </div>
                        <div className="h-8 w-px bg-accent/20" />
                        <p className="text-[10px] font-extrabold text-accent uppercase tracking-widest">Average Rating</p>
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
                {reviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="p-8 border-white/40 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                                        <AvatarImage src={review.avatar} />
                                        <AvatarFallback>{review.user[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-primary">{review.user}</p>
                                        <p className="text-xs font-medium text-foreground/40">{review.date}</p>
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
                                {review.text}
                            </p>

                            {review.images.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {review.images.map((img, i) => (
                                        <div key={i} className="h-24 w-24 rounded-xl overflow-hidden relative shrink-0 border border-glass-border">
                                            <Image src={img} alt="Review" fill className="object-cover" />
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
                                                value={replyText[review.id] || ""}
                                                onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                                className="w-full h-12 pl-4 pr-12 bg-white/50 border border-glass-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10"
                                            />
                                            <button
                                                onClick={() => handleReply(review.id)}
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
                ))}
            </div>
        </div>
    );
}
