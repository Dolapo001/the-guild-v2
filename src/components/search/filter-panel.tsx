"use client";

import { Button } from "@/components/ui/button";
import {
    Filter,
    ShieldCheck,
    ChevronLeft,
    Scissors,
    Sparkles,
    Shirt,
    Home,
    Utensils,
    Pizza,
    Camera,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
    verifiedOnly: boolean;
    radius: number;
    selectedCategory: string | null;
}

interface FilterPanelProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    categories: { id: string; name: string; icons: any[] }[];
    className?: string;
    onClose?: () => void;
}

export function FilterPanel({
    filters,
    setFilters,
    categories,
    className,
    onClose,
}: FilterPanelProps) {
    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                </h3>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                {/* Categories */}
                <div>
                    <p className="text-[10px] font-extrabold text-foreground/40 dark:text-white uppercase tracking-widest mb-4">
                        Categories
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => updateFilter("selectedCategory", null)}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                                filters.selectedCategory === null
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-foreground/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white"
                            )}
                        >
                            All Services
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => updateFilter("selectedCategory", cat.id)}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between",
                                    filters.selectedCategory === cat.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-foreground/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white"
                                )}
                            >
                                {cat.name}
                                <div className="flex gap-1">
                                    {cat.icons.map((Icon: any, i: number) => (
                                        <Icon key={i} className="h-3.5 w-3.5 opacity-60" />
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Verification */}
                <div>
                    <p className="text-[10px] font-extrabold text-foreground/40 dark:text-white uppercase tracking-widest mb-4">
                        Verification
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            className={cn(
                                "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                                filters.verifiedOnly
                                    ? "border-primary bg-primary"
                                    : "border-gray-300 dark:border-white/20 group-hover:border-primary"
                            )}
                            onClick={() => updateFilter("verifiedOnly", !filters.verifiedOnly)}
                        >
                            {filters.verifiedOnly && (
                                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                            )}
                        </div>
                        <span
                            className="text-sm font-bold text-foreground/60 group-hover:text-primary dark:group-hover:text-white select-none"
                            onClick={() => updateFilter("verifiedOnly", !filters.verifiedOnly)}
                        >
                            Verified Only
                        </span>
                    </label>
                </div>

                {/* Location Radius */}
                <div>
                    <p className="text-[10px] font-extrabold text-foreground/40 dark:text-white uppercase tracking-widest mb-4">
                        Location Radius
                    </p>
                    <div className="space-y-4">
                        <div className="relative pt-1">
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={filters.radius}
                                onChange={(e) => updateFilter("radius", parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                            />
                            <div
                                className="absolute top-1 left-0 h-1.5 bg-primary rounded-full pointer-events-none"
                                style={{ width: `${(filters.radius / 50) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-foreground/40">
                            <span>0km</span>
                            <span className="text-primary font-extrabold">Within {filters.radius}km</span>
                            <span>50km+</span>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                className="w-full mt-6 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-primary dark:text-white font-bold border-0 h-12 rounded-xl"
                onClick={() =>
                    setFilters({
                        verifiedOnly: false,
                        radius: 15,
                        selectedCategory: null,
                    })
                }
            >
                Reset Filters
            </Button>
        </div>
    );
}
