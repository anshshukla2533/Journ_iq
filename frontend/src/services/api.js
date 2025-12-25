import axios from 'axios';

// Intelligently resolve API URL based on environment
const getApiUrl = () => {
  // Temporarily hardcode for testing
  return 'https://journ-iq.onrender.com/api';
  
  // Comment out the rest for now
  /*
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  return 'https://journ-iq.onrender.com/api';
  */
};

const API_BASE_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}



