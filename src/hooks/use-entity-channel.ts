"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useWebSocket } from "./use-websocket";

interface UseEntityChannelOptions {
  entityType: "booking" | "order" | "wallet" | "inventory" | "business" | "staff";
  uid?: string | null;
  /**
   * React Query keys to invalidate when an event arrives. Defaults to
   * `[entityType, uid]`.
   */
  invalidateKeys?: QueryKey[];
  onMessage?: (event: { type: string; uid: string | null; payload: any }) => void;
}

/**
 * Subscribes to an entity channel (`/ws/entities/<type>/<uid>/`) and
 * invalidates the matching React Query cache on each broadcast. Pair
 * with the existing `useQuery({ queryKey: [entityType, uid] })`
 * pattern so server-driven updates are reflected in the UI without
 * any local refetch wiring.
 */
export function useEntityChannel({
  entityType,
  uid,
  invalidateKeys,
  onMessage,
}: UseEntityChannelOptions) {
  const qc = useQueryClient();

  const url = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!uid) return null;
    const token = localStorage.getItem("the-guild-token");
    if (!token) return null;
    const base = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    return `${base}/ws/entities/${entityType}/${uid}/?token=${encodeURIComponent(token)}`;
  }, [entityType, uid]);

  const { status } = useWebSocket({
    url,
    onMessage: (data) => {
      const keys = invalidateKeys ?? [[entityType, uid]];
      keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      onMessage?.({ type: data?.type ?? "updated", uid: data?.uid ?? null, payload: data?.payload });
    },
  });

  useEffect(() => {
    return () => {
      // Nothing to clean up beyond what useWebSocket already does.
    };
  }, []);

  return { status };
}
