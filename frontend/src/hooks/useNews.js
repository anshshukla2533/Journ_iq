import { useState, useCallback } from 'react'
import newsService from '../services/newsService'

const useNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await newsService.getLatestNews()
      if (response.success) {
        setNews(response.data)
      } else {
        setError(response.message)
        setNews([])
      }
    } catch (error) {
      setError("Failed to fetch news")
      setNews([])
      alert("Internet issue")
    } finally {
      setLoading(false)
    }
  }, [])

  return { news, loading, error, fetchNews }
}

export default useNews