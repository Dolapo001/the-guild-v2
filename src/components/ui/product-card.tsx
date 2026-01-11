"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        category: string;
        image: string;
        rating?: number;
        price: number;
        tag?: string;
    };
    isMaestroMatch?: boolean;
    onAddToCart?: (product: any) => void;
}

export function ProductCard({ product, isMaestroMatch, onAddToCart }: ProductCardProps) {
    const { toggleFavorite, isFavorite } = useFavorites();
    const favorited = isFavorite(product.id);

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product, 'product');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/marketplace/product/${product.id}`} className="block h-full">
                <div className={cn(
                    "h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b]/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all group",
                    isMaestroMatch && "ring-2 ring-secondary/50 shadow-xl shadow-secondary/10"
                )}>
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-white/5">
                        <Image
                            src={product.image}
                            alt={product.name}
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
                                        "h-4 w-4 transition-colors",
                                        favorited ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/heart:text-red-500"
                                    )}
                                />
                            </motion.div>
                        </button>

                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-extrabold text-primary dark:text-white px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                                {product.category}
                            </span>
                            {isMaestroMatch && (
                                <div className="bg-secondary text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl animate-pulse">
                                    <Sparkles className="h-3 w-3 fill-primary" />
                                    <span>
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Match
                                    </span>
                                </div>
                            )}
                            {product.tag && (
                                <div className="bg-purple-500/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                                    <ShoppingBag className="h-3 w-3" />
                                    {product.tag}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                            <div className="flex items-center gap-1 text-accent shrink-0 ml-2">
                                <Star className="h-3 w-3 fill-accent" />
                                <span className="text-[10px] font-bold">{product.rating || 4.8}</span>
                            </div>
                        </div>
                        <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-auto">₦{product.price.toLocaleString()}</p>

                        <div className="mt-4">
                            {onAddToCart ? (
                                <div className="h-10 relative overflow-hidden">
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onAddToCart(product);
                                        }}
                                        className="w-full h-10 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white font-bold transition-all shadow-none bg-transparent absolute top-0 left-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300"
                                    >
                                        Add to Cart
                                    </Button>
                                    <div className="absolute top-0 left-0 w-full h-10 flex items-center justify-center text-sm font-bold text-gray-400 dark:text-gray-500 group-hover:-translate-y-full group-hover:opacity-0 transition-all duration-300">
                                        View Details
                                    </div>
                                </div>
                            ) : (
                                <div className="h-10 flex items-center justify-center text-sm font-bold text-primary hover:text-accent transition-colors">
                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
