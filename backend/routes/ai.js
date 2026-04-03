import express from 'express';
import protect from '../middleware/protectRoute.js';
import { chatWithAi } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', protect, chatWithAi);

export default router;
