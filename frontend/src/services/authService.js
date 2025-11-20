import axios from 'axios';

// Properly read VITE_API_URL from environment or fall back intelligently
const getApiUrl = () => {
  // In production (Vercel), VITE_API_URL should be set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In local dev, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  // Fallback for production without env var
  return '/api'; // This will use relative URL
};

const API_BASE_URL = getApiUrl();

console.log('API_BASE_URL:', API_BASE_URL, 'ENV:', import.meta.env.VITE_API_URL);

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