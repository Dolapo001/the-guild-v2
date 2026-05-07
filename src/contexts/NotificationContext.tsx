"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Notification {
  uid: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  metadata: any;
  is_read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (uid: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { api } = await import("@/lib/api-client");
      const data = await api.get<Notification[]>("/auth/notifications/");
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("the-guild-token");
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/notifications/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "notification") {
        const newNotif = data.notification;
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast
        toast.info(newNotif.title, {
          description: newNotif.message,
          action: {
            label: "View",
            onClick: () => console.log("View notification", newNotif.uid),
          },
        });
      }
    };

    ws.onclose = () => {
      console.log("Notification WebSocket closed. Retrying in 5s...");
      setTimeout(() => {
        // Simple retry logic could be added here
      }, 5000);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user]);

  const markAsRead = async (uid: string) => {
    try {
      const { api } = await import("@/lib/api-client");
      await api.post("/auth/notifications/", { uid });
      setNotifications(prev => prev.map(n => n.uid === uid ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { api } = await import("@/lib/api-client");
      await api.post("/auth/notifications/", { all: true });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
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
