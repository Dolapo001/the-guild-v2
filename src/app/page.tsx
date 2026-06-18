"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ShieldCheck,
  WifiOff,
  Zap,
  BellRing,
  Smartphone,
  Gauge,
  Fingerprint,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Wallet,
  CalendarCheck,
  Search,
  Star,
} from "lucide-react";
import { InstallButton, WatchDemoButton } from "@/components/landing/install-button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                      */
/* ------------------------------------------------------------------ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation (glass, persistent Install CTA)                         */
/* ------------------------------------------------------------------ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <nav
        className={`flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-300 ${scrolled
            ? "border border-white/10 bg-[#0a0e1c]/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            : "border border-transparent"
          }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-9 w-9 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
            <img src="/logo.png" alt="The Guild" className="h-full w-full object-cover" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-white">The Guild</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {[
            ["Preview", "#preview"],
            ["Why install", "#why"],
            ["Workflow", "#workflow"],
            ["Intelligence", "#ai"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-semibold text-white/55 transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </div>

        <InstallButton size="sm" />
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  App-preview mock (real-UI feel, built from primitives)             */
/* ------------------------------------------------------------------ */

function AppPreview() {
  const bars = [38, 62, 45, 78, 56, 90, 70];
  return (
    <div className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0c1022]/90 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-bold text-white/40">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <WifiOff className="h-3 w-3 text-[#34d399]" /> Offline ready
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-white/40">Good morning</p>
          <p className="text-base font-extrabold text-white">Your business pulse</p>
        </div>
        <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#3949ab] to-[#1a237e]" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-white/50">Revenue · this week</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/10 px-2 py-0.5 text-[10px] font-bold text-[#34d399]">
            <TrendingUp className="h-3 w-3" /> 18%
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">₦2,480,900</p>
        <div className="mt-4 flex h-20 items-end gap-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
              className={`flex-1 rounded-md ${i === 5 ? "bg-[#ffb74d]" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {[
          { name: "Deep clean · VI", tag: "In progress", tone: "text-[#ffb74d] bg-[#ffb74d]/10" },
          { name: "Catering · Lekki", tag: "Confirmed", tone: "text-[#34d399] bg-[#34d399]/10" },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-lg bg-white/10" />
              <span className="text-[13px] font-semibold text-white/85">{r.name}</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.tone}`}>{r.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const trust = [
    { icon: WifiOff, label: "Works offline" },
    { icon: Zap, label: "Lightning fast" },
    { icon: ShieldCheck, label: "Secure by design" },
  ];

  return (
    <section ref={ref} className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-16">
      <motion.div style={{ y: yA }} className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-[#1a237e]/40 blur-[120px]" />
      <motion.div style={{ y: yB }} className="pointer-events-none absolute -right-32 top-40 h-[28rem] w-[28rem] rounded-full bg-[#00695c]/25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(57,73,171,0.25),transparent_60%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <Eyebrow>
              <Sparkles className="h-3.5 w-3.5 text-[#ffb74d]" /> Install-first · PWA
            </Eyebrow>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              The verified marketplace,
              <br />
              <span className="bg-gradient-to-r from-white via-[#c5cae9] to-[#ffb74d] bg-clip-text text-transparent">
                installed on your device.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/55">
              Book trusted pros, run your business, and move money — in a fast,
              offline-ready app that lives on your home screen. No browser tabs.
              No friction.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <InstallButton size="lg" />
              <WatchDemoButton />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trust.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-2 text-sm font-semibold text-white/50">
                  <t.icon className="h-4 w-4 text-[#34d399]" />
                  {t.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative mx-auto">
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <AppPreview />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 top-20 hidden rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl sm:block"
          >
            <p className="flex items-center gap-2 text-xs font-bold text-white">
              <BellRing className="h-4 w-4 text-[#ffb74d]" /> New booking
            </p>
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 bottom-16 hidden rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl sm:block"
          >
            <p className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-[#34d399]" /> Verified pro
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Product preview section                                            */
/* ------------------------------------------------------------------ */

function PreviewTile({ title, icon: Icon, accent, children }: { title: string; icon: typeof Search; accent: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}33` }}>
          <Icon className="h-4 w-4" style={{ color: accent === "#1a237e" ? "#7986cb" : accent }} />
        </span>
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

function PreviewSection() {
  return (
    <section id="preview" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Real product · not a mockup</Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            See the app before you install it.
          </h2>
          <p className="mt-4 text-lg font-medium text-white/55">
            Every screen below is the real interface — the same one that lands on your home screen.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-2 shadow-[0_40px_120px_-30px_rgba(26,35,126,0.6)]">
            <div className="grid gap-2 rounded-[26px] bg-[#0a0e1c] p-6 md:grid-cols-3">
              <PreviewTile title="Discover" icon={Search} accent="#3949ab">
                <div className="space-y-2">
                  {["Glow Spa", "Prestige Catering", "SwiftClean"].map((n, i) => (
                    <div key={n} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
                        <span className="h-6 w-6 rounded-md bg-white/10" />
                        {n}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#ffb74d]">
                        <Star className="h-3 w-3 fill-current" /> {(4.7 + i * 0.1).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </PreviewTile>

              <PreviewTile title="Book" icon={CalendarCheck} accent="#00695c">
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className={`flex h-9 items-center justify-center rounded-lg text-[11px] font-bold ${i === 5 ? "bg-[#ffb74d] text-[#0b0f1f]" : "bg-white/[0.04] text-white/50"
                        }`}
                    >
                      {9 + i}
                    </span>
                  ))}
                </div>
                <div className="mt-3 rounded-xl bg-[#34d399]/10 px-3 py-2 text-[12px] font-bold text-[#34d399]">
                  Slot held · 2:00 PM
                </div>
              </PreviewTile>

              <PreviewTile title="Pay" icon={Wallet} accent="#1a237e">
                <p className="text-[11px] font-semibold text-white/45">Escrow balance</p>
                <p className="text-xl font-extrabold text-white">₦184,500</p>
                <div className="mt-3 space-y-2">
                  {["Escrow locked", "Released to pro"].map((t, i) => (
                    <div key={t} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-[12px]">
                      <span className="font-semibold text-white/70">{t}</span>
                      <span className={`font-bold ${i ? "text-[#34d399]" : "text-white/50"}`}>{i ? "+₦42k" : "₦42k"}</span>
                    </div>
                  ))}
                </div>
              </PreviewTile>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why install                                                        */
/* ------------------------------------------------------------------ */

function WhyInstall() {
  const reasons = [
    { icon: WifiOff, title: "Works offline", body: "Your bookings, wallet and chats stay available even with no signal — synced the moment you reconnect." },
    { icon: Gauge, title: "Instantly fast", body: "Cached and compiled to your device. Opens in a tap, no page loads, no spinners." },
    { icon: BellRing, title: "Push notifications", body: "Real-time alerts for bookings, payments and messages — even when the app is closed." },
    { icon: Smartphone, title: "Home-screen native", body: "Full-screen, no browser chrome. It looks and feels like software you own." },
    { icon: Fingerprint, title: "Secure by design", body: "httpOnly sessions and device-bound auth. Nothing sensitive ever lives in the browser." },
    { icon: Zap, title: "Device integration", body: "Camera for verification, location for discovery, share targets — wired into your OS." },
  ];
  return (
    <section id="why" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>Installation is the upgrade</Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            The browser is the demo. The app is the product.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a237e]/40 text-[#9fa8da] transition-colors group-hover:bg-[#ffb74d]/15 group-hover:text-[#ffb74d]">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-white">{r.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/55">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Workflow demonstration                                             */
/* ------------------------------------------------------------------ */

function Workflow() {
  const steps = [
    { tag: "Problem", title: "You need a verified pro — fast.", body: "Search by service and location. Only KYC-verified businesses surface.", icon: Search },
    { tag: "Action", title: "Book and lock funds in escrow.", body: "Pick a slot, pay into escrow. The pro is notified instantly via push.", icon: CalendarCheck },
    { tag: "Response", title: "The system coordinates everything.", body: "Status updates, staff assignment and live chat — all in real time.", icon: Zap },
    { tag: "Outcome", title: "Job done, funds released.", body: "Confirm completion and escrow releases automatically. Leave a review.", icon: CheckCircle2 },
  ];
  return (
    <section id="workflow" className="relative px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>A real journey · start to finish</Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            From problem to outcome, in one app.
          </h2>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-[27px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-[#3949ab] via-white/10 to-transparent md:block" />
          <div className="space-y-4">
            {steps.map((s, i) => (
              <Reveal key={s.tag} delay={i * 0.08}>
                <div className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0c1022] ring-1 ring-white/10">
                    <s.icon className="h-6 w-6 text-[#ffb74d]" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9fa8da]">{s.tag}</span>
                    <h3 className="mt-1 text-xl font-extrabold text-white">{s.title}</h3>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-white/55">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-12 flex justify-center">
          <InstallButton size="md" />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  AI layer                                                           */
/* ------------------------------------------------------------------ */

function AILayer() {
  const lines = [
    { from: "user", text: "Find a verified caterer in Lekki for Saturday, under ₦150k." },
    { from: "ai", text: "3 verified matches. Prestige Catering has a 2 PM slot and 4.9★. Hold it?" },
    { from: "user", text: "Yes, lock the slot and pay into escrow." },
    { from: "ai", text: "Done. Slot held, ₦120k in escrow, receipt saved. I'll remind you Friday." },
  ];
  return (
    <section id="ai" className="relative px-6 py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>
            <Sparkles className="h-3.5 w-3.5 text-[#ffb74d]" /> Maestro · native intelligence
          </Eyebrow>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            An assistant that runs the workflow, not just the chat.
          </h2>
          <p className="mt-4 text-lg font-medium leading-relaxed text-white/55">
            Maestro understands intent, ranks verified providers, books, and moves
            money for you — embedded in the app, working even as you switch screens.
          </p>
          <ul className="mt-6 space-y-3">
            {["Intent-aware provider ranking", "Automated booking & escrow", "Proactive reminders & follow-ups"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm font-semibold text-white/70">
                <CheckCircle2 className="h-5 w-5 text-[#34d399]" /> {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[28px] border border-white/10 bg-[#0c1022]/90 p-5 shadow-[0_30px_80px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3949ab] to-[#1a237e]">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm font-bold text-white">Maestro</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#34d399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" /> online
              </span>
            </div>
            <div className="space-y-2.5">
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.25 }}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-snug ${l.from === "ai" ? "bg-white/[0.05] text-white/85" : "ml-auto bg-[#3949ab] text-white"
                    }`}
                >
                  {l.text}
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Social proof (metrics)                                             */
/* ------------------------------------------------------------------ */

function Metrics() {
  const stats = [
    { value: "12k+", label: "Verified providers" },
    { value: "98%", label: "Jobs completed on time" },
    { value: "₦1.4B", label: "Secured in escrow" },
    { value: "4.9★", label: "Average app rating" },
  ];
  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.02] px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final conversion                                                   */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(57,73,171,0.5),transparent_55%)]" />
      <Reveal className="relative mx-auto max-w-3xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
          <Smartphone className="h-7 w-7 text-white" />
        </span>
        <h2 className="mt-7 text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
          Install to continue.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-white/60">
          The Guild lives on your home screen — verified, offline-ready and built for
          how you actually work. One tap is all it takes.
        </p>
        <div className="mt-10 flex justify-center">
          <InstallButton size="lg" />
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Minimal footer (no competing CTAs)                                 */
/* ------------------------------------------------------------------ */

function MiniFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-8 w-8 overflow-hidden rounded-lg bg-white/10">
            <img src="/logo.png" alt="The Guild" className="h-full w-full object-cover" />
          </span>
          <span className="text-sm font-extrabold text-white">The Guild</span>
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">© 2026 The Guild</p>
        <div className="flex gap-6">
          <Link href="/legal/privacy" className="text-xs font-bold uppercase tracking-[0.14em] text-white/35 hover:text-white/70">Privacy</Link>
          <Link href="/legal/terms" className="text-xs font-bold uppercase tracking-[0.14em] text-white/35 hover:text-white/70">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky mobile install bar (persistent reminder)                    */
/* ------------------------------------------------------------------ */

function StickyInstallBar() {
  const { isInstalled } = useInstallPrompt();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (isInstalled) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a0e1c]/90 p-3 pl-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:hidden"
        >
          <p className="text-sm font-bold text-white">Get the full experience</p>
          <InstallButton size="sm" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070f] text-white antialiased">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <PreviewSection />
        <WhyInstall />
        <Workflow />
        <AILayer />
        <Metrics />
        <FinalCTA />
        <MiniFooter />
        <StickyInstallBar />
      </div>
    </main>
  );
}
