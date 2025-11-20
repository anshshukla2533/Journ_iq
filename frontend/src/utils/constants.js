// Dynamically get API base URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return window.location.origin;
};

export const API_ENDPOINTS = {
  BASE_URL: getApiBaseUrl(),
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    USER: '/auth/user'
  }
}

export const NEWS_CONFIG = {
  API_KEY: "pub_77532ace0d48dd9a60b8e05119d093407f3a0",
  BASE_URL: "https://newsdata.io/api/1/latest",
  DEFAULT_QUERY: "mental health"
}

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NOTE_LENGTH: 500
}