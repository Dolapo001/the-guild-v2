"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePWA } from "@/hooks/use-pwa";
import { AppSplash } from "./app-splash";

/**
 * Reliable, client-side enforcement of "app functionality is install-only".
 *
 * When `NEXT_PUBLIC_PWA_ENFORCE=1`, browser-tab visitors to app routes are sent
 * to the Install Required screen (`/install`). `display-mode` is detectable only
 * on the client, so this is where the real gate lives (the Edge middleware is a
 * best-effort, no-flash hint). Disabled by default so browser dev access works.
 */
const ENFORCE = process.env.NEXT_PUBLIC_PWA_ENFORCE === "1";

export function AppModeGuard({ children }: { children: ReactNode }) {
  const { ready, isBrowser } = usePWA();
  const router = useRouter();

  useEffect(() => {
    if (ENFORCE && ready && isBrowser && window.location.pathname !== "/") {
      router.replace("/");
    }
  }, [ready, isBrowser, router]);

  if (!ENFORCE) return <>{children}</>;
  if (!ready || isBrowser) return <AppSplash label="Checking app mode…" />;
  return <>{children}</>;
}
