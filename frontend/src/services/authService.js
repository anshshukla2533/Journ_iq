import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        message: response.data.msg,
        data: response.data,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Network error. Please check your connection.',
        data: null,
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      // Set the token in axios defaults for future requests
      if (response.data.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return {
        success: true,
        message: response.data.msg,
        data: response.data,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Network error. Please check your connection.',
        data: null,
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Get current user
  async getCurrentUser(token) {
    try {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const response = await api.get('/auth/user');
      return {
        success: true,
        message: response.data.msg,
        data: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Failed to fetch user data',
        data: null
      };
    }
  },

  // Update user profile
  async updateProfile(profileData, token) {
    try {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const response = await api.put('/auth/profile', profileData);
      return {
        success: true,
        message: response.data.msg,
        data: response.data.user,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Network error. Please try again.',
        data: null,
        errors: error.response?.data?.errors || []
      };
    }
  }
}

export default authService