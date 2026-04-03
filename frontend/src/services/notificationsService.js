import { api, setAuthToken } from './api';

const notificationsService = {
  async getNotifications(token) {
    try {
      setAuthToken(token);
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return {
        success: false,
        msg: error.response?.data?.msg || 'Failed to fetch notifications',
      };
    }
  },
};

export default notificationsService;
