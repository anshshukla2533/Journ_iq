import axios from 'axios';

const YOUTUBE_API = '/api/youtube/search';

export const searchYouTube = async (query) => {
  if (!query || !query.trim()) return [];
  try {
    const res = await axios.get(YOUTUBE_API, { params: { q: query } });
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items
        .filter(item => item.id && item.id.videoId)
        .map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
        }));
    }
    return [];
  } catch (err) {
    return [];
  }
};
