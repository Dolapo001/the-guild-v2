"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Minimal shape of the (non-standard) beforeinstallprompt event.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallOutcome = "accepted" | "dismissed" | "unavailable" | "ios";

/**
 * Single source of truth for PWA install state across the landing page.
 *
 * - Captures `beforeinstallprompt` so any "Install App" CTA can trigger the
 *   native prompt on demand.
 * - Detects whether the app is already installed (display-mode: standalone or
 *   the iOS `navigator.standalone` flag) so CTAs can adapt.
 * - Detects iOS, which has no programmatic prompt — callers show the
 *   "Add to Home Screen" instructions instead.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    // Detection is deferred to post-mount on purpose: server render and the
    // client's first render must match (both "not installed") to avoid a
    // hydration mismatch; we reconcile to the real device state here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(ios);
    setIsInstalled(Boolean(standalone));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (isIOS) return "ios";
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt, isIOS]);

  return {
    /** A native prompt is queued and ready to fire. */
    canInstall: Boolean(deferredPrompt),
    /** App already runs as an installed PWA. */
    isInstalled,
    isIOS,
    promptInstall,
  };
}
