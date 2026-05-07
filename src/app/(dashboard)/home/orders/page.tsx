"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 ShoppingBag,
 Clock,
 Truck,
 CheckCircle2,
 Search,
 Filter,
 MoreVertical,
 MapPin,
 Phone,
 Package,
 Bike,
 ChevronRight,
 X,
 AlertCircle,
 Loader2,
 Check,
 ChevronLeft
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { marketplaceService } from "@/services/marketplace.service";
import { toast } from "sonner";

// --- Configuration & Mapping ---

const DB_STATUS_MAP: Record<string, string> = {
 'AWAITING_QUOTE': 'new',
 'AWAITING_PAYMENT': 'processing',
 'PROCESSING': 'processing',
 'OUT_FOR_DELIVERY': 'out_for_delivery',
 'DELIVERED': 'completed',
 'COMPLETED': 'completed',
 'CANCELLED': 'cancelled'
};

const statusConfigs: Record<string, { label: string; className: string; icon: any }> = {
 new: { label: "New", className: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertCircle },
 processing: { label: "Processing", className: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
 out_for_delivery: { label: "Out for Delivery", className: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Truck },
 completed: { label: "Completed", className: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
};

// --- Sub-components ---

const StatusBadge = ({ status }: { status: string }) => {
 const config = statusConfigs[status] || statusConfigs.new;
 const Icon = config.icon;

 return (
  <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", config.className)}>
   {status === 'new' && (
    <span className="relative flex h-2 w-2 mr-1">
     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
     <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
    </span>
   )}
   <Icon className="h-3 w-3" />
   {config.label}
  </div>
 );
};

export default function VendorOrdersPage() {
 const [activeTab, setActiveTab] = useState("new");
 const [orders, setOrders] = useState<any[]>([]);
 const [logisticsCompanies, setLogisticsCompanies] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedOrder, setSelectedOrder] = useState<any>(null);
 const [modalType, setModalType] = useState<"price" | "dispatch" | null>(null);

 // Pagination State
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Form States
 const [deliveryFee, setDeliveryFee] = useState("");
 const [payOnDelivery, setPayOnDelivery] = useState(true);
 const [riderName, setRiderName] = useState("");
 const [riderPhone, setRiderPhone] = useState("");
 const [riderCompany, setRiderCompany] = useState("Gokada");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [showBikeAnimation, setShowBikeAnimation] = useState(false);

 const fetchOrders = async () => {
  setLoading(true);
  try {
   const [ordersData, logisticsData] = await Promise.all([
    marketplaceService.getBusinessOrders(),
    marketplaceService.getLogisticsCompanies()
   ]);
   setLogisticsCompanies(logisticsData);
   const mappedOrders = ordersData.map((o: any) => ({
    ...o,
    displayId: o.uid.substring(0, 8).toUpperCase(),
    date: new Date(o.created_at).toLocaleDateString() + ", " + new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    uiStatus: DB_STATUS_MAP[o.status] || 'new',
    customerName: o.customer?.full_name || "Nexus User",
    itemsSummary: o.items.map((i: any) => i.product_name).join(", "),
    totalPrice: parseFloat(o.total_items_price) + parseFloat(o.delivery_fee || 0),
    itemsCount: o.items.length
   }));
   setOrders(mappedOrders);
  } catch (err) {
   console.error("Failed to fetch business orders", err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchOrders();
 }, []);

 // Search & Filter Logic
 const filteredOrders = orders.filter(o => {
  const matchesTab = o.uiStatus === activeTab;
  const matchesSearch = 
   o.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
   o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   o.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesTab && matchesSearch;
 });

 // Pagination Logic
 const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
 const paginatedOrders = filteredOrders.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
 );

 const handleOpenModal = (order: any, type: "price" | "dispatch") => {
  setSelectedOrder(order);
  setModalType(type);
  if (type === "price") {
   setDeliveryFee("");
  } else {
   setRiderName("");
   setRiderPhone("");
   setRiderCompany("Gokada");
  }
 };

 const handleConfirmFee = async () => {
  setIsSubmitting(true);
  try {
   await marketplaceService.setDeliveryFee(selectedOrder.uid, Number(deliveryFee));
   setModalType(null);
   setSelectedOrder(null);
   fetchOrders();
   setActiveTab("processing");
   setCurrentPage(1);
  } catch (err) {
   console.error("Failed to set delivery fee", err);
   toast.error("Failed to set fee. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleDispatch = async () => {
  setIsSubmitting(true);
  setShowBikeAnimation(true);
  try {
   await marketplaceService.dispatchOrder(selectedOrder.uid, {
    rider_name: riderName,
    rider_phone: riderPhone,
    logistics_company: riderCompany
   });
   toast.success("Order dispatched successfully.");
   setTimeout(() => {
    setModalType(null);
    setSelectedOrder(null);
    fetchOrders();
    setActiveTab("out_for_delivery");
    setShowBikeAnimation(false);
    setCurrentPage(1);
   }, 1500);
  } catch (err) {
   console.error("Failed to dispatch order", err);
   toast.error("Failed to dispatch. Please try again.");
   setIsSubmitting(false);
   setShowBikeAnimation(false);
  }
 };

 return (
  <div className="space-y-8">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div>
     <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Order Management</h1>
     <p className="text-foreground/50 font-medium mt-1">Process customer orders and manage logistics.</p>
    </div>
    <div className="flex items-center gap-3">
     <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
      <Input 
       placeholder="Search orders..." 
       value={searchTerm}
       onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
       }}
       className="pl-10 h-11 w-64 bg-white/40 border-glass-border rounded-xl" 
      />
     </div>
     <Button variant="outline" className="h-11 rounded-xl border-glass-border">
      <Filter className="h-4 w-4 mr-2" /> Filter
     </Button>
    </div>
   </div>

   {/* Tabs */}
   <div className="flex p-1 bg-muted/50 rounded-2xl w-fit border border-glass-border">
    {[
     { id: "new", label: "New Orders", icon: AlertCircle, count: orders.filter(o => o.uiStatus === 'new').length },
     { id: "processing", label: "Processing", icon: Clock, count: orders.filter(o => o.uiStatus === 'processing').length },
     { id: "out_for_delivery", label: "Out for Delivery", icon: Truck, count: orders.filter(o => o.uiStatus === 'out_for_delivery').length },
     { id: "completed", label: "Completed", icon: CheckCircle2, count: orders.filter(o => o.uiStatus === 'completed').length },
    ].map((tab) => (
     <button
      key={tab.id}
      onClick={() => {
       setActiveTab(tab.id);
       setCurrentPage(1);
      }}
      className={cn(
       "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
       activeTab === tab.id
        ? "bg-white text-primary shadow-sm border border-glass-border"
        : "text-foreground/40 hover:text-foreground/60"
      )}
     >
      <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-foreground/30")} />
      {tab.label}
      {tab.count > 0 && (
       <span className={cn(
        "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
        activeTab === tab.id ? "bg-primary text-white" : "bg-muted text-foreground/40"
       )}>
        {tab.count}
       </span>
      )}
     </button>
    ))}
   </div>

   {/* Orders Table */}
   <GlassCard className="overflow-hidden border-glass-border">
    <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse">
      <thead>
       <tr className="border-b border-glass-border bg-muted/20">
        <th className="px-6 py-4 text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest">Order ID</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest">Date</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest">Customer</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest">Status</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest">Total</th>
        <th className="px-6 py-4 text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest text-right">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-glass-border">
       {loading ? (
        <tr>
         <td colSpan={6} className="px-6 py-20 text-center">
          <div className="flex flex-col items-center gap-3">
           <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
           <span className="text-sm font-bold text-foreground/40">Loading orders...</span>
          </div>
         </td>
        </tr>
       ) : (
        <AnimatePresence mode="popLayout">
         {paginatedOrders.map((order) => (
          <motion.tr
           key={order.uid}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="hover:bg-muted/10 transition-colors group"
          >
           <td className="px-6 py-5">
            <span className="text-sm font-bold text-foreground">{order.displayId}</span>
           </td>
           <td className="px-6 py-5">
            <span className="text-xs font-medium text-foreground/50">{order.date}</span>
           </td>
           <td className="px-6 py-5">
            <div className="flex flex-col">
             <span className="text-sm font-bold text-foreground">{order.customerName}</span>
             <span className="text-[10px] font-medium text-foreground/40 truncate max-w-[150px]">{order.shipping_address}</span>
            </div>
           </td>
           <td className="px-6 py-5">
            <StatusBadge status={order.uiStatus} />
           </td>
           <td className="px-6 py-5">
            <div className="flex flex-col">
             <span className="text-sm font-extrabold text-primary">₦{order.totalPrice.toLocaleString()}</span>
             <span className="text-[10px] font-bold text-foreground/30">{order.itemsCount} items</span>
            </div>
           </td>
           <td className="px-6 py-5 text-right">
            {order.uiStatus === 'new' && (
             <Button
              onClick={() => handleOpenModal(order, "price")}
              className="h-9 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20"
             >
              Set Fee
             </Button>
            )}
            {(order.uiStatus === 'processing' && (order.status === 'PROCESSING')) && (
             <Button
              onClick={() => handleOpenModal(order, "dispatch")}
              className="h-9 px-4 rounded-xl bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
             >
              Assign Rider
             </Button>
            )}
            {order.uiStatus === 'out_for_delivery' && (
             <div className="flex justify-end gap-2">
              <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-muted">
               <MoreVertical className="h-4 w-4 text-foreground/40" />
              </Button>
             </div>
            )}
            {order.uiStatus === 'completed' && (
             <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-foreground/40">
              View Details
             </Button>
            )}
           </td>
          </motion.tr>
         ))}
        </AnimatePresence>
       )}
      </tbody>
     </table>
     {!loading && paginatedOrders.length === 0 && (
      <div className="py-20 flex flex-col items-center justify-center text-center">
       <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="h-8 w-8 text-foreground/20" />
       </div>
       <h3 className="text-lg font-bold text-foreground">No orders found</h3>
       <p className="text-sm text-foreground/40 max-w-xs">Try adjusting your search or filters.</p>
      </div>
     )}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
     <div className="p-4 border-t border-glass-border flex items-center justify-between bg-muted/5">
      <p className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest">
       Page {currentPage} of {totalPages} — {filteredOrders.length} orders
      </p>
      <div className="flex gap-2">
       <Button
        variant="outline"
        size="sm"
        className="h-8 rounded-lg"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => prev - 1)}
       >
        <ChevronLeft className="h-4 w-4" />
       </Button>
       <Button
        variant="outline"
        size="sm"
        className="h-8 rounded-lg"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => prev + 1)}
       >
        <ChevronRight className="h-4 w-4" />
       </Button>
      </div>
     </div>
    )}
   </GlassCard>

   {/* Modals */}
   <AnimatePresence>
    {modalType && selectedOrder && (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       onClick={() => !isSubmitting && setModalType(null)}
       className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
       initial={{ opacity: 0, scale: 0.9, y: 20 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.9, y: 20 }}
       className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-glass-border"
      >
       <div className="p-6 border-b border-glass-border flex items-center justify-between bg-muted/10">
        <div>
         <h3 className="text-xl font-extrabold text-foreground">
          {modalType === 'price' ? 'Review & Set Delivery Fee' : 'Dispatch Order'}
         </h3>
         <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Order {selectedOrder.displayId}</p>
        </div>
        <button onClick={() => setModalType(null)} className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
         <X className="h-5 w-5 text-foreground/40" />
        </button>
       </div>

       <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="p-4 rounded-2xl bg-muted/30 border border-glass-border space-y-4">
         <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
           <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
           <p className="text-xs font-extrabold text-foreground/40 uppercase tracking-widest">Delivery Address</p>
           <p className="text-sm font-bold text-foreground mt-0.5">{selectedOrder.shipping_address}</p>
          </div>
         </div>
         <div className="pt-4 border-t border-glass-border">
          <p className="text-xs font-extrabold text-foreground/40 uppercase tracking-widest mb-3">Order Items</p>
          <div className="space-y-2">
           {selectedOrder.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-sm">
             <span className="font-bold text-foreground/70">{item.quantity}x {item.product_name}</span>
             <span className="font-mono font-bold text-foreground/40">₦{parseFloat(item.price_at_order).toLocaleString()}</span>
            </div>
           ))}
           <div className="pt-2 flex justify-between items-center border-t border-glass-border/50">
            <span className="text-sm font-extrabold text-foreground">Total (Excl. Fee)</span>
            <span className="text-sm font-extrabold text-primary">₦{parseFloat(selectedOrder.total_items_price).toLocaleString()}</span>
           </div>
          </div>
         </div>
        </div>

        {modalType === 'price' ? (
         <div className="space-y-4">
          <div className="space-y-2">
           <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-1">Delivery Fee (₦)</label>
           <Input
            type="number"
            placeholder="e.g. 1500"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="h-12 rounded-xl bg-muted/20 border-glass-border focus:border-primary/50 text-lg font-bold"
           />
          </div>
         </div>
        ) : (
         <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-1">Rider Name</label>
            <Input placeholder="e.g. Tunde" value={riderName} onChange={(e) => setRiderName(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-glass-border" />
           </div>
           <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-1">Rider Phone</label>
            <Input placeholder="080..." value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-glass-border" />
           </div>
          </div>
          <div className="space-y-2">
           <label className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-1">Logistics Company</label>
           <select value={riderCompany} onChange={(e) => setRiderCompany(e.target.value)} className="w-full h-12 rounded-xl bg-muted/20 border-glass-border px-4 text-sm font-bold text-foreground outline-none">
            {logisticsCompanies.map((company) => (
             <option key={company.uid} value={company.name}>{company.name}</option>
            ))}
           </select>
          </div>
         </div>
        )}
       </div>

       <div className="p-6 border-t border-glass-border bg-muted/10">
        <Button
         onClick={modalType === 'price' ? handleConfirmFee : handleDispatch}
         disabled={isSubmitting || (modalType === 'price' ? !deliveryFee : !riderName)}
         className={cn(
          "w-full h-14 rounded-2xl font-bold text-lg shadow-xl relative overflow-hidden",
          modalType === 'price' ? "bg-primary text-white shadow-primary/20" : "bg-blue-500 text-white shadow-blue-500/20"
         )}
        >
         {isSubmitting ? (
          <div className="flex items-center justify-center gap-3">
           {showBikeAnimation ? (
            <motion.div animate={{ x: [0, 300] }} transition={{ duration: 1.5, ease: "easeInOut" }}>
             <Bike className="h-6 w-6" />
            </motion.div>
           ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
           )}
           <span>{modalType === 'price' ? 'Setting Fee...' : 'Dispatching...'}</span>
          </div>
         ) : (
          <div className="flex items-center justify-center gap-2">
           {modalType === 'price' ? <Check className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
           {modalType === 'price' ? 'Confirm Fee & Accept Order' : 'Mark Out for Delivery'}
          </div>
         )}
        </Button>
       </div>
      </motion.div>
     </div>
    )}
   </AnimatePresence>
  </div>
 );
}
