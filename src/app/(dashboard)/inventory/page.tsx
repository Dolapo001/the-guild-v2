"use client";

import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, Filter, Package, AlertTriangle, Edit2, Trash2, Image as ImageIcon,
  Sparkles, Tag, X, Loader2, ChevronLeft, ChevronRight, Package2, ListOrdered, CheckCircle2,
  Clock, MapPin, Truck, RefreshCw, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { marketplaceService, ServicePackage } from "@/services/marketplace.service";
import { maestroService } from "@/services/maestro.service";
import { Product } from "@/types/api";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"products" | "packages" | "orders">("products");
  
  // Data States
  const [inventory, setInventory] = useState<Product[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [ceoServices, setCeoServices] = useState<any[]>([]);
  
  // Search / Loading States
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // Form States - Product
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isTagging, setIsTagging] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", price: "", stock: "", description: "", city: "Lagos"
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States - Service Package
  const [newPackage, setNewPackage] = useState({
    name: "", description: "", price: "", city: "Lagos"
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]); // list of uids

  // Pagination State (Products)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Parallel fetches for inventory, packages, incoming orders, and CEO services
      const [invData, pkgData, orderData, servicesData] = await Promise.all([
        marketplaceService.getInventory(),
        marketplaceService.getPackages(),
        marketplaceService.getProviderOrders(),
        maestroService.getMyServices()
      ]);
      setInventory(invData);
      setPackages(pkgData);
      setIncomingOrders(orderData);
      setCeoServices(servicesData);
    } catch (err) {
      console.error("Failed to load inventory dashboard datasets:", err);
      toast.error("Error synchronizing profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // AI Product Auto-Tagging simulation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadedImage(url);
      setIsTagging(true);
      setAiTags([]);

      setTimeout(() => {
        setAiTags(["Organic", "Premium", "Vendor Sourced", "Eco-Friendly"]);
        setIsTagging(false);
      }, 1200);
    }
  };

  // Save / Update Products
  const handleSaveProduct = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingProduct ? "Updating product..." : "Listing new product...");
    try {
      const payload = {
        name: newProduct.name,
        category: newProduct.category || "General",
        price: Number(newProduct.price),
        stockCount: Number(newProduct.stock) || 0,
        imageUrl: uploadedImage || (editingProduct?.imageUrl) || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop",
        description: newProduct.description || (aiTags.length > 0 ? `Tags: ${aiTags.join(', ')}` : "Quality product."),
        city: newProduct.city || "Lagos"
      };

      if (editingProduct) {
        await marketplaceService.updateProduct(editingProduct.uid, payload);
        toast.success("Product updated successfully!", { id: toastId });
      } else {
        await marketplaceService.createProduct(payload);
        toast.success("Product created successfully on the marketplace!", { id: toastId });
      }

      setIsAddModalOpen(false);
      resetProductForm();
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Could not save product.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this product from the marketplace?")) return;
    try {
      await marketplaceService.deleteProduct(uid);
      toast.success("Product removed successfully.");
      loadAllData();
    } catch (err) {
      toast.error("Could not delete product.");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category || "General",
      price: product.price.toString(),
      stock: product.stockCount.toString(),
      description: product.description || "",
      city: (product as any).city || "Lagos"
    });
    setUploadedImage(product.imageUrl || null);
    setIsAddModalOpen(true);
  };

  const resetProductForm = () => {
    setNewProduct({ name: "", category: "", price: "", stock: "", description: "", city: "Lagos" });
    setUploadedImage(null);
    setAiTags([]);
    setEditingProduct(null);
  };

  // Save / Bundle Service Packages
  const handleSavePackage = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service to include in this bundle.");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Bundling service package...");
    try {
      const payload = {
        name: newPackage.name,
        description: newPackage.description,
        price: Number(newPackage.price),
        city: newPackage.city,
        included_services_uids: selectedServices
      };

      await marketplaceService.createPackage(payload);
      toast.success("Service Package bundled successfully!", { id: toastId });
      
      setIsPackageModalOpen(false);
      resetPackageForm();
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save package.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPackageForm = () => {
    setNewPackage({ name: "", description: "", price: "", city: "Lagos" });
    setSelectedServices([]);
  };

  // Update Customer Order Status
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await marketplaceService.updateOrderStatus(orderId, nextStatus);
      toast.success(`Order transitioned to ${nextStatus} successfully!`);
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update order status.");
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">CEO Hub & Marketplace</h1>
          <p className="text-foreground/60 font-medium">Add products, configure discounted packages, and track customer fulfillments.</p>
        </div>

        {/* Action button conditional on subtab */}
        <div className="flex items-center gap-3">
          {activeTab === "products" && (
            <Button
              onClick={() => {
                resetProductForm();
                setIsAddModalOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}

          {activeTab === "packages" && (
            <Button
              onClick={() => {
                resetPackageForm();
                setIsPackageModalOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Service Package
            </Button>
          )}
        </div>
      </div>

      {/* Selector Navigation */}
      <div className="flex border-b border-gray-200 pb-1 gap-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "products" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Physical Products
        </button>

        <button
          onClick={() => setActiveTab("packages")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "packages" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          Bundled Service Packages
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all relative ${
            activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"
          }`}
        >
          <ListOrdered className="h-4 w-4" />
          Marketplace Orders
          {incomingOrders.filter(o => o.status === 'PENDING').length > 0 && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Panel views */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
              <Input
                placeholder="Search inventory keywords..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-11 h-12 bg-white border-glass-border rounded-xl focus:ring-primary/10 text-sm font-bold"
              />
            </div>
          </div>

          <GlassCard className="overflow-hidden border-white/40 min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary/5 border-b border-glass-border">
                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Stock Count</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">City Target</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border text-sm font-bold text-gray-900">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-foreground/30 font-medium">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/30" />
                        Loading products dataset...
                      </td>
                    </tr>
                  ) : paginatedInventory.length > 0 ? (
                    paginatedInventory.map((item: Product) => (
                      <tr key={item.uid} className="hover:bg-primary/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-lg overflow-hidden bg-gray-50 relative shrink-0 border border-gray-100">
                              <Image src={item.imageUrl || "/placeholder-product.png"} alt={item.name} fill className="object-cover" />
                            </div>
                            <span className="font-extrabold text-primary">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground/60">{item.category}</td>
                        <td className="px-6 py-4 text-primary">₦{(Number(item.price) || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={item.stockCount < 5 ? "text-red-500 font-black" : "text-green-600"}>
                            {item.stockCount} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-blue-600">{(item as any).city}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-gray-100 rounded-lg" onClick={() => openEditModal(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleDeleteProduct(item.uid)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-foreground/40">No physical products found in inventory.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-6 border-t border-glass-border flex items-center justify-between">
                <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {activeTab === "packages" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/30" />
              Loading service bundles...
            </div>
          ) : packages.length > 0 ? (
            packages.map((pkg) => (
              <GlassCard key={pkg.uid} className="p-6 flex flex-col justify-between border-white/40 shadow-sm space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500/10 text-amber-600 text-[9px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      Service Package
                    </span>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase">City: {pkg.city}</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 leading-snug">{pkg.name}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3">{pkg.description}</p>
                </div>

                {pkg.servicesDetails && pkg.servicesDetails.length > 0 && (
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Included Services</p>
                    <ul className="space-y-1">
                      {pkg.servicesDetails.map((s: any, idx) => (
                        <li key={idx} className="text-[10px] font-bold text-foreground/70 flex items-center gap-1.5">
                          <span className="h-1 w-1 bg-primary rounded-full" />
                          {s.name} (₦{Number(s.price).toLocaleString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-foreground/40 uppercase block">Bundle Price</span>
                    <span className="text-lg font-black text-amber-600">₦{Number(pkg.price).toLocaleString()}</span>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-foreground/40 font-bold border border-dashed border-glass-border rounded-2xl bg-white/40">
              No service packages built yet. Click &quot;Create Service Package&quot; to bundle your menu offerings!
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/30" />
              Loading customer marketplace orders...
            </div>
          ) : incomingOrders.length > 0 ? (
            incomingOrders.map((order) => (
              <GlassCard key={order.uid} className="p-6 border-white/40 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">ID: {order.uid.substring(0, 8)}</span>
                    <span className="text-xs font-bold text-foreground/40">Customer: {order.customerName || "Guest Client"}</span>
                    <span className="h-1.5 w-1.5 bg-gray-300 rounded-full" />
                    <span className="text-xs font-bold text-foreground/40">City: {order.city}</span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5">
                    <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Ordered Items</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: any, idx: number) => {
                        const name = item.productDetails?.name || item.packageDetails?.name || "Service Package";
                        return (
                          <span key={idx} className="bg-gray-100 text-[10px] font-bold text-gray-700 px-2 py-1 rounded-lg">
                            {name} (x{item.quantity})
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-foreground/60 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                    <span>Deliver to: {order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Tracking, Status & Actions */}
                <div className="flex flex-col md:items-end gap-3 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-foreground/40 uppercase block">Grand Total Sourced</span>
                    <span className="text-lg font-black text-primary">₦{Number(order.totalPrice).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      order.status === 'DELIVERED' ? "bg-green-100 text-green-700" :
                      order.status === 'CANCELLED' ? "bg-red-100 text-red-600" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      Status: {order.status}
                    </span>

                    {/* Step Transitions */}
                    {order.status === 'PENDING' && (
                      <Button onClick={() => handleUpdateOrderStatus(order.uid, 'PAID')} className="h-9 px-4 rounded-xl text-xs font-bold bg-primary text-white">
                        Confirm & Secure Escrow
                      </Button>
                    )}
                    {order.status === 'PAID' && (
                      <Button onClick={() => handleUpdateOrderStatus(order.uid, 'PROCESSING')} className="h-9 px-4 rounded-xl text-xs font-bold bg-primary text-white">
                        Mark Sourced & Processing
                      </Button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <Button onClick={() => handleUpdateOrderStatus(order.uid, 'SHIPPED')} className="h-9 px-4 rounded-xl text-xs font-bold bg-primary text-white">
                        Dispatch / Ship
                      </Button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <Button onClick={() => handleUpdateOrderStatus(order.uid, 'DELIVERED')} className="h-9 px-4 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700">
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="py-20 text-center text-foreground/40 font-bold border border-dashed border-glass-border rounded-2xl bg-white/40">
              No marketplace orders received from clients yet.
            </div>
          )}
        </div>
      )}

      {/* dialogs */}
      {/* 1. Add/Edit Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
              <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6 bg-white/95 backdrop-blur-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto scrollbar-thin">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold text-primary">
                    {editingProduct ? "Modify Product Listing" : "Add Marketplace Product"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-xs font-bold">
                  {/* Upload Block */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-2xl bg-primary/5 border-2 border-dashed border-glass-border flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors group relative overflow-hidden"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                    {uploadedImage ? (
                      <Image src={uploadedImage} alt="Preview" fill className="object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-primary/20 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest mt-2">Upload Product Image</p>
                      </>
                    )}
                  </div>

                  {/* AI Tags block */}
                  {(isTagging || aiTags.length > 0) && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="h-3 w-3" /> Auto-Generated Tags
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {isTagging ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          aiTags.map(tag => (
                            <div key={tag} className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              {tag}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Product Name</label>
                    <Input
                      placeholder="e.g. Lavender Face Soap"
                      className="h-11 rounded-xl text-sm"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Category</label>
                      <Input
                        placeholder="e.g. Skincare"
                        className="h-11 rounded-xl text-sm"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Price (₦)</label>
                      <Input
                        type="number"
                        placeholder="5000"
                        className="h-11 rounded-xl text-sm"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Inventory Stock</label>
                      <Input
                        type="number"
                        placeholder="30"
                        className="h-11 rounded-xl text-sm"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Active City Sourced</label>
                      <select
                        value={newProduct.city}
                        onChange={(e) => setNewProduct({ ...newProduct, city: e.target.value })}
                        className="w-full h-11 px-3 border border-glass-border bg-white rounded-xl text-sm outline-none"
                      >
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Port Harcourt">Port Harcourt</option>
                        <option value="Ibadan">Ibadan</option>
                        <option value="Kano">Kano</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Product Description</label>
                    <Textarea
                      placeholder="Enter detailed description of your product..."
                      className="min-h-[80px] rounded-xl text-sm"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button
                    className="flex-1 h-11 bg-primary text-white rounded-xl font-bold"
                    onClick={handleSaveProduct}
                    disabled={isSubmitting || !newProduct.name || !newProduct.price}
                  >
                    Save Product
                  </Button>
                </div>
              </GlassCard>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* 2. Create Service Package Modal */}
      <AnimatePresence>
        {isPackageModalOpen && (
          <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
              <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6 bg-white/95 backdrop-blur-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto scrollbar-thin">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold text-primary">Bundle Service Package</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-xs font-bold">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Package Name</label>
                    <Input
                      placeholder="e.g. Bridal Glam Gold Bundle"
                      className="h-11 rounded-xl text-sm"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Package Description</label>
                    <Textarea
                      placeholder="e.g. Full hair styling, complete bridal facial makeup, and gel nail polish at a discounted price."
                      className="min-h-[80px] rounded-xl text-sm"
                      value={newPackage.description}
                      onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Bundle Price (₦)</label>
                      <Input
                        type="number"
                        placeholder="35000"
                        className="h-11 rounded-xl text-sm"
                        value={newPackage.price}
                        onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Fulfillment City</label>
                      <select
                        value={newPackage.city}
                        onChange={(e) => setNewPackage({ ...newPackage, city: e.target.value })}
                        className="w-full h-11 px-3 border border-glass-border bg-white rounded-xl text-sm outline-none"
                      >
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Port Harcourt">Port Harcourt</option>
                        <option value="Ibadan">Ibadan</option>
                        <option value="Kano">Kano</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-Select Menu List checkboxes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider block">
                      Select Included Services Menu
                    </label>
                    <div className="max-h-[150px] overflow-y-auto border border-glass-border rounded-2xl p-4 space-y-2 bg-gray-50/50">
                      {ceoServices.length > 0 ? (
                        ceoServices.map((service) => {
                          const checked = selectedServices.includes(service.uid);
                          return (
                            <label key={service.uid} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    setSelectedServices(selectedServices.filter(uid => uid !== service.uid));
                                  } else {
                                    setSelectedServices([...selectedServices, service.uid]);
                                  }
                                }}
                                className="h-4.5 w-4.5 border-glass-border text-primary rounded focus:ring-primary"
                              />
                              <span className="text-xs font-bold text-gray-700">
                                {service.name} (₦{Number(service.price).toLocaleString()})
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-foreground/40">You have not registered any services under your business profile yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setIsPackageModalOpen(false)}>Cancel</Button>
                  <Button
                    className="flex-1 h-11 bg-primary text-white rounded-xl font-bold"
                    onClick={handleSavePackage}
                    disabled={isSubmitting || !newPackage.name || !newPackage.price}
                  >
                    Bundle Package
                  </Button>
                </div>
              </GlassCard>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
