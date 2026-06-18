"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Share, Plus, Check, Smartphone, Chrome, Apple, ArrowLeft, Loader2 } from "lucide-react";
import { usePWA } from "@/hooks/use-pwa";
import { toast } from "sonner";

export default function InstallPage() {
  const { isIOS, isInstalled, canInstall, promptInstall, ready } = usePWA();
  const [url, setUrl] = useState("");

  useEffect(() => {
    // origin is only known on the client; read once after mount (SSR-safe)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.origin);
  }, []);

  const onInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "ios") toast.message("Tap Share → Add to Home Screen.");
    else if (outcome === "unavailable") toast.message("Open your browser menu and choose “Install app”.");
    else if (outcome === "accepted") toast.success("Installing — check your home screen.");
  };

  const iosSteps = [
    { icon: Share, text: "Tap the Share icon in Safari's toolbar." },
    { icon: Plus, text: "Choose “Add to Home Screen”." },
    { icon: Check, text: "Open The Guild from your home screen." },
  ];
  const androidSteps = [
    { icon: Download, text: "Tap “Install” below (or the install icon in the address bar)." },
    { icon: Check, text: "Confirm “Install” in the browser dialog." },
    { icon: Smartphone, text: "Launch The Guild from your home screen." },
  ];
  const steps = isIOS ? iosSteps : androidSteps;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#05070f] px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(57,73,171,0.3),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
      >
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            {isIOS ? <Apple className="h-6 w-6" /> : <Chrome className="h-6 w-6" />}
          </span>
          <div>
            <h1 className="text-xl font-extrabold">Install The Guild</h1>
            <p className="text-xs font-medium text-white/50">The Guild runs as an app. Install to continue.</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#34d399]/20 bg-[#34d399]/10 px-4 py-3 text-sm font-bold text-[#34d399]">
            <Check className="h-5 w-5" /> Already installed — open it from your home screen.
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-2.5">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-bold">{i + 1}</span>
                  <s.icon className="h-4 w-4 shrink-0 text-[#ffb74d]" />
                  <p className="text-sm font-medium text-white/80">{s.text}</p>
                </div>
              ))}
            </div>

            {!isIOS && (
              <button
                onClick={onInstall}
                disabled={!ready}
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-bold text-[#0b0f1f] disabled:opacity-60"
              >
                {!ready ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Download className="h-5 w-5" /> Install App</>}
                {ready && !canInstall && <span className="text-xs font-medium opacity-60">(use browser menu)</span>}
              </button>
            )}

            {/* Cross-device: scan to open on a phone */}
            {url && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                {/* best-effort QR; gracefully ignored if the generator is blocked */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&bgcolor=10-16-34&color=255-255-255&data=${encodeURIComponent(url)}`}
                  alt="Scan to open on your phone"
                  width={84}
                  height={84}
                  className="h-20 w-20 shrink-0 rounded-lg"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold">On a desktop?</p>
                  <p className="text-[11px] text-white/55">Scan to open on your phone, then install there.</p>
                  <p className="mt-1 truncate text-[11px] font-mono text-white/40">{url}</p>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </main>
  );
}
