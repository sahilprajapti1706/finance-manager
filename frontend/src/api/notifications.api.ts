import client from './client';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  is_read: boolean;
  created_at: string;
  related_record_id?: string;
}

export const notificationsApi = {
  getNotifications: async () => {
    const res = await client.get<{ data: { notifications: Notification[] } }>('/notifications');
    return res.data;
  },
    
  markAsRead: async (id: string) => {
    const res = await client.patch(`/notifications/${id}/read`);
    return res.data;
  },
    
  markAllAsRead: async () => {
    const res = await client.patch('/notifications/read-all');
    return res.data;
  }
};
