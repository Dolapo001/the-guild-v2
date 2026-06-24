"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types/api";
import { AppSplash } from "@/components/pwa/app-splash";

/**
 * APP ENTRY POINT (`/app`) — the manifest `start_url`.
 *
 * The installed app always launches here. It validates the session and routes:
 *   authenticated   -> role dashboard
 *   unauthenticated -> /login
 * No landing page or marketing content is ever shown in app mode. A splash is
 * displayed until the decision is made, so there are no dashboard flashes.
 */
function dashboardFor(user: User): string {
  switch (user.role) {
    case "customer": return "/customer";
    case "ceo": return "/home";
    case "staff": return "/staff-portal";
    case "admin": return "/admin";
    default: return "/home";
  }
}

export default function AppEntry() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const routed = useRef(false);

  useEffect(() => {
    if (isLoading || routed.current) return;
    routed.current = true;

    if (user) {
      router.replace(dashboardFor(user));
      return;
    }

    // Unauthenticated. First-ever launch goes to registration; returning users
    // go to login. (Previously handled by PwaEntryGuard; `/app` is now the
    // single, authoritative entry point.)
    const isNewInstall = !localStorage.getItem("has_launched_pwa");
    if (isNewInstall) {
      localStorage.setItem("has_launched_pwa", "true");
      router.replace("/register");
    } else {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return <AppSplash label={isLoading ? "Validating session…" : "Opening…"} />;
}
