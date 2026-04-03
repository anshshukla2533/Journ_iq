import express from 'express';
import { prisma } from '../lib/prisma.js';
import protect from '../middleware/protectRoute.js';
import { getCachedJson, setCachedJson } from '../lib/cache.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const cacheKey = `timeline:${req.user.id}`;
    const cached = await getCachedJson(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const notes = await prisma.note.findMany({ 
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const timeline = {};
    notes.forEach(note => {
      const date = note.createdAt.toISOString().slice(0, 10);
      if (!timeline[date]) timeline[date] = [];
      timeline[date].push({ ...note, _id: note.id });
    });
    await setCachedJson(cacheKey, timeline, 300);
    res.json(timeline);
  } catch (error) {
    console.error('Timeline API error:', error.message);
    res.status(500).json({ message: 'Error fetching timeline' });
  }
});

export default router;
