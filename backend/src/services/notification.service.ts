import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformNotification, transformNotifications } from '../transformers/notification.transformer';
import { PaginationParams } from '../helpers/pagination.helper';

export async function getMyNotifications(userId: string, pagination: PaginationParams) {
  const where = { userId };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  return { data: transformNotifications(notifications), total };
}

export async function markAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw createError('Notification not found', 404);
  if (notification.userId !== userId) throw createError('Forbidden', 403);
  if (notification.isRead) return transformNotification(notification);

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  return transformNotification(updated);
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw createError('Notification not found', 404);
  if (notification.userId !== userId) throw createError('Forbidden', 403);
  await prisma.notification.delete({ where: { id } });
}

/**
 * Resident calls this after making a payment — creates a notification for every
 * admin user in the society so they know to verify and record the payment.
 */
export async function notifyAdmin(message: string, fromUserId: string, societyId: number) {
  // Find all admin users in this society
  const adminUsers = await prisma.user.findMany({
    where: { role: 'admin', societyId },
    select: { id: true },
  });

  if (adminUsers.length === 0) throw createError('No admin users found', 404);

  // Get the sender's resident info for context
  const sender = await prisma.user.findUnique({
    where: { id: fromUserId },
    include: { resident: { include: { flat: true } } },
  });

  const flatNumber = sender?.resident?.flat?.flatNumber ?? 'unknown flat';
  const senderName  = sender?.resident?.name ?? sender?.username ?? 'A resident';
  const fullMessage = `[Payment Notice] ${senderName} (${flatNumber}): ${message}`;

  await prisma.notification.createMany({
    data: adminUsers.map((u) => ({
      userId:   u.id,
      message:  fullMessage,
      isRead:   false,
    })),
  });

  return { notified: adminUsers.length };
}