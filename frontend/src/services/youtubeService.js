import { api } from './api';

export const searchYouTube = async (query) => {
  if (!query || !query.trim()) return [];
  try {
    const res = await api.get('/youtube/search', { params: { q: query } });
    console.log('YouTube API Response:', res.data);
    
    if (res.data && Array.isArray(res.data.items)) {
      const videos = res.data.items
        .filter(item => {
          console.log('Filtering item:', item.id);
          return item.id && item.id.videoId;
        })
        .map(item => {
          console.log('Mapping item:', item.snippet.title);
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          };
        });
      console.log('Final videos:', videos);
      return videos;
    }
    console.log('No items in response');
    return [];
  } catch (err) {
    console.error('YouTube search error:', err);
    return [];
  }
};
