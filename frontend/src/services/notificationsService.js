const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

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
