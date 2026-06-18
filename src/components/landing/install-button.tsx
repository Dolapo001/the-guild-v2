"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, ArrowUpRight, Share, Plus, X, Apple } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { toast } from "sonner";

type Tone = "solid" | "glass";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm rounded-xl",
  md: "h-12 px-6 text-[15px] rounded-2xl",
  lg: "h-16 px-9 text-lg rounded-2xl",
};

/**
 * The single dominant call to action of the landing page.
 * Reused in the nav, hero, scroll waypoints and final section.
 */
export function InstallButton({
  size = "md",
  tone = "solid",
  className,
  label = "Install App",
}: {
  size?: Size;
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [iosOpen, setIosOpen] = useState(false);

  const onClick = async () => {
    const outcome = await promptInstall();
    if (outcome === "ios") {
      setIosOpen(true);
    } else if (outcome === "accepted") {
      toast.success("Installing The Guild — check your home screen.");
    } else if (outcome === "unavailable") {
      // Desktop browsers that don't expose the prompt, or already dismissed.
      toast.message("Open your browser menu and choose “Install app / Add to Home Screen”.");
    }
  };

  if (isInstalled) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold bg-accent/10 text-accent border border-accent/20",
          sizeClasses[size],
          className,
        )}
      >
        <Check className="h-5 w-5" /> Installed
      </span>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        aria-label={label}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2.5 font-bold tracking-tight overflow-hidden",
          sizeClasses[size],
          tone === "solid"
            ? "bg-white text-[#0b0f1f] shadow-[0_8px_30px_rgba(255,255,255,0.18)]"
            : "bg-white/10 text-white border border-white/20 backdrop-blur-xl hover:bg-white/15",
          className,
        )}
      >
        {/* sheen */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <Download className="h-5 w-5" />
        {label}
        {canInstall && tone === "solid" && (
          <span className="ml-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {iosOpen && <IOSInstallSheet onClose={() => setIosOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function IOSInstallSheet({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: Share, text: "Tap the Share icon in Safari's toolbar." },
    { icon: Plus, text: "Choose “Add to Home Screen”." },
    { icon: Check, text: "Open The Guild from your home screen." },
  ];
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0b0f1f] p-7 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
              <Apple className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold">Install on iPhone</h3>
              <p className="text-xs text-white/50 font-medium">Two taps to your home screen.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/10">
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3">
              <span className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <s.icon className="h-5 w-5 text-accent shrink-0" />
              <p className="text-sm font-medium text-white/80">{s.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Compact secondary action (used at most once, per the single-CTA rule). */
export function WatchDemoButton({ className }: { className?: string }) {
  return (
    <a
      href="#workflow"
      className={cn(
        "inline-flex items-center gap-2 h-12 px-6 rounded-2xl text-[15px] font-bold text-white/80 border border-white/15 hover:bg-white/5 transition-colors",
        className,
      )}
    >
      Watch Demo <ArrowUpRight className="h-4 w-4" />
    </a>
  );
}
