"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Search, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Dynamically import the map to avoid SSR issues
const LeafletMap = dynamic(() => import("./leaflet-map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-72 md:h-96 rounded-2xl bg-slate-100 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  onSelect: (location: LocationData) => void;
  onClose: () => void;
  initialLocation?: LocationData | null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.displayName ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchLocation(query: string): Promise<{ lat: number; lng: number; label: string }[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      label: item.displayName,
    }));
  } catch {
    return [];
  }
}

export function LocationPicker({ onSelect, onClose, initialLocation }: LocationPickerProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
  );
  const [center, setCenter] = useState(
    initialLocation
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : { lat: 6.5244, lng: 3.3792 } // Default: Lagos
  );
  const [address, setAddress] = useState<string>(initialLocation?.address ?? "");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; label: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMarker({ lat, lng });
    setIsGeocoding(true);
    setSearchResults([]);
    const resolved = await reverseGeocode(lat, lng);
    setAddress(resolved);
    setIsGeocoding(false);
  }, []);

  // Auto-detect location on mount to center the map (without placing a pin)
  useEffect(() => {
    if (!initialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCenter({ lat: coords.latitude, lng: coords.longitude });
        },
        () => {
          // Silently fail on auto-detect, keep Lagos default
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, [initialLocation]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocation(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSelectResult = (result: { lat: number; lng: number; label: string }) => {
    setMarker({ lat: result.lat, lng: result.lng });
    setCenter({ lat: result.lat, lng: result.lng });
    setAddress(result.label);
    setSearchQuery(result.label.split(",")[0]);
    setSearchResults([]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location detection is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    const toastId = toast.loading("Detecting your exact location...");
    
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setMarker({ lat, lng });
        setCenter({ lat, lng });
        setIsGeocoding(true);
        toast.dismiss(toastId);
        
        const resolved = await reverseGeocode(lat, lng);
        setAddress(resolved);
        setIsGeocoding(false);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        toast.dismiss(toastId);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location access denied. Please allow location permissions in your browser.");
        } else {
          toast.error("Could not fetch your location. Please ensure your GPS/Location is turned on.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (!marker || !address) return;
    onSelect({ lat: marker.lat, lng: marker.lng, address });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 h-12 bg-slate-50 border border-slate-200 rounded-xl px-3">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a location..."
            className="flex-1 bg-transparent font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none text-sm"
          />
        </div>
        {/* Search Dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
            >
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium line-clamp-2">{r.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        <LeafletMap
          center={center}
          marker={marker}
          onMapClick={handleMapClick}
        />
        {!marker && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-4 py-2 rounded-full pointer-events-none whitespace-nowrap shadow-xl">
            Tap the map to pin your location
          </div>
        )}
      </div>

      <p className="text-[10px] font-medium text-slate-400 bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
        <span className="font-bold text-primary mr-1">Pro Tip:</span> 
        If "Current Location" isn't accurate (e.g. showing Kaduna), please use the <b>Search bar</b> at the top to find your specific street or landmark.
      </p>

      {/* Current Location */}
      <Button
        type="button"
        variant="outline"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="h-11 rounded-xl border-primary/30 text-primary font-bold hover:bg-primary/5 flex items-center gap-2"
      >
        {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        {isLocating ? "Detecting location..." : "Use my current location"}
      </Button>

      {/* Address Preview */}
      <AnimatePresence>
        {(isGeocoding || address) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={cn(
              "flex items-start gap-3 p-4 rounded-2xl border-2",
              address && !isGeocoding ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-200"
            )}
          >
            {isGeocoding ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0 mt-0.5" />
            ) : (
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Selected Address</p>
              <p className="text-sm font-bold text-slate-900 leading-snug break-words">
                {isGeocoding ? "Fetching address..." : address}
              </p>
              {marker && !isGeocoding && (
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm */}
      <Button
        onClick={handleConfirm}
        disabled={!marker || !address || isGeocoding}
        className="h-14 rounded-2xl bg-primary text-white font-extrabold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 flex items-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        Confirm Location
      </Button>
    </div>
  );
}
