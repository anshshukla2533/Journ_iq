import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';
import protect from '../middleware/protectRoute.js';

// Get all notifications
router.get('/', protect, notificationController.getNotifications);

// Mark single notification as read
router.post('/mark-read', protect, notificationController.markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', protect, notificationController.markAllAsRead);

// Get unread notification count
router.get('/unread-count', protect, notificationController.getUnreadCount);

// Delete a notification
router.delete('/:notificationId', protect, notificationController.deleteNotification);

export default router;