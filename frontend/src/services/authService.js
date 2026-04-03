import { api, API_ORIGIN, setAuthToken } from './api';

function normalizeError(error, fallbackMessage) {
  return {
    success: false,
    message: error.response?.data?.msg || fallbackMessage,
    data: null,
    errors: error.response?.data?.errors || [],
  };
}

const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }

      return {
        success: true,
        message: response.data.msg,
        data: response.data,
        errors: [],
      };
    } catch (error) {
      return normalizeError(error, 'Registration failed. Please try again.');
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }

      return {
        success: true,
        message: response.data.msg,
        data: response.data,
        errors: [],
      };
    } catch (error) {
      return normalizeError(error, 'Login failed. Please check your connection.');
    }
  },

  async getCurrentUser(token) {
    try {
      if (token) {
        setAuthToken(token);
      }

      const response = await api.get('/auth/me');
      return {
        success: true,
        message: response.data.msg,
        data: response.data.user,
      };
    } catch (error) {
      return normalizeError(error, 'Failed to fetch user data');
    }
  },

  async updateProfile(profileData, token) {
    try {
      if (token) {
        setAuthToken(token);
      }

      const response = await api.put('/auth/profile', profileData);
      return {
        success: true,
        message: response.data.msg,
        data: response.data.user,
        errors: [],
      };
    } catch (error) {
      return normalizeError(error, 'Profile update failed. Please try again.');
    }
  },

  getGoogleAuthUrl() {
    return `${API_ORIGIN}/api/auth/google`;
  },
};

export default authService;
