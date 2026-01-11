"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    CreditCard,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Truck,
    MapPin,
    Wallet,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock Data
const CART_ITEMS = [
    {
        id: 1,
        name: "Organic Shea Butter",
        price: 4500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1556228720-1987594a8a63?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "African Black Soap",
        price: 3500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1602364956828-d89d6e529c6e?q=80&w=200&auto=format&fit=crop"
    }
];

export default function CheckoutPage() {
    const router = useRouter();
    const [deliveryDetails, setDeliveryDetails] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        instructions: '',
        deliveryZone: 'local' // 'local' or 'interstate'
    });
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'escrow' | 'card'>('escrow');

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<1 | 2 | 3>(1);

    const subtotal = CART_ITEMS.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDueNow = subtotal; // Delivery is TBD

    const handleUseLocation = () => {
        setIsLoadingLocation(true);
        setTimeout(() => {
            setDeliveryDetails(prev => ({
                ...prev,
                address: "10 Admiralty Way, Lekki Phase 1",
                city: "Lagos"
            }));
            setIsLoadingLocation(false);
        }, 1500);
    };

    const handlePlaceOrder = () => {
        setIsProcessing(true);

        // Step 1: Securing Funds
        setTimeout(() => {
            setProcessingStep(2);

            // Step 2: Verifying Delivery Slot
            setTimeout(() => {
                setProcessingStep(3);

                // Step 3: Success & Redirect
                setTimeout(() => {
                    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
                    router.push(`/marketplace/order/${orderId}`);
                }, 1000);
            }, 1500);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background bg-mesh-gradient pb-24 pt-24">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Delivery Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-8 border-white/40 dark:border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Details</h2>
                                        <p className="text-sm text-foreground/60">Where should we send your order?</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUseLocation}
                                    disabled={isLoadingLocation}
                                    className="rounded-xl border-glass-border font-bold text-primary hover:bg-primary/5"
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
                                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Full Name</label>
                                    <Input
                                        placeholder="e.g. Amina Bello"
                                        className="bg-white/50 dark:bg-slate-900/50 border-glass-border h-12 rounded-xl"
                                        value={deliveryDetails.name}
                                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Phone Number</label>
                                    <Input
                                        placeholder="e.g. 08012345678"
                                        className="bg-white/50 dark:bg-slate-900/50 border-glass-border h-12 rounded-xl"
                                        value={deliveryDetails.phone}
                                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Delivery Address</label>
                                    <Input
                                        placeholder="e.g. 12 Adeola Odeku Street"
                                        className="bg-white/50 dark:bg-slate-900/50 border-glass-border h-12 rounded-xl"
                                        value={deliveryDetails.address}
                                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">City / State</label>
                                    <Input
                                        placeholder="e.g. Lagos"
                                        className="bg-white/50 dark:bg-slate-900/50 border-glass-border h-12 rounded-xl"
                                        value={deliveryDetails.city}
                                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-3 pt-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Delivery Zone relative to Vendor</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setDeliveryDetails({ ...deliveryDetails, deliveryZone: 'local' })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                                                deliveryDetails.deliveryZone === 'local'
                                                    ? "bg-primary/5 border-primary"
                                                    : "bg-transparent border-glass-border hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center", deliveryDetails.deliveryZone === 'local' ? "border-primary" : "border-foreground/30")}>
                                                {deliveryDetails.deliveryZone === 'local' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Same City (Local Delivery)</span>
                                        </div>
                                        <div
                                            onClick={() => setDeliveryDetails({ ...deliveryDetails, deliveryZone: 'interstate' })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                                                deliveryDetails.deliveryZone === 'interstate'
                                                    ? "bg-primary/5 border-primary"
                                                    : "bg-transparent border-glass-border hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center", deliveryDetails.deliveryZone === 'interstate' ? "border-primary" : "border-foreground/30")}>
                                                {deliveryDetails.deliveryZone === 'interstate' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Different City (Inter-state)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium leading-relaxed">
                                            Delivery fees are set by the Vendor based on your exact location and will be communicated after order placement.
                                        </p>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Special Instructions (Optional)</label>
                                    <Textarea
                                        placeholder="e.g. Leave with security at the gate"
                                        className="bg-white/50 dark:bg-slate-900/50 border-glass-border min-h-[100px] rounded-xl"
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
                            <GlassCard className="p-6 border-white/40 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Order Summary</h3>

                                {/* Cart Items */}
                                <div className="space-y-4 mb-6">
                                    {CART_ITEMS.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 border border-glass-border">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                                                <p className="text-xs text-foreground/60 font-medium">Qty: {item.quantity}</p>
                                                <p className="text-sm font-extrabold text-primary mt-1">₦{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px bg-glass-border mb-6" />

                                {/* Price Breakdown */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground/60 font-medium">Subtotal</span>
                                        <span className="font-bold">₦{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground/60 font-medium">Delivery Fee</span>
                                        <span className="font-bold text-amber-500">Pay on Delivery / TBD</span>
                                    </div>
                                    <div className="flex justify-between text-xl pt-3 border-t border-dashed border-glass-border">
                                        <span className="font-extrabold text-gray-900 dark:text-white">Total Due Now</span>
                                        <span className="font-extrabold text-primary">₦{totalDueNow.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-3 mb-6">
                                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Payment Method</p>
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
                                            <span className={cn("text-xs font-bold", paymentMethod === 'card' ? "text-primary" : "text-foreground/60")}>Pay with Card</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={!deliveryDetails.address || !deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.city}
                                    className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-extrabold text-lg shadow-xl shadow-blue-500/20"
                                >
                                    Pay ₦{totalDueNow.toLocaleString()} to Escrow
                                </Button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                    <ShieldCheck className="h-3 w-3" /> Secure Escrow Payment
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Modal */}
            <AnimatePresence>
                {isProcessing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-8 border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl text-center">
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

                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                                    {processingStep === 1 && "Securing Funds..."}
                                    {processingStep === 2 && "Verifying Delivery Slot..."}
                                    {processingStep === 3 && "Order Confirmed!"}
                                </h3>

                                <p className="text-foreground/60 font-medium">
                                    {processingStep === 1 && "We are holding your payment safely in escrow."}
                                    {processingStep === 2 && "Connecting with the nearest available rider."}
                                    {processingStep === 3 && "Redirecting you to your order details..."}
                                </p>

                                <div className="mt-8 flex gap-2 justify-center">
                                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", processingStep >= 1 ? "bg-primary" : "bg-gray-200 dark:bg-white/10")} />
                                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", processingStep >= 2 ? "bg-primary" : "bg-gray-200 dark:bg-white/10")} />
                                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", processingStep >= 3 ? "bg-primary" : "bg-gray-200 dark:bg-white/10")} />
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
