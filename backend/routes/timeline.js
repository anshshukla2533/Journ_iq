import express from 'express';
import Note from '../models/Note.js';
import protect from '../middleware/protectRoute.js';

const router = express.Router();

// GET /api/timeline - Get notes grouped by date (timeline view) - PRIVATE
router.get('/', protect, async (req, res) => {
  try {
    // Only return notes owned by the authenticated user
    const notes = await Note.find({ owner: req.user._id, isArchived: false }).sort({ createdAt: -1 });
    // Group notes by date (YYYY-MM-DD)
    const timeline = {};
    notes.forEach(note => {
      const date = note.createdAt.toISOString().slice(0, 10);
      if (!timeline[date]) timeline[date] = [];
      timeline[date].push(note);
    });
    res.json(timeline);
  } catch (error) {
    console.error('Timeline API error:', error.message);
    res.status(500).json({ message: 'Error fetching timeline' });
  }
});

export default router;
