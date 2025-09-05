import express from 'express';
const router = express.Router();
import messageController from '../controllers/messageController.js';
import protect from '../middleware/protectRoute.js';

router.post('/send', protect, messageController.sendMessage);
router.get('/:userId', protect, messageController.getMessages);
router.post('/read', protect, messageController.markAsRead);

export default router;