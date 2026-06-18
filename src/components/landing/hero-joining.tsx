"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ShieldCheck, Star } from "lucide-react";
import { GuildSeal } from "./guild-seal";

type Chip = {
  id: number;
  name: string;
  verified: boolean;
  scatter: { x: number; y: number; rot: number };
  grid: { x: number; y: number };
};

// Positions are % within the stage. Verified chips resolve into a tidy 2×3
// grid; unverified ones stay scattered and fade.
const CHIPS: Chip[] = [
  { id: 1, name: "Bella Glam", verified: true, scatter: { x: 6, y: 8, rot: -8 }, grid: { x: 6, y: 8 } },
  { id: 2, name: "SwiftClean", verified: true, scatter: { x: 60, y: 4, rot: 10 }, grid: { x: 54, y: 8 } },
  { id: 3, name: "Prestige", verified: true, scatter: { x: 30, y: 40, rot: 6 }, grid: { x: 6, y: 40 } },
  { id: 4, name: "LekkiCuts", verified: true, scatter: { x: 64, y: 52, rot: -12 }, grid: { x: 54, y: 40 } },
  { id: 5, name: "GlowSpa", verified: true, scatter: { x: 8, y: 70, rot: 9 }, grid: { x: 6, y: 72 } },
  { id: 6, name: "FreshFix", verified: true, scatter: { x: 58, y: 78, rot: -6 }, grid: { x: 54, y: 72 } },
  { id: 7, name: "unknown_07", verified: false, scatter: { x: 36, y: 6, rot: 14 }, grid: { x: 0, y: 0 } },
  { id: 8, name: "wa_user_xx", verified: false, scatter: { x: 38, y: 74, rot: -10 }, grid: { x: 0, y: 0 } },
  { id: 9, name: "+234•••", verified: false, scatter: { x: 80, y: 30, rot: 7 }, grid: { x: 0, y: 0 } },
];

/** Hero set-piece: "Joining The Guild" — doubt → trust. Auto-plays in a loop. */
export function JoiningTheGuild() {
  // 0: chaos · 1: seal forms · 2: verified organize, unverified fade
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const seq = [1600, 1400, 2600]; // dwell per phase
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i = (i + 1) % 3;
      setPhase(i);
      t = setTimeout(tick, seq[i]);
    };
    t = setTimeout(tick, seq[0]);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mx-auto aspect-[5/6] w-full max-w-md">
      {/* organized-state frame hint */}
      <motion.div
        className="absolute inset-0 rounded-[28px] border border-white/10"
        animate={{ opacity: phase === 2 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* The Guild Seal forms in the centre */}
      <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
        <motion.div
          animate={{
            opacity: phase >= 1 ? 1 : 0,
            scale: phase === 1 ? 1 : phase === 2 ? 0.42 : 0.6,
            y: phase === 2 ? "-118%" : "0%",
          }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
        >
          <GuildSeal size={132} active={phase >= 1} />
        </motion.div>
      </div>

      {/* provider chips */}
      {CHIPS.map((c) => {
        const organized = phase === 2 && c.verified;
        const faded = phase === 2 && !c.verified;
        const pos = organized ? c.grid : c.scatter;
        return (
          <motion.div
            key={c.id}
            className="absolute z-10 w-[40%]"
            animate={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              rotate: organized ? 0 : c.scatter.rot,
              opacity: faded ? 0 : phase === 1 ? 0.35 : 1,
              scale: faded ? 0.85 : 1,
              filter: phase === 1 ? "blur(2px)" : "blur(0px)",
            }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            <div
              className={`flex items-center gap-2 rounded-2xl border px-2.5 py-2 backdrop-blur-md transition-colors ${
                organized
                  ? "border-[#ffb74d]/30 bg-white/[0.07]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                  c.verified ? "bg-gradient-to-br from-[#3949ab] to-[#1a237e]" : "bg-white/10"
                }`}
              >
                {c.verified ? (
                  <span className="text-[10px] font-extrabold text-white">{c.name[0]}</span>
                ) : (
                  <HelpCircle className="h-4 w-4 text-white/40" />
                )}
              </span>
              <div className="min-w-0">
                <p className={`truncate text-[11px] font-bold ${c.verified ? "text-white" : "text-white/40"}`}>
                  {c.verified ? c.name : "Unverified"}
                </p>
                <AnimatePresence>
                  {organized && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-1 text-[9px] font-bold text-[#34d399]"
                    >
                      <ShieldCheck className="h-2.5 w-2.5" /> Verified
                      <Star className="ml-0.5 h-2.5 w-2.5 fill-[#ffb74d] text-[#ffb74d]" />
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {/* floating question mark for the chaotic state */}
              {!c.verified && phase !== 2 && (
                <motion.span
                  className="absolute -right-1 -top-2 text-xs font-black text-white/30"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ?
                </motion.span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
