import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications for residents (visitor alerts, etc.)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/notifications/me:
 *   get:
 *     summary: Get my notifications (paginated)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', notificationController.getMyNotificationsHandler);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', notificationController.getUnreadCountHandler);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Not found
 */
router.put('/:id/read', notificationController.markAsReadHandler);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/read-all', notificationController.markAllAsReadHandler);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', notificationController.deleteNotificationHandler);

/**
 * @swagger
 * /api/v1/notifications/notify-admin:
 *   post:
 *     summary: Resident notifies admin of a payment made
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin notified
 *       400:
 *         description: Invalid request
 */
router.post(
  '/notify-admin',
  requireRoles('owner', 'tenant'),
  notificationController.notifyAdminHandler,
);

export default router;