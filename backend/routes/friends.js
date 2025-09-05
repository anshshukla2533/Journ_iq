import express from 'express';
import * as friendController from '../controllers/friendController.js';
import protect from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/send', protect, friendController.sendRequest);
router.post('/accept', protect, friendController.acceptRequest);
router.post('/decline', protect, friendController.declineRequest);
router.get('/list', protect, friendController.listFriends);
router.get('/online', protect, friendController.listOnlineFriends);
router.get('/requests', protect, friendController.getPendingRequests);
router.get('/search', protect, friendController.searchUsers);
router.get('/profile/:id', protect, friendController.getUserProfile);

export default router;
