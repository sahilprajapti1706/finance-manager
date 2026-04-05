import { useState, useCallback, useEffect } from 'react';
import type { Notification } from '../api/notifications.api';
import { notificationsApi } from '../api/notifications.api';
import { useAuthStore } from '../store/auth.store';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications();
      const list = res.data.notifications; 
      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app, use WebSockets. Here, we'll just poll every 30s.
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    refresh: fetchNotifications 
  };
}
