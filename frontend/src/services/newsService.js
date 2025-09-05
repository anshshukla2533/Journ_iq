const API_KEY = "pub_77532ace0d48dd9a60b8e05119d093407f3a0"
const NEWS_API_URL = "https://newsdata.io/api/1/latest"

const newsService = {
  async getLatestNews(query = "mental health") {
    try {
      const url = `${NEWS_API_URL}?apikey=${API_KEY}&q=${encodeURIComponent(query)}`
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok && data.results) {
        return {
          success: true,
          data: data.results
        }
      } else {
        return {
          success: false,
          message: 'No news found',
          data: []
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch news',
        data: []
      }
    }
  }
}

export default newsService