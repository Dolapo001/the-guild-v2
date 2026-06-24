"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, ArrowRight, Sparkles, Heart } from "lucide-react";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";
import { Service } from "@/types/api";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ServiceCardProps {
 service: Service;
 isMaestroMatch?: boolean;
 tag?: string;
 distance?: number;
}

export function ServiceCard({ service, isMaestroMatch, tag, distance }: ServiceCardProps) {
 const { toggleFavorite, isFavorite } = useFavorites();
 const favorited = isFavorite(service.uid);

 const handleFavorite = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  toggleFavorite(service, 'service');
  if (!favorited) {
   toast.success(`${service.name} added to favorites!`);
  }
 };

 const image = service.imageUrl || service.image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop";
 const name = service.name;
 const businessName = service.businessName || service.name;
 const location = service.locationName || service.location || "Lagos";

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -8 }}
 transition={{ duration: 0.3 }}
 >
 <Link href={`/service/${(service as any).businessUid || service.uid}`} className="block h-full">
 <div className={`h-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-md shadow-sm hover:shadow-md transition-all group ${isMaestroMatch ? 'ring-2 ring-secondary/50 shadow-xl shadow-secondary/10' : ''}`}>
 <div className="relative h-48 w-full overflow-hidden bg-muted ">
 <Image
 src={image}
 alt={name}
 fill
 className="object-cover transition-transform duration-500 group-hover:scale-110"
 />

 {/* Favorite Button */}
 <button
 onClick={handleFavorite}
 className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group/heart"
 >
 <motion.div
 animate={favorited ? { scale: [1, 1.3, 1] } : {}}
 transition={{ duration: 0.3 }}
 >
 <Heart
 className={cn(
 "h-5 w-5 transition-colors",
 favorited ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover/heart:text-red-500"
 )}
 />
 </motion.div>
 </button>

 <div className="absolute top-3 left-3 flex flex-wrap gap-2">
 {(isMaestroMatch || tag || service.maestroScore) && (
 <div className="bg-secondary text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl animate-pulse">
 <Sparkles className="h-3 w-3 fill-primary" />
 {tag || (
 <span>
 <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Match {service.maestroScore ? `${service.maestroScore}%` : ''}
 </span>
 )}
 </div>
 )}
 {service.isVerified ? (
  <div className="bg-success/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
   <ShieldCheck className="h-3 w-3" />
   VERIFIED
  </div>
 ) : (
  <div className="bg-error/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
   UNVERIFIED (CANNOT BOOK)
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
 distance < 2 ? "bg-success/90 text-white" : "bg-card/90 text-foreground"
 )}>
 <MapPin className="h-3 w-3" />
 {distance.toFixed(1)}km away
 </div>
 )}
 </div>
 </div>

 <div className="p-5 flex-1 flex flex-col relative">
 <div className="flex justify-between items-start mb-2">
 <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
 {businessName}
 </h3>
 <div className="flex items-center gap-1 text-sm font-bold text-foreground ">
 <Star className="h-4 w-4 fill-secondary text-secondary" />
 {service.rating}
 </div>
 </div>

 <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-1">
 {name}
 </p>

 <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
 <MapPin className="h-3.5 w-3.5" />
 {location}
 </div>

 <div className="mt-auto pt-4 border-t border-border ">
 {/* Mobile Layout (Always Visible) */}
 <div className="flex lg:hidden flex-col gap-3">
  <div className="flex justify-between items-end">
   <div>
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Starting at</p>
    <p className="text-lg font-extrabold text-amber-600 ">₦{(service.price || 0).toLocaleString()}</p>
   </div>
  </div>
  {service.isVerified ? (
   <div className="w-full h-10 rounded-xl border border-primary text-primary flex items-center justify-center font-bold">
    Book Now
   </div>
  ) : (
   <div className="w-full h-10 rounded-xl border border-error/20 bg-error/5 text-error flex items-center justify-center font-bold text-xs uppercase tracking-wider">
    Booking Disabled
   </div>
  )}
 </div>

 {/* Desktop Layout (Hover Animation) */}
 <div className="hidden lg:block h-14 relative overflow-hidden">
  <div className="absolute top-4 left-0 w-full flex items-center justify-between group-hover:-translate-y-full group-hover:opacity-0 transition-all duration-300">
   <div>
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Starting at</p>
    <p className="text-lg font-extrabold text-amber-600 ">₦{(service.price || 0).toLocaleString()}</p>
   </div>
   <div className="text-sm font-bold text-primary flex items-center gap-1">
    View <ArrowRight className="h-4 w-4" />
   </div>
  </div>

  {service.isVerified ? (
   <div className="w-full h-10 rounded-xl border border-primary text-primary flex items-center justify-center font-bold transition-all absolute top-0 left-0 translate-y-full opacity-0 group-hover:translate-y-4 group-hover:opacity-100 duration-300">
    Book Now
   </div>
  ) : (
   <div className="w-full h-10 rounded-xl border border-error/20 bg-error/5 text-error flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-all absolute top-0 left-0 translate-y-full opacity-0 group-hover:translate-y-4 group-hover:opacity-100 duration-300">
    Booking Disabled
   </div>
  )}
 </div>
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 );
}
