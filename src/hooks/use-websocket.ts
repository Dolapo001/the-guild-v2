"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Status = "connecting" | "open" | "closed" | "error";

interface UseWebSocketOptions {
  url: string | null;
  onMessage?: (data: any, raw: MessageEvent) => void;
  /** Whether to attempt reconnection. Defaults to true. */
  reconnect?: boolean;
  /** Max number of reconnect attempts. Defaults to 6. */
  maxRetries?: number;
  /** Base delay in ms (then exponential up to maxDelay). Defaults to 1000. */
  baseDelay?: number;
  /** Cap for the exponential backoff. Defaults to 30000 (30s). */
  maxDelay?: number;
}

/**
 * WebSocket hook with exponential backoff reconnect.
 *
 * Replaces the literal no-op reconnect that lived in NotificationContext
 * (`setTimeout(() => {}, 5000)`). Closes the socket on unmount, retries with
 * jittered exponential backoff up to `maxRetries`, and surfaces a `status`
 * for components to show a live/offline pip.
 */
export function useWebSocket({
  url,
  onMessage,
  reconnect = true,
  maxRetries = 6,
  baseDelay = 1000,
  maxDelay = 30_000,
}: UseWebSocketOptions) {
  const [status, setStatus] = useState<Status>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!url || cancelledRef.current) return;

    setStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      setStatus("error");
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      retryRef.current = 0;
      setStatus("open");
    };

    ws.onmessage = (event) => {
      let parsed: any = event.data;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        /* not JSON, leave as raw string */
      }
      onMessageRef.current?.(parsed, event);
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = (e) => {
      setStatus("closed");
      if (cancelledRef.current) return;
      // Don't retry if the server explicitly rejected the auth (4401).
      if (e.code === 4401) return;
      scheduleReconnect();
    };

    function scheduleReconnect() {
      if (!reconnect || cancelledRef.current) return;
      if (retryRef.current >= maxRetries) return;
      const attempt = retryRef.current++;
      const exp = Math.min(maxDelay, baseDelay * 2 ** attempt);
      const jitter = Math.random() * exp * 0.25;
      const delay = exp + jitter;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(connect, delay);
    }
  }, [url, reconnect, maxRetries, baseDelay, maxDelay]);

  useEffect(() => {
    cancelledRef.current = false;
    if (!url) {
      setStatus("closed");
      return;
    }
    connect();

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [url, connect]);

  const send = useCallback((data: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(typeof data === "string" ? data : JSON.stringify(data));
    return true;
  }, []);

  return { status, send };
}
