"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * The Guild Seal — the recurring symbol of trust across the whole narrative.
 * Verifies providers (hero), becomes a confidence score (matching), secures
 * the vault (escrow) and signals credibility (growth).
 *
 * `active` plays the "form-in" animation (rings draw, glow blooms, mark pops).
 * `label` swaps the centre mark for a value (e.g. a confidence score).
 */
export function GuildSeal({
  size = 96,
  active = true,
  label,
  className,
}: {
  size?: number;
  active?: boolean;
  label?: string;
  className?: string;
}) {
  const r = size / 2;
  const ticks = Array.from({ length: 24 });

  return (
    <div className={className} style={{ width: size, height: size }}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative grid place-items-center"
        style={{ width: size, height: size }}
      >
        {/* glow */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,183,77,0.55), transparent 65%)" }}
          animate={active ? { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] } : { opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
          <defs>
            <linearGradient id="seal-core" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3949ab" />
              <stop offset="100%" stopColor="#1a237e" />
            </linearGradient>
          </defs>

          {/* rotating tick ring */}
          <motion.g
            animate={active ? { rotate: 360 } : {}}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50%", originY: "50%" }}
          >
            {ticks.map((_, i) => {
              const a = (i / ticks.length) * Math.PI * 2;
              const inner = r - 9;
              const outer = r - 4;
              return (
                <line
                  key={i}
                  x1={r + Math.cos(a) * inner}
                  y1={r + Math.sin(a) * inner}
                  x2={r + Math.cos(a) * outer}
                  y2={r + Math.sin(a) * outer}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              );
            })}
          </motion.g>

          {/* drawn outer ring */}
          <motion.circle
            cx={r}
            cy={r}
            r={r - 13}
            fill="none"
            stroke="#ffb74d"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={active ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />

          {/* core */}
          <motion.circle
            cx={r}
            cy={r}
            r={r - 22}
            fill="url(#seal-core)"
            initial={{ scale: 0 }}
            animate={active ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 16 }}
            style={{ originX: "50%", originY: "50%" }}
          />
        </svg>

        {/* centre mark */}
        <motion.div
          className="absolute grid place-items-center font-extrabold text-white"
          initial={{ scale: 0, opacity: 0 }}
          animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 15 }}
        >
          {label ? (
            <span style={{ fontSize: size * 0.28 }}>{label}</span>
          ) : (
            <Check style={{ width: size * 0.34, height: size * 0.34 }} strokeWidth={3} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
