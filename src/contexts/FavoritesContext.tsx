"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

type FavoriteItem = {
    id: string;
    type: 'service' | 'product';
    data: any;
};

interface FavoritesContextType {
    favorites: FavoriteItem[];
    toggleFavorite: (item: any, type: 'service' | 'product') => void;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("the-guild-favorites");
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("the-guild-favorites", JSON.stringify(favorites));
    }, [favorites]);

    const isFavorite = (id: string) => favorites.some(f => f.id === id);

    const toggleFavorite = (item: any, type: 'service' | 'product') => {
        const id = item.id;
        const exists = isFavorite(id);

        if (exists) {
            setFavorites(prev => prev.filter(f => f.id !== id));
            showToast("Removed from Favorites", "💔");
        } else {
            setFavorites(prev => [...prev, { id, type, data: item }]);
            showToast("Saved to Favorites", "❤️");
        }
    };

    const showToast = (message: string, icon: string) => {
        setToast({ message, icon });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}

            {/* Simple Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-10 left-1/2 z-[200] px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-glass-border flex items-center gap-3"
                    >
                        <span className="text-xl">{toast.icon}</span>
                        <span className="font-bold text-sm text-primary">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
