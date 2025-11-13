import express from 'express';
import protect from '../middleware/protectRoute.js';
import {
  searchUsers,
  sendRequest,
  listRequests,
  acceptRequest,
  declineRequest,
  listFriends,
  friendProfileByEmail
} from '../controllers/friendsV2Controller.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.post('/request', protect, sendRequest);
router.get('/requests', protect, listRequests);
router.post('/accept', protect, acceptRequest);
router.post('/decline', protect, declineRequest);
router.get('/list', protect, listFriends);
router.get('/profile/:email', protect, friendProfileByEmail);

export default router;


