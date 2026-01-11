"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
}

interface CartContextType {
    cart: CartItem[];
    addItem: (item: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    toggleCart: (isOpen?: boolean) => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addItem = useCallback((product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    }, []);

    const removeItem = useCallback((id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const toggleCart = useCallback((isOpen?: boolean) => {
        setIsCartOpen(prev => isOpen !== undefined ? isOpen : !prev);
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            toggleCart,
            cartTotal,
            cartCount
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
