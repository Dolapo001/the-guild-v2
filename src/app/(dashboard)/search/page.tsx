"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ui/service-card";
import { SERVICES_DATA, Service } from "@/lib/mock-data";
import {
    Search,
    SlidersHorizontal,
    Scissors,
    Sparkles,
    Shirt,
    Home,
    Utensils,
    Pizza,
    Camera,
    Calendar,
    ChevronDown,
    Filter,
    MapPin,
    ArrowRight,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterPanel, FilterState } from "@/components/search/filter-panel";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const categories = [
    { id: "beauty", name: "Beauty & Grooming", icons: [Scissors, Sparkles] },
    { id: "cleaning", name: "Laundry & Cleaning", icons: [Shirt, Home] },
    { id: "catering", name: "Catering & Food", icons: [Utensils, Pizza] },
    { id: "events", name: "Events & Lifestyle", icons: [Camera, Calendar] },
];

const SORT_OPTIONS = [
    { label: "Maestro Rank", value: "recommended" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Highest Rated", value: "rating" },
];

// Helper to calculate distance in km (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function SearchPage() {
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState({ city: "Lagos", lat: 6.4589, lng: 3.6015 }); // Mock user location (Lekki area)
    const [filters, setFilters] = useState<FilterState>({
        verifiedOnly: false,
        radius: 15,
        selectedCategory: null,
    });
    const [showFilters, setShowFilters] = useState(true);
    const [sortBy, setSortBy] = useState("recommended");
    const [roamingMode, setRoamingMode] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const processedServices = useMemo(() => {
        let results = SERVICES_DATA.map(service => ({
            ...service,
            distance: calculateDistance(userLocation.lat, userLocation.lng, service.lat, service.lng)
        }));

        // Filter by Search Query
        if (searchQuery) {
            results = results.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.businessName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by Category
        if (filters.selectedCategory) {
            results = results.filter(s => s.category === filters.selectedCategory);
        }

        // Filter by Verification
        if (filters.verifiedOnly) {
            results = results.filter(s => s.isVerified === true);
        }

        // Filter by City (Primary Maestro Filter)
        const localResults = results.filter(s => s.city.toLowerCase() === userLocation.city.toLowerCase());

        if (localResults.length === 0 && !roamingMode) {
            return []; // Trigger empty state
        }

        const finalResults = roamingMode ? results : localResults;

        // Sorting Logic
        if (sortBy === "recommended") {
            // Maestro Rank: 60% Distance, 40% Rating
            // We normalize distance (closer is better) and rating (higher is better)
            return [...finalResults].sort((a, b) => {
                const scoreA = (1 / (a.distance + 1) * 0.6) + (a.rating / 5 * 0.4);
                const scoreB = (1 / (b.distance + 1) * 0.6) + (b.rating / 5 * 0.4);
                return scoreB - scoreA;
            });
        } else if (sortBy === "price_asc") {
            return [...finalResults].sort((a, b) => a.price - b.price);
        } else if (sortBy === "price_desc") {
            return [...finalResults].sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            return [...finalResults].sort((a, b) => b.rating - a.rating);
        }

        return finalResults;
    }, [searchQuery, filters, sortBy, userLocation, roamingMode]);

    return (
        <div className="space-y-8 h-full flex flex-col">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Services</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            className="hidden lg:flex h-9 w-9 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-foreground/60"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => {/* Mock change location */ }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary/20 transition-colors"
                        >
                            <MapPin className="h-3 w-3" />
                            Showing top results near {userLocation.city}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search for verified artisans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-white/40 dark:bg-white/5 border-glass-border rounded-xl focus:ring-primary/10"
                        />
                    </div>

                    {/* Mobile Filter Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-11 w-11 p-0 rounded-xl border-glass-border lg:hidden shrink-0"
                            >
                                <Filter className="h-5 w-5 text-foreground/60" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                            <div className="h-full p-6 bg-white dark:bg-[#1e293b]">
                                <FilterPanel
                                    filters={filters}
                                    setFilters={setFilters}
                                    categories={categories}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Desktop Sidebar Filters */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: showFilters ? 280 : 0,
                        opacity: showFilters ? 1 : 0,
                        marginRight: showFilters ? 32 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="hidden lg:block overflow-hidden shrink-0 h-fit sticky top-24"
                >
                    <div className="w-[280px] p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] shadow-sm">
                        <FilterPanel
                            filters={filters}
                            setFilters={setFilters}
                            categories={categories}
                            onClose={() => setShowFilters(false)}
                        />
                    </div>
                </motion.aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate">
                            {filters.selectedCategory ? categories.find(c => c.id === filters.selectedCategory)?.name : "All Services"}
                            <span className="ml-3 text-sm font-bold text-foreground/40 hidden sm:inline-block">({processedServices.length} results)</span>
                        </h2>

                        <div className="flex items-center gap-2 text-sm font-bold text-foreground/40 shrink-0">
                            <span className="hidden sm:inline">Sort by:</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-auto p-0 hover:bg-transparent text-primary dark:text-white flex items-center gap-1 font-bold">
                                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label} <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {SORT_OPTIONS.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => setSortBy(option.value)}
                                            className={sortBy === option.value ? "bg-primary/10 text-primary font-bold" : ""}
                                        >
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {loading ? (
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-6 transition-all duration-300`}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[400px] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/50 animate-pulse">
                                    <div className="h-48 bg-gray-200 dark:bg-white/5 rounded-t-2xl" />
                                    <div className="p-5 space-y-4">
                                        <div className="h-6 w-2/3 bg-gray-200 dark:bg-white/5 rounded-lg" />
                                        <div className="h-4 w-full bg-gray-200 dark:bg-white/5 rounded-lg" />
                                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/5 rounded-lg" />
                                        <div className="pt-4 flex justify-between">
                                            <div className="h-8 w-24 bg-gray-200 dark:bg-white/5 rounded-lg" />
                                            <div className="h-8 w-24 bg-gray-200 dark:bg-white/5 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-6 transition-all duration-300`}>
                                {processedServices.map((service, index) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        distance={service.distance}
                                        isMaestroMatch={sortBy === "recommended" && index === 0}
                                    />
                                ))}
                            </div>
                            {processedServices.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/40 dark:bg-white/5 rounded-3xl border border-glass-border"
                                >
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                        <AlertCircle className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                                        Maestro couldn't find verified pros in {userLocation.city} yet.
                                    </h3>
                                    <p className="text-foreground/50 font-medium max-w-md mb-8">
                                        We're expanding rapidly! In the meantime, you can view top-rated professionals across Nigeria.
                                    </p>
                                    <Button
                                        onClick={() => setRoamingMode(true)}
                                        className="h-12 px-8 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        Show top-rated pros in Nigeria <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </main>
            </div>
        </div>
    );
}
