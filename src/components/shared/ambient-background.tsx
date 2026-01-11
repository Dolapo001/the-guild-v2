"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 transition-colors duration-700 bg-slate-50 dark:bg-[#02040a]">
            {/* The "Amber Soul" - Theme-aware radial gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.08)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.15)_0%,transparent_70%)]" />

            {/* Secondary warm glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.04)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.08)_0%,transparent_50%)]" />

            {/* Living Blobs - Subtle movement */}
            <motion.div
                animate={{
                    x: [-40, 40, -40],
                    y: [-30, 30, -30],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-full bg-secondary/[0.02] dark:bg-secondary/[0.04] blur-[140px] rounded-full"
            />

            {/* Grainy Texture Overlay - Adjusted for themes */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] dark:opacity-[0.6] mix-blend-overlay pointer-events-none" />

            {/* Subtle Grid Pattern */}
            <div className={cn(
                "absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]",
                "bg-grid-slate-900 dark:bg-grid-white"
            )} />

            {/* Deep Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,10,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,10,0.7)_100%)] pointer-events-none" />
        </div>
    );
}
