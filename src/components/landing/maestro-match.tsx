"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Sparkles } from "lucide-react";
import { useInViewSequence } from "@/hooks/use-in-view-sequence";
import { GuildSeal } from "./guild-seal";
import { Eyebrow, Reveal, TransitionTag } from "./primitives";

const SCORES = [
  { label: "Distance", value: 92 },
  { label: "Reputation", value: 88 },
  { label: "Availability", value: 95 },
  { label: "Completeness", value: 90 },
];
const REASONS = ["Close", "Verified", "Available", "Highly Rated"];
const DOTS = [
  { x: 28, y: 34, best: false },
  { x: 62, y: 22, best: false },
  { x: 46, y: 56, best: true },
  { x: 74, y: 64, best: false },
  { x: 20, y: 70, best: false },
];

export function MaestroMatch() {
  // 0 query · 1 map · 2 candidates · 3 scoring · 4 confidence · 5 reasons · 6 selected
  const { ref, step } = useInViewSequence(7, { interval: 900, loop: true });

  return (
    <section id="ai" ref={ref} className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>
            <Sparkles className="h-3.5 w-3.5 text-[#ffb74d]" /> The Maestro Match
          </Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            We don&apos;t just return results. We explain why.
          </h2>
          <div className="mt-4 flex justify-center">
            <TransitionTag from="Confusion" to="Clarity" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-2 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-2 shadow-[0_40px_120px_-30px_rgba(26,35,126,0.6)] lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT — query + reasoning map */}
            <div className="rounded-[26px] bg-[#0a0e1c] p-6">
              {/* search query */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <Search className="h-4 w-4 text-white/50" />
                <span className="text-sm font-semibold text-white/90">
                  Bridal Makeup, Lekki
                  {step === 0 && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>}
                </span>
              </div>

              {/* map */}
              <div className="relative mt-4 h-64 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(57,73,171,0.18),transparent_70%)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <AnimatePresence>
                  {step >= 1 &&
                    DOTS.map((d, i) => {
                      const visible = step >= 2 || !d.best;
                      const selected = step >= 6 && d.best;
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
                          transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 18 }}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${d.x}%`, top: `${d.y}%` }}
                        >
                          {selected ? (
                            <span className="relative grid place-items-center">
                              <span className="absolute h-10 w-10 animate-ping rounded-full bg-[#ffb74d]/30" />
                              <MapPin className="h-7 w-7 fill-[#ffb74d] text-[#1a237e]" />
                            </span>
                          ) : (
                            <span className={`block h-3 w-3 rounded-full ${d.best ? "bg-[#ffb74d]" : "bg-white/30"}`} />
                          )}
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
                {step < 1 && (
                  <div className="absolute inset-0 grid place-items-center text-xs font-bold uppercase tracking-widest text-white/30">
                    Activating map…
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — scoring + confidence + reasons */}
            <div className="flex flex-col rounded-[26px] bg-[#0c1022] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Maestro evaluation</p>

              <div className="mt-4 space-y-3">
                {SCORES.map((s, i) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[12px] font-semibold text-white/70">
                      <span>{s.label}</span>
                      <span className={step >= 3 ? "text-white" : "text-white/30"}>{step >= 3 ? s.value : "—"}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#3949ab] to-[#ffb74d]"
                        initial={{ width: 0 }}
                        animate={{ width: step >= 3 ? `${s.value}%` : 0 }}
                        transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* confidence — the seal becomes the score */}
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <GuildSeal size={72} active={step >= 4} label={step >= 4 ? "93" : undefined} />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">Confidence score</p>
                  <p className="text-2xl font-extrabold text-white">{step >= 4 ? "93% match" : "Calculating…"}</p>
                </div>
              </div>

              {/* reason chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <AnimatePresence>
                  {step >= 5 &&
                    REASONS.map((r, i) => (
                      <motion.span
                        key={r}
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1 text-[11px] font-bold text-[#34d399]"
                      >
                        {r}
                      </motion.span>
                    ))}
                </AnimatePresence>
              </div>

              {/* selected provider */}
              <motion.div
                animate={{ opacity: step >= 6 ? 1 : 0.25, borderColor: step >= 6 ? "rgba(255,183,77,0.4)" : "rgba(255,255,255,0.1)" }}
                className="mt-auto flex items-center justify-between rounded-2xl border bg-white/[0.04] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#3949ab] to-[#1a237e]" />
                  <div>
                    <p className="text-sm font-bold text-white">Bella Glam Studio</p>
                    <p className="text-[11px] font-semibold text-white/50">Lekki Phase 1 · 1.2km away</p>
                  </div>
                </div>
                {step >= 6 && (
                  <span className="rounded-full bg-[#ffb74d] px-3 py-1 text-[11px] font-extrabold text-[#0b0f1f]">Best match</span>
                )}
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
