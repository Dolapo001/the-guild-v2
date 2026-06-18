"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, LockOpen, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { useInViewSequence } from "@/hooks/use-in-view-sequence";
import { GuildSeal } from "./guild-seal";
import { Eyebrow, Reveal, TransitionTag } from "./primitives";

const STATUS = [
  "Customer taps Pay",
  "Funds enter the vault",
  "Vault locked — money held safely",
  "Booking in progress",
  "Job completed",
  "Completion verified",
  "Funds released to provider",
];

export function EscrowVault() {
  // 0 pay · 1 coin in · 2 lock · 3 progress · 4 complete · 5 verify · 6 release
  const { ref, step } = useInViewSequence(7, { interval: 1000, loop: true });
  const locked = step >= 2 && step < 6;
  const released = step >= 6;

  return (
    <section id="escrow" ref={ref} className="relative px-6 py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>
            <ShieldCheck className="h-3.5 w-3.5 text-[#ffb74d]" /> The Escrow Vault
          </Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your money is held, not gambled.
          </h2>
          <div className="mt-4">
            <TransitionTag from="Risk" to="Security" />
          </div>
          <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-white/55">
            Payment is locked in a secure vault the moment you book. It only
            releases to the provider once the job is verified complete — so
            neither side has to trust the other blindly.
          </p>
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#3949ab] via-[#ffb74d] to-[#34d399]"
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <p className="mt-3 text-sm font-bold text-white/70">{STATUS[step]}</p>
        </Reveal>

        {/* Vault stage */}
        <Reveal delay={0.1}>
          <div className="relative mx-auto flex h-[26rem] w-full max-w-md items-center justify-between rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(57,73,171,0.18),transparent_70%)] p-6">
            {/* customer */}
            <div className="z-10 flex flex-col items-center gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-[11px] font-bold text-white/70">You</span>
              <motion.span
                animate={{ scale: step === 0 ? [1, 0.9, 1] : 1, opacity: step >= 1 ? 0.4 : 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-xl bg-[#ffb74d] px-3 py-1.5 text-[11px] font-extrabold text-[#0b0f1f]"
              >
                Pay
              </motion.span>
            </div>

            {/* vault */}
            <div className="relative z-10 grid place-items-center">
              <motion.div
                animate={{
                  boxShadow: locked
                    ? "0 0 0 1px rgba(255,183,77,0.4), 0 30px 70px -20px rgba(255,183,77,0.25)"
                    : "0 0 0 1px rgba(255,255,255,0.1), 0 30px 70px -25px rgba(0,0,0,0.6)",
                }}
                className="relative h-40 w-40 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl"
              >
                {/* glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
                <div className="absolute -left-6 top-0 h-full w-10 rotate-12 bg-white/10 blur-md" />

                {/* contents */}
                <div className="absolute inset-0 grid place-items-center">
                  {/* coin */}
                  <AnimatePresence>
                    {step >= 1 && !released && (
                      <motion.div
                        initial={{ y: -120, opacity: 0, scale: 0.6 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ x: 160, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 180, damping: 16 }}
                        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#ffd180] to-[#ffb74d] text-lg font-black text-[#0b0f1f] shadow-lg"
                      >
                        ₦
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* verification seal */}
                  {step === 5 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute">
                      <GuildSeal size={96} active />
                    </motion.div>
                  )}
                  {/* completed check */}
                  {step === 4 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute grid h-12 w-12 place-items-center rounded-full bg-[#34d399]/20 text-[#34d399]"
                    >
                      <Check className="h-7 w-7" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                {/* lock badge */}
                <motion.div
                  animate={{ scale: locked ? 1 : 0.9, opacity: 1 }}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-[#0a0e1c]"
                >
                  <AnimatePresence mode="wait">
                    {locked ? (
                      <motion.span key="l" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Lock className="h-4 w-4 text-[#ffb74d]" />
                      </motion.span>
                    ) : (
                      <motion.span key="u" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <LockOpen className="h-4 w-4 text-[#34d399]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* progress sweep */}
                {step === 3 && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1.5 bg-[#ffb74d]"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1 }}
                  />
                )}
              </motion.div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">Escrow vault</p>
            </div>

            {/* provider */}
            <div className="z-10 flex flex-col items-center gap-2">
              <motion.span
                animate={{
                  scale: released ? [1, 1.15, 1] : 1,
                  boxShadow: released ? "0 0 0 2px rgba(52,211,153,0.5)" : "0 0 0 0 transparent",
                }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#3949ab] to-[#1a237e] text-[11px] font-bold text-white"
              >
                Pro
              </motion.span>
              <AnimatePresence>
                {released && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-[#34d399]/15 px-2.5 py-1 text-[11px] font-extrabold text-[#34d399]"
                  >
                    +₦42k
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* release arrow */}
            <AnimatePresence>
              {released && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-1/2 top-1/2 -translate-y-1/2 text-[#34d399]"
                >
                  <ArrowRight className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
