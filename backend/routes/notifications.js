import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';
import protect from '../middleware/protectRoute.js';

router.get('/', protect, notificationController.getNotifications);
router.post('/read', protect, notificationController.markAsRead);

export default router;