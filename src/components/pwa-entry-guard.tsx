"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * PWA Entry Guard
 * This component runs on the client to detect PWA launch and ensure the correct
 * onboarding or dashboard routing based on authentication status.
 * It explicitly avoids breaking deep links (e.g. /marketplace/something).
 */
export function PwaEntryGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if running as installed PWA
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Strict Rule: If NOT running as an installed PWA, restrict access to ONLY the landing page.
    if (!isStandalone) {
      setIsRedirecting(false);
      if (pathname !== "/") {
        window.location.replace("/");
      }
      return;
    }

    // We only intercept routing if they land on the root (which is the install funnel)
    // OR if they launched via the PWA start_url (source=pwa).
    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get("source");
    const isEntryLaunch = pathname === "/" || source === "pwa";

    // Not an entry launch (e.g. PWAModeSync/AppEntry already moved us to /app or
    // a dashboard). Make sure the overlay is cleared so it can never get stuck
    // covering the screen — this was the cause of the "infinite spinner".
    if (!isEntryLaunch) {
      setIsRedirecting(false);
      return;
    }

    // We are launching the PWA entry. Show the loading overlay to hide the landing page.
    setIsRedirecting(true);

    if (isLoading) return;

    // Detect if this is the first time launching the PWA
    const hasLaunchedBefore = localStorage.getItem("has_launched_pwa");
    const isNewInstall = !hasLaunchedBefore;

    if (isNewInstall) {
      localStorage.setItem("has_launched_pwa", "true");
    }

    if (!user) {
      // Unauthenticated users go to onboarding or login
      if (isNewInstall) {
        window.location.replace("/register");
      } else {
        window.location.replace("/login");
      }
    } else {
      // Authenticated users go to their respective dashboard
      const dashboardRoute =
        user.role === "ceo"
          ? "/home"
          : user.role === "staff"
          ? "/staff-portal"
          : user.role === "admin"
          ? "/admin"
          : "/customer";
      window.location.replace(dashboardRoute);
    }
  }, [isLoading, user, pathname]);

  // Watchdog: the overlay should only ever be transient. If anything keeps it up
  // longer than expected (e.g. an unexpected auth stall), drop it so the user is
  // never left staring at a spinner with no way forward.
  useEffect(() => {
    if (!isRedirecting) return;
    const timer = setTimeout(() => setIsRedirecting(false), 18000);
    return () => clearTimeout(timer);
  }, [isRedirecting]);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#05070f]">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 shadow-2xl">
          <div className="absolute inset-0 rounded-2xl border-2 border-white/10"></div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-transparent border-t-[#3949ab]"></div>
        </div>
      </div>
    );
  }

  return null;
}
