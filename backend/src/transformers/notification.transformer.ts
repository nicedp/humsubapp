import { Notification } from '@prisma/client';

export interface NotificationResponse {
  id: string;
  userId: string;
  flatId: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function transformNotification(notification: Notification): NotificationResponse {
  return {
    id: notification.id,
    userId: notification.userId,
    flatId: notification.flatId ?? null,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export function transformNotifications(notifications: Notification[]): NotificationResponse[] {
  return notifications.map(transformNotification);
}