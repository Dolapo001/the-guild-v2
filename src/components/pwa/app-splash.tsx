"use client";

import { motion } from "framer-motion";

/**
 * Native-style launch splash. Shown while /app validates the session, so the
 * user never sees raw loading states or a wrong-page flash.
 */
export function AppSplash({ label = "Starting…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#05070f] pb-safe pt-safe text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(57,73,171,0.35),transparent_60%)]" />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-20 w-20 overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/15 shadow-2xl"
        >
          <img src="/logo.png" alt="The Guild" className="h-full w-full object-cover" />
        </motion.div>
        <div className="flex flex-col items-center gap-3">
          <span className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full w-1/2 rounded-full bg-[#ffb74d]"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">{label}</p>
        </div>
      </motion.div>
    </div>
  );
}
