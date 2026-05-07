"use client";

import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useWebSocket } from "./use-websocket";
import { useTicketedWsUrl } from "./use-ticketed-ws-url";

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
 *
 * Auth is via the short-lived `?ticket=` flow.
 */
export function useEntityChannel({
  entityType,
  uid,
  invalidateKeys,
  onMessage,
}: UseEntityChannelOptions) {
  const qc = useQueryClient();

  const path = uid ? `/ws/entities/${entityType}/${uid}/` : null;
  const url = useTicketedWsUrl(path);

  const { status } = useWebSocket({
    url,
    onMessage: (data) => {
      const keys = invalidateKeys ?? [[entityType, uid]];
      keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      onMessage?.({ type: data?.type ?? "updated", uid: data?.uid ?? null, payload: data?.payload });
    },
  });

  useEffect(() => () => undefined, []);

  return { status };
}
