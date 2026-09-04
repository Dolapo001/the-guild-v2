"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";

interface ProductCardProps {
 product: {
  uid: string;
  name: string;
  category: string;
  image?: string;
  imageUrl?: string;
  rating?: number;
  price: number;
  tag?: string;
  id?: string;
 };
 isMaestroMatch?: boolean;
 onAddToCart?: (product: any) => void;
}

export function ProductCard({ product, isMaestroMatch, onAddToCart }: ProductCardProps) {
 const { toggleFavorite, isFavorite } = useFavorites();
 const uid = product.uid || product.id || "";
 const favorited = isFavorite(uid);

 const handleFavorite = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const isNowFav = toggleFavorite(product, 'product');
  if (!favorited) {
   toast.success(`${product.name} added to favorites!`);
  }
 };

 const image = product.imageUrl || product.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop";

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -8 }}
 transition={{ duration: 0.3 }}
 >
 <Link href={(product as any).businessUid ? `/service/${(product as any).businessUid}` : `/marketplace/product/${uid}`} className="block h-full">
 <div className={cn(
 "h-full flex flex-col overflow-hidden rounded-2xl border border-white/7 bg-[#0f1117] shadow-e1 hover:shadow-e2 hover:border-white/12 transition-all group",
 isMaestroMatch && "ring-2 ring-secondary/50 shadow-xl shadow-secondary/10"
 )}>
 <div className="relative aspect-square w-full overflow-hidden bg-[#161922]">
 <Image src={image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
 <button onClick={handleFavorite} className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-[#0f1117]/90 border border-white/10 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group/heart">
 <motion.div animate={favorited ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
 <Heart className={cn("h-4 w-4 transition-colors", favorited ? "fill-red-500 text-red-500" : "text-slate-400 group-hover/heart:text-red-500")} />
 </motion.div>
 </button>
 <div className="absolute top-3 left-3 flex flex-wrap gap-2">
 <span className="bg-[#0f1117]/90 border border-white/10 text-[10px] font-extrabold text-indigo-400 px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm">{product.category}</span>
 {isMaestroMatch && (
 <div className="bg-secondary text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl animate-pulse">
 <Sparkles className="h-3 w-3 fill-primary" />
 <span><span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Match</span>
 </div>
 )}
 {product.tag && (
 <div className="bg-purple-500/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
 <ShoppingBag className="h-3 w-3" />{product.tag}
 </div>
 )}
 </div>
 </div>
 <div className="p-5 flex-1 flex flex-col relative">
 <div className="flex justify-between items-start mb-2">
 <h3 className="font-bold text-slate-100 leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">{product.name}</h3>
 <div className="flex items-center gap-1 text-accent shrink-0 ml-2">
 <Star className="h-3 w-3 fill-accent" />
 <span className="text-[10px] font-bold">{product.rating || 4.8}</span>
 </div>
 </div>
 <p className="text-xl font-extrabold text-amber-600 mt-auto">₦{(product.price || 0).toLocaleString()}</p>
 <div className="mt-4">
 {onAddToCart ? (
 <div className="h-10 relative overflow-hidden">
 <Button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); toast.success(`${product.name} added to cart!`); }} className="w-full h-10 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white font-bold transition-all shadow-none bg-transparent absolute top-0 left-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300">Add to Cart</Button>
 <div className="absolute top-0 left-0 w-full h-10 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:-translate-y-full group-hover:opacity-0 transition-all duration-300">View Details</div>
 </div>
 ) : (
 <div className="h-10 flex items-center justify-center text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View Details <ArrowRight className="ml-2 h-4 w-4" /></div>
 )}
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 );
}