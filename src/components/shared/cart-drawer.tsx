"use client";

import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart,
    Plus,
    Minus,
    X,
    ArrowRight,
    ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartDrawer() {
    const router = useRouter();
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        updateQuantity,
        removeItem,
        cartTotal
    } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-white/10 z-[60] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-6 w-6 text-primary dark:text-white" />
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Your Cart</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                                <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <ShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-400" />
                                    <p className="font-bold text-gray-600 dark:text-gray-400">Your cart is empty</p>
                                    <Button variant="outline" onClick={() => setIsCartOpen(false)} className="rounded-xl border-gray-200 dark:border-white/10">Start Shopping</Button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-20 w-20 rounded-xl overflow-hidden relative shrink-0 bg-gray-100 dark:bg-white/5">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                                                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">₦{item.price.toLocaleString()}</p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"><Minus className="h-3 w-3" /></button>
                                                    <span className="text-xs font-extrabold text-gray-900 dark:text-white w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"><Plus className="h-3 w-3" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-200">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">₦{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-200">
                                        <span>Delivery</span>
                                        <span className="font-bold text-gray-900 dark:text-white">₦1,500</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-extrabold text-primary dark:text-white pt-4 border-t border-gray-200 dark:border-white/10">
                                        <span>Total</span>
                                        <span>₦{(cartTotal + 1500).toLocaleString()}</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        router.push('/marketplace/checkout');
                                    }}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform border-0"
                                >
                                    Checkout Now <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
