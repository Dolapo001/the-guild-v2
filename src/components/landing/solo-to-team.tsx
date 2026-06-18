"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, CalendarDays } from "lucide-react";
import { useInViewSequence } from "@/hooks/use-in-view-sequence";
import { Eyebrow, Reveal, TransitionTag } from "./primitives";

const CAPTION = [
  "One professional, working solo",
  "A personal calendar takes shape",
  "Bookings start coming in",
  "Demand keeps growing",
  "Team members join",
  "Shared schedules align",
  "An agency dashboard emerges",
];

export function SoloToTeam() {
  // 0 solo · 1 calendar · 2 bookings · 3 demand · 4 team · 5 schedules · 6 dashboard
  const { ref, step } = useInViewSequence(7, { interval: 950, loop: true });

  const teamCount = step >= 4 ? 4 : 1;
  const bookings = step < 2 ? 2 : step === 2 ? 9 : step >= 3 ? 27 : 2;
  const filled = step < 2 ? 1 : step === 2 ? 4 : step >= 3 ? 9 : 1;
  const bars = [40, 55, 48, 70, 62, 88, 76];

  return (
    <section id="growth" ref={ref} className="relative px-6 py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow>
            <Users className="h-3.5 w-3.5 text-[#ffb74d]" /> Solo to Team
          </Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Start independently. Scale professionally.
          </h2>
          <div className="mt-4">
            <TransitionTag from="Freelancer" to="Business Owner" />
          </div>
          <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-white/55">
            Begin as a one-person operation and grow into a full team — shared
            schedules, staff payouts and agency analytics — without ever leaving
            the platform.
          </p>
          <p className="mt-6 text-sm font-bold text-white/70">{CAPTION[step]}</p>
        </Reveal>

        {/* evolving dashboard */}
        <Reveal delay={0.1}>
          <div className="rounded-[28px] border border-white/10 bg-[#0c1022]/90 p-5 shadow-[0_30px_80px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            {/* header — team grows */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {Array.from({ length: teamCount }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="h-8 w-8 rounded-full border-2 border-[#0c1022] bg-gradient-to-br from-[#3949ab] to-[#1a237e]"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{step >= 4 ? "Bella Glam Studio" : "Bella · Solo"}</p>
                  <p className="text-[11px] font-semibold text-white/45">
                    {step >= 4 ? `${teamCount} team members` : "Independent pro"}
                  </p>
                </div>
              </div>
              <motion.span
                key={bookings}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/10 px-2.5 py-1 text-[11px] font-bold text-[#34d399]"
              >
                <TrendingUp className="h-3 w-3" /> {bookings} bookings
              </motion.span>
            </div>

            {/* calendar */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-5 overflow-hidden"
                >
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                    <CalendarDays className="h-3.5 w-3.5" /> {step >= 5 ? "Shared schedule" : "Calendar"}
                  </div>
                  <div className="grid grid-cols-9 gap-1.5">
                    {Array.from({ length: step >= 5 ? 27 : 9 }).map((_, i) => {
                      const on = i < (step >= 5 ? filled * 2 + 6 : filled);
                      return (
                        <motion.span
                          key={i}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: (i % 9) * 0.02 }}
                          className={`h-7 rounded-md ${on ? "bg-[#ffb74d]" : "bg-white/[0.05]"}`}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* analytics — agency dashboard */}
            <AnimatePresence>
              {step >= 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 grid grid-cols-3 gap-3"
                >
                  <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Revenue</p>
                    <p className="text-lg font-extrabold text-white">₦4.2M</p>
                    <p className="text-[10px] font-bold text-[#34d399]">▲ 32%</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex h-14 items-end gap-1.5">
                      {bars.map((h, i) => (
                        <motion.span
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex-1 rounded-sm ${i === 5 ? "bg-[#ffb74d]" : "bg-white/15"}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
