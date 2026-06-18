"use client";

import { useCallback, useEffect, useState } from "react";

export type PWAMode = "standalone" | "browser";
export type InstallState = "unsupported" | "installable" | "installed";
export type InstallOutcome = "accepted" | "dismissed" | "unavailable" | "ios";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Centralized PWA state. Distinguishes WEBSITE mode (browser tab) from APP mode
 * (launched standalone from the home screen), and exposes install capability +
 * status. The single source of truth for install banners, the /app entry point
 * and the app-mode guard.
 */
export function usePWA() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  // until the first client effect runs we don't know the mode — used to avoid
  // SSR/first-paint flashes in consumers.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const standalone = detectStandalone();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(ios);
    setIsStandalone(standalone);
    setIsInstalled(standalone);
    setReady(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferred(null);
    };
    const mq = window.matchMedia("(display-mode: standalone)");
    const onModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    mq.addEventListener?.("change", onModeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener?.("change", onModeChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (isIOS) return "ios";
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
    return outcome;
  }, [deferred, isIOS]);

  const installState: InstallState = isInstalled ? "installed" : deferred ? "installable" : "unsupported";

  return {
    /** True once client-side detection has run (use to gate first paint). */
    ready,
    mode: (isStandalone ? "standalone" : "browser") as PWAMode,
    isStandalone,
    isBrowser: !isStandalone,
    isIOS,
    isInstalled,
    canInstall: Boolean(deferred),
    installState,
    promptInstall,
  };
}
