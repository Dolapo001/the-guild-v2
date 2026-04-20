"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOCK_INVENTORY, Product } from "@/lib/mock-data";
import { marketplaceService } from "@/services/marketplace.service";
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
  Star,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ui/product-card";

export default function MarketplacePage() {
  const router = useRouter();
  const { addItem, toggleCart, cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const results = await marketplaceService.getProducts();
      setProducts(results.map(p => ({ ...p, id: p.uid })));
    } catch (err) {
      console.error("API marketplace failed:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-foreground/60 font-medium mt-1">Discover premium products from verified sellers.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white/40 border-glass-border rounded-xl focus:ring-primary/10 text-gray-900 placeholder:text-gray-500 "
            />
          </div>
          <Button
            onClick={() => toggleCart(true)}
            className="relative h-11 w-11 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 shrink-0"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white ">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-white/40 animate-pulse border border-glass-border" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product as any}
              onAddToCart={addItem}
              isMaestroMatch={product.id === 'p1' || product.id === 'p4'}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <AlertCircle className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/50 font-medium">No products found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
