import { useState, useCallback } from 'react';
import newsService from '../services/newsService';

const useNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (query = "mental health") => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await newsService.getLatestNews(query);
      if (response.success) {
        setNews(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to fetch news");
      console.error("News fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    news, 
    loading, 
    error, 
    fetchNews
  };
}

export default useNews