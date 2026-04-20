"use client";

import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Tag,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { marketplaceService } from "@/services/marketplace.service";
import { Product } from "@/types/api";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getInventory();
      setInventory(data);
    } catch (err) {
      console.warn("Failed to fetch inventory, using empty list", err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadedImage(url);
      setIsTagging(true);
      setAiTags([]);

      // Simulate AI Auto-Tagging
      setTimeout(() => {
        setAiTags(["Organic", "Premium", "Skincare", "Eco-Friendly"]);
        setIsTagging(false);
      }, 1500);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setAiTags(aiTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveProduct = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingProduct ? "Updating product..." : "Creating product...");
    try {
      const payload = {
        name: newProduct.name,
        category: newProduct.category || "General",
        price: Number(newProduct.price),
        stock_count: Number(newProduct.stock) || 0,
        image_url: uploadedImage || (editingProduct?.image_url) || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop",
        description: aiTags.length > 0 ? `Tags: ${aiTags.join(', ')}` : (editingProduct?.description || "Quality product.")
      };
      
      if (editingProduct) {
        await marketplaceService.updateProduct(editingProduct.uid, payload);
        toast.success("Product updated successfully!", { id: toastId });
      } else {
        await marketplaceService.createProduct(payload);
        toast.success("Product created successfully!", { id: toastId });
      }
      
      setIsAddModalOpen(false);
      resetForm();
      fetchInventory();
    } catch (err: any) {
      console.error("Failed to save product", err);
      toast.error(err?.message || "Failed to save product. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const toastId = toast.loading("Deleting product...");
    try {
      await marketplaceService.deleteProduct(uid);
      fetchInventory();
      toast.success("Product deleted successfully.", { id: toastId });
    } catch (err: any) {
      console.error("Failed to delete product", err);
      toast.error(err?.message || "Failed to delete product.", { id: toastId });
    }
  };

  const resetForm = () => {
    setNewProduct({ name: "", category: "", price: "", stock: "" });
    setUploadedImage(null);
    setAiTags([]);
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category || "",
      price: product.price.toString(),
      stock: product.stock_count.toString()
    });
    setUploadedImage(product.image_url || null);
    setIsAddModalOpen(true);
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Inventory & Marketplace</h1>
          <p className="text-foreground/50 font-medium">Manage your products and marketplace presence.</p>
        </motion.div>

        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setUploadedImage(null);
            setAiTags([]);
            setIsTagging(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
            <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold text-primary">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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

                {(isTagging || aiTags.length > 0) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1 flex items-center gap-1.5">
                        <Tag className="h-3 w-3" /> <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Tags
                      </label>
                      {aiTags.length > 0 && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Tagged
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isTagging ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="h-7 w-16 bg-primary/5 rounded-lg animate-pulse" />
                        ))
                      ) : (
                        aiTags.map(tag => (
                          <div key={tag} className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-primary/10">
                            {tag}
                            <X 
                              className="h-4 w-4 opacity-40 hover:opacity-100 cursor-pointer pointer-events-auto" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Product Name</label>
                  <Input 
                    placeholder="e.g. Lavender Essential Oil" 
                    className="h-12 rounded-xl bg-white/50 border-glass-border" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Category</label>
                    <Input 
                      placeholder="Beauty" 
                      className="h-12 rounded-xl bg-white/50 border-glass-border" 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Price (₦)</label>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      className="h-12 rounded-xl bg-white/50 border-glass-border" 
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Initial Stock</label>
                  <Input 
                    type="number" 
                    placeholder="20" 
                    className="h-12 rounded-xl bg-white/50 border-glass-border" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-glass-border font-bold text-primary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button 
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20" 
                  onClick={handleSaveProduct}
                  disabled={isSubmitting || !newProduct.name || !newProduct.price}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product"}
                </Button>
              </div>
            </GlassCard>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
          <Input
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-11 h-12 bg-white/40 border-glass-border rounded-xl focus:ring-primary/10"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl border-glass-border font-bold text-primary px-6">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <GlassCard className="overflow-hidden border-white/40 min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 border-b border-glass-border">
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-foreground/40 font-medium whitespace-nowrap">
                   <div className="flex flex-col items-center gap-3">
                     <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
                     <span>Loading inventory...</span>
                   </div>
                  </td>
                </tr>
              ) : paginatedInventory.length > 0 ? (
                paginatedInventory.map((item: Product) => (
                  <tr key={item.uid} className={`hover:bg-primary/[0.02] transition-colors group ${item.stock_count < 5 ? 'bg-red-500/[0.02]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-primary/5 relative">
                          <Image src={item.image_url || "/placeholder-product.png"} alt={item.name} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-primary">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-foreground/60">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-primary">₦{Number(item.price).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-extrabold ${item.stock_count < 5 ? 'text-red-500' : 'text-primary'}`}>
                          {item.stock_count}
                        </span>
                        {item.stock_count < 5 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${item.stock_count > 0 ? "bg-green-500/10 text-green-600" : "bg-foreground/5 text-foreground/40"}`}>
                        {item.stock_count > 0 ? "Active" : "Out of Stock"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/5"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/5"
                          onClick={() => handleDeleteProduct(item.uid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-foreground/40 font-medium">No products found. Start by adding one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-glass-border flex items-center justify-between bg-primary/5">
            <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">
              Page {currentPage} of {totalPages} — {filteredInventory.length} Total items
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-glass-border font-bold text-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-glass-border font-bold text-primary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
