"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { marketplaceService } from '@/services/marketplace.service';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  id: string; // matches backend item's uid
  product_uid?: string;
  package_uid?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  city?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCity: string | null;
  addItem: (product: { uid: string; isPackage?: boolean; [key: string]: any }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  toggleCart: (isOpen?: boolean) => void;
  cartTotal: number;
  cartCount: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCity, setCartCity] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const data = await marketplaceService.getCart();
      setCartCity(data.city);
      setCart(data.items.map(item => {
        const detail = (item.product_details || item.package_details) as any;
        return {
          id: item.uid,
          product_uid: item.product_details?.uid,
          package_uid: item.package_details?.uid,
          name: detail?.name || "Unknown Item",
          price: Number(detail?.price) || 0,
          quantity: item.quantity,
          image: detail?.image_url || "/placeholder-product.png",
          category: detail?.category || "Marketplace",
          city: detail?.city || "Lagos"
        };
      }));
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setCartCity(null);
    }
  }, [user, fetchCart]);

  const addItem = useCallback(async (product: { uid: string; isPackage?: boolean; [key: string]: any }) => {
    try {
      const payload = product.isPackage 
        ? { package_uid: product.uid, quantity: 1 }
        : { product_uid: product.uid, quantity: 1 };
      
      await marketplaceService.addToCart(payload);
      await fetchCart();
      setIsCartOpen(true);
    } catch (err: any) {
      console.error("Add item to cart failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to add item. Ensure it is in your city!";
      alert(msg);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (id: string) => {
    try {
      await marketplaceService.removeCartItem(id);
      await fetchCart();
    } catch (err) {
      console.error("Remove item failed:", err);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    try {
      const newQty = item.quantity + delta;
      await marketplaceService.updateCartItem(id, newQty);
      await fetchCart();
    } catch (err: any) {
      console.error("Update quantity failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to update quantity.";
      alert(msg);
    }
  }, [cart, fetchCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartCity(null);
  }, []);

  const toggleCart = useCallback((isOpen?: boolean) => {
    setIsCartOpen(prev => isOpen !== undefined ? isOpen : !prev);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCity,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      toggleCart,
      cartTotal,
      cartCount,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
