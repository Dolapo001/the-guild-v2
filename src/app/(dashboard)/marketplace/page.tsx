"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_INVENTORY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    X,
    ArrowRight,
    ShoppingBag,
    Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

import { useCart } from "@/contexts/CartContext";

import { ProductCard } from "@/components/ui/product-card";

export default function MarketplacePage() {
    const router = useRouter();
    const { addItem, toggleCart, cartCount } = useCart();
    const [products] = useState(MOCK_INVENTORY.filter(p => p.status === "Active"));
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Marketplace</h1>
                    <p className="text-foreground/60 font-medium mt-1">Discover premium products from verified sellers.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-white/40 dark:bg-white/5 border-glass-border rounded-xl focus:ring-primary/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                    </div>
                    <Button
                        onClick={() => toggleCart(true)}
                        className="relative h-11 w-11 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 shrink-0"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                {cartCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product as any}
                        onAddToCart={addItem}
                        isMaestroMatch={product.id === 'p1' || product.id === 'p4'} // Mocking some matches
                    />
                ))}
            </div>
        </div>
    );
}
