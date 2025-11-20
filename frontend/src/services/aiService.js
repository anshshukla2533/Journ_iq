// Intelligently resolve API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  return '/api';
};

const API_URL = getApiUrl();

const aiService = {
  async sendMessage(message, token) {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('AI response error:', data);
        throw new Error(data.message || 'Error communicating with AI');
      }

      return data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }
};

export default aiService;