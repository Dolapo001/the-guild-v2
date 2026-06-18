import { api } from "@/lib/api-client";

export interface Notification {
  uid: string;
  title: string;
  message: string;
  notificationType: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const response: any = await api.get("/core/notifications/");
    return response.data || [];
  }

  async markAsRead(uid: string): Promise<void> {
    await api.post("/core/notifications/", { uid });
  }

  async markAllAsRead(): Promise<void> {
    await api.post("/core/notifications/", { all: true });
  }
}

export const notificationService = new NotificationService();
