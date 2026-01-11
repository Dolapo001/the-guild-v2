"use client";

import { useState, useRef } from "react";
import { MOCK_INVENTORY } from "@/lib/mock-data";
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
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function InventoryPage() {
    const [inventory, setInventory] = useState(MOCK_INVENTORY);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTagging, setIsTagging] = useState(false);
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                        <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-extrabold text-primary">Add New Product</DialogTitle>
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
                                                        <X className="h-3 w-3 opacity-40 hover:opacity-100 cursor-pointer" />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Product Name</label>
                                    <Input placeholder="e.g. Lavender Essential Oil" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Category</label>
                                        <Input placeholder="Beauty" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Price (₦)</label>
                                        <Input type="number" placeholder="5000" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest px-1">Initial Stock</label>
                                    <Input type="number" placeholder="20" className="h-12 rounded-xl bg-white/50 border-glass-border" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl border-glass-border font-bold text-primary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20" onClick={() => setIsAddModalOpen(false)}>Save Product</Button>
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-12 bg-white/40 border-glass-border rounded-xl focus:ring-primary/10"
                    />
                </div>
                <Button variant="outline" className="h-12 rounded-xl border-glass-border font-bold text-primary px-6">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <GlassCard className="overflow-hidden border-white/40">
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
                            {filteredInventory.map((item) => (
                                <tr key={item.id} className={`hover:bg-primary/[0.02] transition-colors group ${item.stock < 5 ? 'bg-red-500/[0.02]' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl overflow-hidden bg-primary/5 relative">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <span className="font-bold text-primary">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-foreground/60">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-extrabold text-primary">₦{item.price.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-extrabold ${item.stock < 5 ? 'text-red-500' : 'text-primary'}`}>
                                                {item.stock}
                                            </span>
                                            {item.stock < 5 && (
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${item.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-foreground/5 text-foreground/40"
                                            }`}>
                                            {item.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/5">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/5">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
