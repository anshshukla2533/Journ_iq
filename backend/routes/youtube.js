import express from 'express';
import axios from 'axios';
import { createRequire } from 'module';
import { getCachedJson, setCachedJson } from '../lib/cache.js';

const require = createRequire(import.meta.url);
const { YoutubeTranscript } = require('youtube-transcript');

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Query is required' });
    }
    const normalizedQuery = String(q).trim().toLowerCase();
    const cacheKey = `youtube:search:${normalizedQuery}`;
    const cached = await getCachedJson(cacheKey);
    if (cached) {
      return res.json(cached);
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
    await setCachedJson(cacheKey, ytRes.data, 900);
    res.json(ytRes.data);
  } catch (error) {
    console.error('YouTube API error:', error.message);
    res.status(500).json({ message: 'Error fetching YouTube videos' });
  }
});

router.get('/transcript/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Video ID is required' });
    }
    const cacheKey = `youtube:transcript:${videoId}:en`;
    const cached = await getCachedJson(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const languageAttempts = ['en', 'en-US', 'en-GB', undefined];
    let transcript = null;

    for (const lang of languageAttempts) {
      try {
        transcript = lang
          ? await YoutubeTranscript.fetchTranscript(videoId, { lang })
          : await YoutubeTranscript.fetchTranscript(videoId);

        if (Array.isArray(transcript) && transcript.length) {
          break;
        }
      } catch {}
    }

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transcript is not available for this video',
      });
    }

    const text = transcript
      .map((segment) => segment.text?.trim())
      .filter(Boolean)
      .join('\n');

    const payload = {
      success: true,
      data: {
        videoId,
        language: 'en',
        text,
        segments: transcript,
      },
    };
    await setCachedJson(cacheKey, payload, 21600);
    return res.json(payload);
  } catch (error) {
    console.error('YouTube transcript error:', error.message);
    return res.status(404).json({
      success: false,
      message: 'Transcript is not available for this video',
    });
  }
});

export default router;
