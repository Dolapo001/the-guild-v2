"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

/**
 * Fetches a short-lived (60s) JWT ticket from `POST /auth/ws/ticket/`
 * and constructs a WebSocket URL using `?ticket=` instead of the
 * long-lived access token. Refreshes the ticket every 50s so an
 * open socket can reconnect transparently.
 *
 * Returns `null` until the first ticket is in hand (or while the
 * user is logged out).
 */
export function useTicketedWsUrl(path: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !path) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function refresh() {
      const token = localStorage.getItem("the-guild-token");
      if (!token) {
        setUrl(null);
        return;
      }
      try {
        const res = await api.post<{ token: string; expires_in: number }>(
          "/auth/ws/ticket/",
          {},
        );
        if (cancelled) return;
        const base = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
        setUrl(`${base}${path}?ticket=${encodeURIComponent(res.token)}`);
        // Refresh ~10s before expiry.
        const refreshIn = Math.max(10_000, (res.expires_in - 10) * 1000);
        timer = setTimeout(refresh, refreshIn);
      } catch {
        if (cancelled) return;
        setUrl(null);
      }
    }

    refresh();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [path]);

  return url;
}
