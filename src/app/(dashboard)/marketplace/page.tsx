"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { marketplaceService, ServicePackage } from "@/services/marketplace.service";
import { Product } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ShoppingCart, Plus, Minus, X, ArrowRight, ShoppingBag,
  Star, AlertCircle, MapPin, SlidersHorizontal, Package2, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const AVAILABLE_CITIES = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu"
];

const CATEGORIES = [
  "All", "Haircare", "Cosmetics", "Skincare", "Accessories", "Fragrances", "Bundles"
];

export default function MarketplacePage() {
  const { addItem, toggleCart, cartCount, cartCity } = useCart();
  const [activeTab, setActiveTab] = useState<"products" | "packages">("products");
  
  // Filtering States
  const [selectedCity, setSelectedCity] = useState("Lagos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal / Detail State
  const [selectedItem, setSelectedItem] = useState<{
    type: "product" | "package";
    data: any;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const cityFilter = selectedCity;
      const [prodRes, packRes] = await Promise.all([
        marketplaceService.getProducts({ city: cityFilter }),
        marketplaceService.getPackages({ city: cityFilter })
      ]);
      setProducts(prodRes);
      setPackages(packRes);
    } catch (err) {
      console.error("Failed to load marketplace listings:", err);
      toast.error("Could not load current city items. Showing local inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  // Client Filter Logic
  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const priceNum = Number(p.price);
      const matchesMin = minPrice === "" || priceNum >= Number(minPrice);
      const matchesMax = maxPrice === "" || priceNum <= Number(maxPrice);
      return matchesSearch && matchesCat && matchesMin && matchesMax;
    });
  };

  const getFilteredPackages = () => {
    return packages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "All" || selectedCategory === "Bundles";
      const priceNum = Number(p.price);
      const matchesMin = minPrice === "" || priceNum >= Number(minPrice);
      const matchesMax = maxPrice === "" || priceNum <= Number(maxPrice);
      return matchesSearch && matchesCat && matchesMin && matchesMax;
    });
  };

  const handleAddToCart = async (item: any, isPkg = false) => {
    if (cartCity && cartCity.toLowerCase() !== selectedCity.toLowerCase()) {
      toast.error(`Cannot mix items! Your cart has items from ${cartCity}. Please clear it first.`);
      return;
    }
    
    try {
      await addItem({ uid: item.uid, isPackage: isPkg, ...item });
      toast.success(`${item.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  const filteredProds = getFilteredProducts();
  const filteredPkgs = getFilteredPackages();

  return (
    <div className="space-y-8 pb-12">
      {/* City Gating Announcement & Selector */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-transparent border border-blue-500/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 leading-tight">Location-Aware Marketplace (City Gating)</h4>
            <p className="text-xs text-foreground/60 font-medium">Showing items available for delivery in your selected city.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active City:</span>
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedItem(null);
            }}
            className="h-10 px-4 rounded-xl border border-glass-border bg-white text-sm font-bold text-primary shadow-sm focus:ring-primary/10 focus:border-primary outline-none"
          >
            {AVAILABLE_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Header / Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-foreground/60 font-medium mt-1">Discover premium physical products and discounted service packages in {selectedCity}.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "products" ? "bg-white text-primary shadow-sm" : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "packages" ? "bg-white text-primary shadow-sm" : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <Package2 className="h-3.5 w-3.5" />
              Service Packages
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 rounded-xl border-glass-border gap-2 text-xs font-bold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <Button
            onClick={() => toggleCart(true)}
            className="relative h-11 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform rounded-xl px-5 gap-2 text-xs font-bold"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <span className="bg-accent text-white text-[10px] font-extrabold h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-primary">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filter Drawer/Row */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white border border-glass-border rounded-2xl grid md:grid-cols-4 gap-4 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
                  <Input
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-glass-border bg-white text-xs font-bold"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Min Price (₦)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-10 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Max Price (₦)</label>
                <Input
                  type="number"
                  placeholder="No Limit"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-10 text-xs rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-white/40 animate-pulse border border-glass-border" />
          ))}
        </div>
      ) : activeTab === "products" ? (
        /* Products Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProds.map((product) => {
            const hasStock = product.stock_count > 0;
            return (
              <motion.div
                key={product.uid}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-glass-border shadow-glass-sm flex flex-col overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image_url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[9px] font-extrabold text-primary px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                    {product.category}
                  </span>
                  {!hasStock && (
                    <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-black text-white uppercase tracking-wider">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 leading-snug line-clamp-2">{product.name}</h3>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase mt-1">Provider: {(product as any).business_name || "CEO"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-bold text-foreground/40 uppercase">Price</p>
                      <p className="text-lg font-black text-primary">₦{(Number(product.price) || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-foreground/40 uppercase">Stock</p>
                      <p className={`text-xs font-bold ${hasStock ? "text-green-600" : "text-red-500"}`}>
                        {hasStock ? `${product.stock_count} units` : "Out of stock"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItem({ type: "product", data: product })}
                      className="h-10 rounded-xl gap-1 text-xs font-bold"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                    <Button
                      disabled={!hasStock}
                      onClick={() => handleAddToCart(product, false)}
                      className="h-10 rounded-xl text-xs font-bold bg-primary text-white"
                    >
                      Add To Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredProds.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <AlertCircle className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/50 font-bold">No products available in {selectedCity} matching selection.</p>
            </div>
          )}
        </div>
      ) : (
        /* Packages Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPkgs.map((pkg) => (
            <motion.div
              key={pkg.uid}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-glass-border shadow-glass-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-all group p-6 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Service Bundle
                  </span>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">City: {pkg.city}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 leading-snug">{pkg.name}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3">{pkg.description || "No description loaded."}</p>
              </div>

              {pkg.services_details && pkg.services_details.length > 0 && (
                <div className="space-y-1.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Included Services</p>
                  <ul className="space-y-1">
                    {pkg.services_details.map((service: any, idx) => (
                      <li key={idx} className="text-[10px] font-bold text-foreground/70 flex items-center gap-1.5">
                        <span className="h-1 w-1 bg-primary rounded-full" />
                        {service.name} (₦{Number(service.price).toLocaleString()})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-foreground/40 uppercase">Package Price</p>
                  <p className="text-xl font-black text-amber-600">₦{(Number(pkg.price) || 0).toLocaleString()}</p>
                </div>
                <Button
                  onClick={() => handleAddToCart(pkg, true)}
                  className="h-10 rounded-xl px-5 text-xs font-bold bg-primary text-white"
                >
                  Add Package to Cart
                </Button>
              </div>
            </motion.div>
          ))}

          {filteredPkgs.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <AlertCircle className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/50 font-bold">No service packages available in {selectedCity}.</p>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Dialog / Draw */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-3xl border border-glass-border shadow-2xl p-6 z-[110] overflow-hidden flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-primary/10 text-primary">
                    {selectedItem.data.category || "Package"}
                  </span>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Available in {selectedItem.data.city}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)} className="h-8 w-8 rounded-full hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedItem.type === "product" && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={selectedItem.data.image_url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop"}
                    alt={selectedItem.data.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedItem.data.name}</h2>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  {selectedItem.data.description || "No full description added by provider."}
                </p>
              </div>

              {selectedItem.type === "product" && (
                <div className="grid grid-cols-2 gap-4 py-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs font-bold">
                  <div>
                    <span className="text-foreground/40 block uppercase text-[9px]">Inventory Status</span>
                    <span className={selectedItem.data.stock_count > 0 ? "text-green-600" : "text-red-500"}>
                      {selectedItem.data.stock_count > 0 ? `${selectedItem.data.stock_count} Units Available` : "Sold Out"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground/40 block uppercase text-[9px]">Provider Business</span>
                    <span className="text-primary">{selectedItem.data.business_name || "CEO Operator"}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Direct Price</span>
                  <p className="text-2xl font-black text-amber-600">₦{Number(selectedItem.data.price).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedItem(null)} className="rounded-xl font-bold h-11 text-xs">
                    Cancel
                  </Button>
                  <Button
                    disabled={selectedItem.type === "product" && selectedItem.data.stock_count <= 0}
                    onClick={() => {
                      handleAddToCart(selectedItem.data, selectedItem.type === "package");
                      setSelectedItem(null);
                    }}
                    className="rounded-xl px-6 bg-primary text-white font-bold h-11 text-xs"
                  >
                    Add To Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
