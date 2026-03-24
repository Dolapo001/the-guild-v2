"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, ArrowRight, Sparkles, Heart } from "lucide-react";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";
import { Service } from "@/lib/mock-data";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
    service: Service;
    isMaestroMatch?: boolean;
    tag?: string;
    distance?: number;
}

export function ServiceCard({ service, isMaestroMatch, tag, distance }: ServiceCardProps) {
    const { toggleFavorite, isFavorite } = useFavorites();
    const favorited = isFavorite(service.id);

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(service, 'service');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/service/${service.id}`} className="block h-full">
                <div className={`h-full flex flex-col overflow-hidden rounded-2xl border border-[--border] bg-card backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-200 group ${isMaestroMatch ? 'ring-2 ring-secondary/50 shadow-xl shadow-secondary/10' : ''}`}>
                    <div className="relative h-48 w-full overflow-hidden bg-muted dark:bg-white/5">
                        <Image
                            src={service.image}
                            alt={service.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Favorite Button */}
                        <button
                            onClick={handleFavorite}
                            className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group/heart"
                        >
                            <motion.div
                                animate={favorited ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <Heart
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        favorited ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/heart:text-red-500"
                                    )}
                                />
                            </motion.div>
                        </button>

                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            {(isMaestroMatch || tag) && (
                                <div className="bg-secondary text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                    <Sparkles className="h-3 w-3 fill-primary" />
                                    {tag || (
                                        <span>
                                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Match
                                        </span>
                                    )}
                                </div>
                            )}
                            {service.isVerified && (
                                <div className="bg-accent/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <ShieldCheck className="h-3 w-3" />
                                    VERIFIED
                                </div>
                            )}
                            {service.isTopRated && (
                                <div className="bg-secondary/90 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Star className="h-3 w-3 fill-primary" />
                                    TOP RATED
                                </div>
                            )}
                            {distance !== undefined && (
                                <div className={cn(
                                    "backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg",
                                    distance < 2 ? "bg-green-500/90 text-white" : "bg-white/90 dark:bg-slate-900/90 text-foreground"
                                )}>
                                    <MapPin className="h-3 w-3" />
                                    {distance.toFixed(1)}km away
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors duration-150">
                                {service.businessName}
                            </h3>
                            <div className="flex items-center gap-1 text-sm font-bold text-foreground shrink-0 ml-2">
                                <Star className="h-4 w-4 fill-secondary text-secondary" />
                                {service.rating}
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground font-medium mb-3 line-clamp-1">
                            {service.name}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-5">
                            <MapPin className="h-3.5 w-3.5" />
                            {service.location}
                        </div>

                        <div className="mt-auto pt-4 border-t border-[--border]">
                            {/* Mobile Layout (Always Visible) */}
                            <div className="flex lg:hidden flex-col gap-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Starting at</p>
                                        <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">₦{service.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="w-full h-10 rounded-xl border border-primary text-primary flex items-center justify-center font-semibold text-sm transition-colors duration-150 hover:bg-primary hover:text-white">
                                    Book Now
                                </div>
                            </div>

                            {/* Desktop Layout (Hover Animation) */}
                            <div className="hidden lg:block h-14 relative overflow-hidden">
                                <div className="absolute top-4 left-0 w-full flex items-center justify-between group-hover:-translate-y-full group-hover:opacity-0 transition-all duration-200">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Starting at</p>
                                        <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">₦{service.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-sm font-semibold text-primary flex items-center gap-1">
                                        View <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="w-full h-10 rounded-xl border border-primary text-primary flex items-center justify-center font-semibold text-sm transition-all duration-200 absolute top-0 left-0 translate-y-full opacity-0 group-hover:translate-y-4 group-hover:opacity-100 hover:bg-primary hover:text-white">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
