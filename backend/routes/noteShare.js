import express from 'express';
const router = express.Router();
import noteShareController from '../controllers/noteShareController.js';
import protect from '../middleware/protectRoute.js';

router.post('/share', protect, noteShareController.shareNote); // Fixed typo: shareNote

export default router; // ES Modules export