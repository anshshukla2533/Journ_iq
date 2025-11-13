import express from 'express';
import protect from '../middleware/protectRoute.js';
import {
  searchUsers,
  listFriends,
  listRequests,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeFriend
} from '../controllers/friendsController.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/list', protect, listFriends);
router.get('/requests', protect, listRequests);
router.post('/send', protect, sendRequest);
router.post('/accept', protect, acceptRequest);
router.post('/decline', protect, declineRequest);
router.post('/remove', protect, removeFriend);

export default router;
