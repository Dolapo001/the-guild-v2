"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTicketedWsUrl } from "@/hooks/use-ticketed-ws-url";

interface Notification {
  uid: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  metadata: any;
  isRead?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (uid: string) => void;
  markAllAsRead: () => void;
  status: "connecting" | "open" | "closed" | "error";
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { api } = await import("@/lib/api-client");
      const data = await api.get<Notification[]>("/core/notifications/");
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Use a short-lived ticket instead of the long-lived JWT in the WS URL.
  const wsUrl = useTicketedWsUrl(user ? "/ws/notifications/" : null);

  const { status } = useWebSocket({
    url: wsUrl,
    onMessage: (data) => {
      if (data?.type === "notification" && data.notification) {
        const newNotif: Notification = data.notification;
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(newNotif.title, {
          description: newNotif.message,
        });
      }
    },
  });

  const markAsRead = async (uid: string) => {
    try {
      const { api } = await import("@/lib/api-client");
      await api.post("/core/notifications/", { uid });
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.uid !== uid) return n;
          if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
          return { ...n, isRead: true };
        }),
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { api } = await import("@/lib/api-client");
      await api.post("/core/notifications/", { all: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, status }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
