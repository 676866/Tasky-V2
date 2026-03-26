import { create } from "zustand";
import { Notification } from "@/types";
import { api } from "@/lib/api";

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  fetchNotifications: async (userId: string) => {
    set({ loading: true });
    try {
      const notifications = await api.getNotifications(userId);
      set({ notifications, loading: false });
    } catch {
      set({ notifications: [], loading: false });
    }
  },
  markRead: async (id: string) => {
    await api.markNotificationRead(id);
    set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  },
  markAllRead: async (userId: string) => {
    await api.markAllNotificationsRead(userId);
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
  },
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
