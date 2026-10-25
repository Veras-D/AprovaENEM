import { apiClient } from '../client';
import type {
  NotificationFeedResponse,
  MarkNotificationReadResponse,
  MarkAllNotificationsReadResponse,
  CreateInAppNotificationRequest,
  NotificationItemDto,
} from '../types';

export const notificationService = {
  getFeed: async (status: 'ALL' | 'UNREAD' = 'ALL', page = 0, size = 20): Promise<NotificationFeedResponse> => {
    const res = await apiClient.get<NotificationFeedResponse>('/api/v1/notifications', {
      params: { status, page, size },
    });
    return res.data;
  },

  getUnreadCount: async (): Promise<{ readonly unreadCount: number }> => {
    const res = await apiClient.get<{ readonly unreadCount: number }>('/api/v1/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (notificationId: string): Promise<MarkNotificationReadResponse> => {
    const res = await apiClient.patch<MarkNotificationReadResponse>(`/api/v1/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<MarkAllNotificationsReadResponse> => {
    const res = await apiClient.patch<MarkAllNotificationsReadResponse>('/api/v1/notifications/read-all');
    return res.data;
  },

  createInAppNotification: async (request: CreateInAppNotificationRequest): Promise<NotificationItemDto> => {
    const res = await apiClient.post<NotificationItemDto>('/api/v1/notifications', request);
    return res.data;
  },
};
