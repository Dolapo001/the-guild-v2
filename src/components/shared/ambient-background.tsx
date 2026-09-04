"use client";

import { cn } from "@/lib/utils";

export function AmbientBackground() {
 return (
 <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#08090e]">
 {/* Subtle indigo radial glow at top */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06)_0%,transparent_70%)]" />
 </div>
 );
}