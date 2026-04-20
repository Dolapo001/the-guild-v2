"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { socialService, FavoriteItem } from "@/services/social.service";

type FavoriteItemState = {
 uid: string;
 type: 'business' | 'service' | 'product';
 data: any;
};

interface FavoritesContextType {
 favorites: FavoriteItemState[];
 toggleFavorite: (item: any, type: 'business' | 'service' | 'product') => Promise<void>;
 isFavorite: (uid: string) => boolean;
 loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
 const [favorites, setFavorites] = useState<FavoriteItemState[]>([]);
 const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);
 const [loading, setLoading] = useState(true);
 const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 // Load from Backend
 const fetchFavorites = async () => {
    setLoading(true);
    try {
        const data = await socialService.getFavorites();
        // Backend returns a list of favorite objects, we need to map them to our state
        setFavorites(data.map(f => ({
            uid: f.object_id,
            type: f.content_type,
            data: f.content_object
        })));
    } catch (e) {
        console.warn("Failed to fetch favorites from backend, falling back to local", e);
        const stored = localStorage.getItem("the-guild-favorites");
        if (stored) setFavorites(JSON.parse(stored));
    } finally {
        setLoading(false);
    }
 };

 useEffect(() => {
    fetchFavorites();
 }, []);

 // Save to local storage as backup
 useEffect(() => {
  try {
   localStorage.setItem("the-guild-favorites", JSON.stringify(favorites));
  } catch { /* ignore SSR or quota errors */ }
 }, [favorites]);

 // Cleanup timer on unmount
 useEffect(() => {
  return () => {
   if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };
 }, []);

 const isFavorite = (uid: string) => favorites.some(f => f.uid === uid);

 const toggleFavorite = async (item: any, type: 'business' | 'service' | 'product') => {
  const uid = item.uid;
  const exists = isFavorite(uid);

  try {
    const { isFavorited } = await socialService.toggleFavorite(uid, type);
    
    if (isFavorited) {
        setFavorites(prev => [...prev, { uid, type, data: item }]);
        showToast("Saved to Favorites", "❤️");
    } else {
        setFavorites(prev => prev.filter(f => f.uid !== uid));
        showToast("Removed from Favorites", "💔");
    }
  } catch (err) {
    console.error("Toggle favorite failed", err);
    // Optimistic fallback or just show error
    showToast("Action failed", "⚠️");
  }
 };

 const showToast = (message: string, icon: string) => {
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  setToast({ message, icon });
  toastTimerRef.current = setTimeout(() => setToast(null), 3000);
 };

 return (
  <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
  {children}

  {/* Simple Toast Notification */}
  <AnimatePresence>
  {toast && (
  <motion.div
  initial={{ opacity: 0, y: 50, x: "-50%" }}
  animate={{ opacity: 1, y: 0, x: "-50%" }}
  exit={{ opacity: 0, y: 20, x: "-50%" }}
  className="fixed bottom-10 left-1/2 z-[200] px-6 py-3 rounded-2xl bg-white shadow-2xl border border-glass-border flex items-center gap-3"
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
