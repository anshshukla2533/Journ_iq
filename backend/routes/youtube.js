import express from 'express';
import axios from 'axios';
import { getCachedJson, setCachedJson } from '../lib/cache.js';

const router = express.Router();
const YT_PLAYER_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const YT_PLAYER_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
  },
};
const YT_ANDROID_UA = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)';
const YT_WEB_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36';

const decodeEntities = (value = '') =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));

const parseTranscriptXml = (xml, language) => {
  const segments = [];
  const paragraphRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;

  while ((match = paragraphRegex.exec(xml)) !== null) {
    const offset = Number.parseInt(match[1], 10);
    const duration = Number.parseInt(match[2], 10);
    const inner = match[3] || '';

    let text = '';
    const spanRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let spanMatch;
    while ((spanMatch = spanRegex.exec(inner)) !== null) {
      text += spanMatch[1];
    }

    if (!text) {
      text = inner.replace(/<[^>]+>/g, '');
    }

    text = decodeEntities(text).trim();

    if (text) {
      segments.push({
        text,
        duration,
        offset,
        lang: language,
      });
    }
  }

  if (segments.length > 0) {
    return segments;
  }

  return [...xml.matchAll(/<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g)].map((entry) => ({
    text: decodeEntities(entry[3]).trim(),
    duration: Math.round(Number.parseFloat(entry[2]) * 1000),
    offset: Math.round(Number.parseFloat(entry[1]) * 1000),
    lang: language,
  }));
};

const findCaptionTracks = (payload) =>
  payload?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
  payload?.captions?.playerCaptionsRenderer?.baseUrl ||
  [];

const pickBestTrack = (tracks = []) => {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;

  const normalized = tracks.filter((track) => typeof track?.baseUrl === 'string' && track.baseUrl);
  if (normalized.length === 0) return null;

  return (
    normalized.find((track) => /^en(?:-|$)/i.test(track.languageCode || '')) ||
    normalized.find((track) => /english/i.test(track.name?.simpleText || '')) ||
    normalized.find((track) => track.kind === 'asr') ||
    normalized[0]
  );
};

const fetchTracksFromInnerTube = async (videoId) => {
  const response = await axios.post(
    YT_PLAYER_URL,
    {
      context: YT_PLAYER_CONTEXT,
      videoId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': YT_ANDROID_UA,
      },
      timeout: 12000,
    }
  );

  return findCaptionTracks(response.data);
};

const parseInlineJson = (html, variableName) => {
  const marker = `var ${variableName} = `;
  const startIndex = html.indexOf(marker);
  if (startIndex === -1) return null;

  let depth = 0;
  let jsonStart = startIndex + marker.length;

  for (let index = jsonStart; index < html.length; index += 1) {
    if (html[index] === '{') depth += 1;
    if (html[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(jsonStart, index + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
};

const fetchTracksFromWatchPage = async (videoId) => {
  const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': YT_WEB_UA,
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 12000,
  });

  const html = response.data || '';
  const playerResponse = parseInlineJson(html, 'ytInitialPlayerResponse');
  return findCaptionTracks(playerResponse);
};

const fetchTranscriptForVideo = async (videoId) => {
  let tracks = [];
  let source = 'innertube';

  try {
    tracks = await fetchTracksFromInnerTube(videoId);
  } catch (error) {
    console.warn('YouTube transcript innertube fetch failed:', error.message);
  }

  if (!Array.isArray(tracks) || tracks.length === 0) {
    source = 'watch-page';
    tracks = await fetchTracksFromWatchPage(videoId);
  }

  const track = pickBestTrack(tracks);
  if (!track?.baseUrl) {
    return null;
  }

  const transcriptResponse = await axios.get(track.baseUrl, {
    headers: {
      'User-Agent': YT_WEB_UA,
      'Accept-Language': `${track.languageCode || 'en-US'},en;q=0.9`,
    },
    timeout: 12000,
  });

  const segments = parseTranscriptXml(transcriptResponse.data, track.languageCode || 'unknown').filter(
    (segment) => segment.text
  );

  if (segments.length === 0) {
    return null;
  }

  return {
    language: track.languageCode || 'unknown',
    source,
    segments,
  };
};

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

    const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q,
        key: apiKey,
        maxResults: 10,
        type: 'video',
        safeSearch: 'strict',
      },
    });

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

    const cacheKey = `youtube:transcript:${videoId}`;
    const cached = await getCachedJson(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const transcriptData = await fetchTranscriptForVideo(videoId);
    if (!transcriptData) {
      return res.status(404).json({
        success: false,
        code: 'TRANSCRIPT_UNAVAILABLE',
        message: 'Transcript is not available for this video',
      });
    }

    const payload = {
      success: true,
      data: {
        videoId,
        language: transcriptData.language,
        source: transcriptData.source,
        text: transcriptData.segments.map((segment) => segment.text).join('\n'),
        segments: transcriptData.segments,
      },
    };

    await setCachedJson(cacheKey, payload, 21600);
    return res.json(payload);
  } catch (error) {
    console.error('YouTube transcript error:', error.message);
    return res.status(404).json({
      success: false,
      code: 'TRANSCRIPT_FETCH_FAILED',
      message: 'Transcript could not be fetched for this video',
    });
  }
});

export default router;
