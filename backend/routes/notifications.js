import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';
import protect from '../middleware/protectRoute.js';

router.get('/', protect, notificationController.getNotifications);
router.post('/mark-read', protect, notificationController.markAsRead);
router.post('/mark-unread', protect, notificationController.markAsUnread);
router.post('/mark-all-read', protect, notificationController.markAllAsRead);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.delete('/:notificationId', protect, notificationController.deleteNotification);

export default router;
