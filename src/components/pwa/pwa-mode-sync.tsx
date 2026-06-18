"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePWA } from "@/hooks/use-pwa";

const MARKETING_PATHS = new Set(["/", "/install"]);

/**
 * Bridges the *client-only* PWA mode to the *server* middleware, and keeps app
 * mode out of marketing pages.
 *
 * - When running standalone, drops an `app-mode=standalone` cookie so the Edge
 *   middleware can soft-gate without a first-paint flash. (Note: a browser tab
 *   and the installed app share cookies on the same origin, so this is a hint,
 *   not a security boundary — the reliable gate is the client `AppModeGuard`,
 *   and real access control is the auth cookie + backend permissions.)
 * - In app mode, never show the landing/install pages: bounce to `/app`.
 */
export function PWAModeSync() {
  const { ready, isStandalone } = usePWA();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (isStandalone) {
      document.cookie = `app-mode=standalone; path=/; max-age=2592000; SameSite=Lax`;
      if (MARKETING_PATHS.has(pathname)) router.replace("/app");
    }
  }, [ready, isStandalone, pathname, router]);

  return null;
}
