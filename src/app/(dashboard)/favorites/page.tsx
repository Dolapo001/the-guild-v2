"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Heart,
    Search,
    Star,
    MapPin,
    ArrowRight,
    ShoppingBag,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

import { useFavorites } from "@/contexts/FavoritesContext";
import { ServiceCard } from "@/components/ui/service-card";
import { ProductCard } from "@/components/ui/product-card";

export default function FavoritesPage() {
    const router = useRouter();
    const { favorites } = useFavorites();
    const [activeTab, setActiveTab] = useState<'businesses' | 'products'>('businesses');
    const [searchTerm, setSearchTerm] = useState("");

    const favoriteBusinesses = favorites.filter(f => f.type === 'service');
    const favoriteProducts = favorites.filter(f => f.type === 'product');

    const filteredBusinesses = favoriteBusinesses.filter(f =>
        f.data.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProducts = favoriteProducts.filter(f =>
        f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        Your Favorites <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    </h1>
                    <p className="text-foreground/50 font-medium text-lg">Saved items and businesses you love.</p>
                </div>

                <div className="flex p-1 bg-white/40 dark:bg-white/5 rounded-xl border border-glass-border backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('businesses')}
                        className={cn(
                            "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === 'businesses'
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-foreground/60 hover:text-primary hover:bg-white/40 dark:hover:bg-white/5"
                        )}
                    >
                        <Briefcase className="h-4 w-4" /> Saved Businesses
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={cn(
                            "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === 'products'
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-foreground/60 hover:text-primary hover:bg-white/40 dark:hover:bg-white/5"
                        )}
                    >
                        <ShoppingBag className="h-4 w-4" /> Saved Products
                    </button>
                </div>
            </motion.div>

            {/* Search Filter */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <Input
                    placeholder={`Search your favorite ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 rounded-xl bg-white/40 dark:bg-white/5 border-glass-border"
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {activeTab === 'businesses' ? (
                    filteredBusinesses.length > 0 ? (
                        filteredBusinesses.map((fav) => (
                            <ServiceCard key={fav.id} service={fav.data} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-10 w-10 text-primary/20" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No saved businesses</h3>
                            <p className="text-foreground/40 mt-2">Start exploring and save businesses you love!</p>
                            <Button className="mt-6 rounded-xl font-bold" asChild>
                                <Link href="/search">Explore Services</Link>
                            </Button>
                        </div>
                    )
                ) : (
                    filteredProducts.length > 0 ? (
                        filteredProducts.map((fav) => (
                            <ProductCard key={fav.id} product={fav.data} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="h-10 w-10 text-primary/20" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No saved products</h3>
                            <p className="text-foreground/40 mt-2">Your wishlist is empty. Browse the marketplace!</p>
                            <Button className="mt-6 rounded-xl font-bold" asChild>
                                <Link href="/marketplace">Go to Marketplace</Link>
                            </Button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
