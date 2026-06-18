"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";
import { usePWA } from "@/hooks/use-pwa";
import { toast } from "sonner";

const DISMISS_KEY = "guild-install-banner-dismissed";
// The landing (`/`) has its own install CTA; the install/app screens are their
// own thing — don't stack a banner on top of those.
const HIDE_ON = new Set(["/", "/install", "/app"]);

/**
 * Subtle, dismissible install banner shown only in WEBSITE mode (browser) when
 * the app is installable. Hidden once installed or dismissed.
 */
export function InstallBanner() {
  const { isBrowser, isInstalled, isIOS, canInstall, promptInstall, ready } = usePWA();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const dismissed = typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(isBrowser && !isInstalled && !dismissed && !HIDE_ON.has(pathname) && (canInstall || isIOS));
  }, [ready, isBrowser, isInstalled, canInstall, isIOS, pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  const onInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "ios") {
      toast.message("In Safari: tap Share → Add to Home Screen.");
    } else if (outcome === "accepted") {
      setShow(false);
    } else if (outcome === "unavailable") {
      toast.message("Open your browser menu and choose “Install app”.");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0e1c]/95 p-3 pl-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          role="dialog"
          aria-label="Install The Guild"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
            <Sparkles className="h-4 w-4 text-[#ffb74d]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Install The Guild</p>
            <p className="truncate text-[11px] text-white/55">Faster, offline-ready, on your home screen.</p>
          </div>
          <button
            onClick={onInstall}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-[13px] font-bold text-[#0b0f1f]"
          >
            <Download className="h-4 w-4" /> Install
          </button>
          <button onClick={dismiss} aria-label="Dismiss" className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
