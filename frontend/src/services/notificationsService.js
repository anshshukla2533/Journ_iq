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

const API_BASE_URL = getApiUrl();

const notificationsService = {
  async getNotifications(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      return data
    } catch (err) {
      return { success: false, msg: 'Failed to fetch notifications' }
    }
  }
}

export default notificationsService
