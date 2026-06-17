"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard, ShieldCheck, Loader2, CheckCircle2, Truck, MapPin, Wallet, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: cartCity || 'Lagos',
    instructions: ''
  });
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'escrow' | 'card'>('escrow');

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (cartCity) {
      setDeliveryDetails(prev => ({ ...prev, city: cartCity }));
    }
  }, [cartCity]);

  // If cart is empty, redirect back to marketplace
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      toast.error("Your cart is empty. Please add items to checkout.");
      router.push("/marketplace");
    }
  }, [cart, router, isProcessing]);

  const subtotal = cartTotal;
  const totalDueNow = subtotal;

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoadingLocation(true);
    const toastId = toast.loading("Fetching your current address...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // In a real app, we would reverse geocode here. 
          // For now, we'll use a slightly more realistic "Detected" placeholder 
          // or ideally fetch from the profile if available.
          setDeliveryDetails(prev => ({
            ...prev,
            address: user?.address || "Current Location Detected",
            city: cartCity || "Lagos"
          }));
          toast.success("Location updated!", { id: toastId });
        } catch (err) {
          toast.error("Failed to resolve address.", { id: toastId });
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        toast.error("Location access denied.", { id: toastId });
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.name || !deliveryDetails.phone) {
      toast.error("Please fill in all delivery details.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1);
    toast.loading("Initiating checkout...", { id: "checkout-step" });

    try {
      // Create order atomically on backend
      const order = await marketplaceService.checkout({
        deliveryAddress: `${deliveryDetails.address}. Note: ${deliveryDetails.instructions}. Contact: ${deliveryDetails.name} (${deliveryDetails.phone})`,
        city: deliveryDetails.city
      });

      // Step 2: Confirmation
      setProcessingStep(3);
      toast.success("Checkout completed!", { id: "checkout-step" });
      clearCart();

      setTimeout(() => {
        router.push(`/marketplace/orders`);
      }, 1200);

    } catch (err: any) {
      setIsProcessing(false);
      console.error("Checkout failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to checkout. Ensure city consistency and stock availability.";
      toast.error(msg, { id: "checkout-step" });
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh-gradient pb-24 pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Delivery Details */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-8 border-white/40 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 ">Delivery Details</h2>
                    <p className="text-sm text-foreground/60">Where should we deliver your marketplace order?</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseLocation}
                  disabled={isLoadingLocation}
                  className="rounded-xl border-glass-border font-bold text-primary hover:bg-primary/5 text-xs"
                >
                  {isLoadingLocation ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  Use My Location
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Full Name</label>
                  <Input
                    placeholder="Amina Bello"
                    className="bg-white/50 border-glass-border h-12 rounded-xl text-sm font-bold"
                    value={deliveryDetails.name}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Phone Number</label>
                  <Input
                    placeholder="08012345678"
                    className="bg-white/50 border-glass-border h-12 rounded-xl text-sm font-bold"
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Delivery Address</label>
                  <Input
                    placeholder="12 Adeola Odeku Street"
                    className="bg-white/50 border-glass-border h-12 rounded-xl text-sm font-bold"
                    value={deliveryDetails.address}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Delivery City</label>
                  <Input
                    disabled
                    placeholder="City is automatically locked to cart items city"
                    className="bg-gray-100 border-glass-border h-12 rounded-xl text-sm font-bold text-primary"
                    value={deliveryDetails.city}
                  />
                  <p className="text-[10px] font-bold text-blue-500 uppercase">
                    Locked to: {deliveryDetails.city} (Consistent with current shopping cart location)
                  </p>
                </div>

                <div className="md:col-span-2 space-y-3 pt-2">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 ">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">
                      All products and service bundles must be sourced within the same city. No cross-city mixing is permitted in v1.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Special Instructions (Optional)</label>
                  <Textarea
                    placeholder="e.g. Leave with security at the gate or call before coming"
                    className="bg-white/50 border-glass-border min-h-[100px] rounded-xl text-sm font-bold"
                    value={deliveryDetails.instructions}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, instructions: e.target.value })}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <GlassCard className="p-6 border-white/40 bg-white/80 backdrop-blur-2xl shadow-xl">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6">Order Summary</h3>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-glass-border bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-foreground/60 font-bold">Qty: {item.quantity}</p>
                        <p className="text-sm font-black text-primary mt-1">₦{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-glass-border mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-bold text-foreground/60">
                    <span>Subtotal</span>
                    <span className="text-gray-900">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground/60">
                    <span>Delivery Fee</span>
                    <span className="text-amber-500">TBD / Pay on Delivery</span>
                  </div>
                  <div className="flex justify-between text-xl pt-4 border-t border-dashed border-glass-border">
                    <span className="font-black text-gray-900 ">Total Due</span>
                    <span className="font-black text-primary">₦{totalDueNow.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 mb-6">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentMethod('escrow')}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center",
                        paymentMethod === 'escrow'
                          ? "bg-primary/5 border-primary"
                          : "bg-transparent border-glass-border hover:border-primary/30"
                      )}
                    >
                      <Wallet className={cn("h-5 w-5", paymentMethod === 'escrow' ? "text-primary" : "text-foreground/40")} />
                      <span className={cn("text-xs font-bold", paymentMethod === 'escrow' ? "text-primary" : "text-foreground/60")}>Escrow Wallet</span>
                    </div>
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center",
                        paymentMethod === 'card'
                          ? "bg-primary/5 border-primary"
                          : "bg-transparent border-glass-border hover:border-primary/30"
                      )}
                    >
                      <CreditCard className={cn("h-5 w-5", paymentMethod === 'card' ? "text-primary" : "text-foreground/40")} />
                      <span className={cn("text-xs font-bold", paymentMethod === 'card' ? "text-primary" : "text-foreground/60")}>Debit Card</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={!deliveryDetails.address || !deliveryDetails.name || !deliveryDetails.phone}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-extrabold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.01] transition-transform"
                >
                  Confirm Order (₦{totalDueNow.toLocaleString()})
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Secure Escrow Checkout
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 border-white/20 bg-white/90 backdrop-blur-2xl text-center shadow-2xl">
                <div className="mb-6 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center relative">
                    {processingStep === 3 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                      </motion.div>
                    ) : (
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {processingStep === 1 && "Verifying Stock & City..."}
                  {processingStep === 2 && "Securing Escrow Funds..."}
                  {processingStep === 3 && "Order Confirmed!"}
                </h3>

                <p className="text-foreground/60 font-bold text-sm">
                  {processingStep === 1 && "Performing atomic inventory and logistics routing check..."}
                  {processingStep === 2 && "Locking payment securely in Escrow..."}
                  {processingStep === 3 && "Redirecting you to your order history..."}
                </p>

                <div className="mt-8 flex gap-2 justify-center">
                  <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", processingStep >= 1 ? "bg-primary" : "bg-gray-200 ")} />
                  <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", processingStep >= 2 ? "bg-primary" : "bg-gray-200 ")} />
                  <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", processingStep >= 3 ? "bg-primary" : "bg-gray-200 ")} />
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
