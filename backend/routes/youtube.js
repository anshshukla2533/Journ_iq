import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/youtube/search?q=QUERY
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Query is required' });
    }
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'YouTube API key not set' });
    }
    const url = `https://www.googleapis.com/youtube/v3/search`;
    const params = {
      part: 'snippet',
      q,
      key: apiKey,
      maxResults: 10,
      type: 'video',
      safeSearch: 'strict',
    };
    const ytRes = await axios.get(url, { params });
    res.json(ytRes.data);
  } catch (error) {
    console.error('YouTube API error:', error.message);
    res.status(500).json({ message: 'Error fetching YouTube videos' });
  }
});

export default router;
