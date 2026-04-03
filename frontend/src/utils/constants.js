export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    USER: '/auth/me'
  }
}

export const NEWS_CONFIG = {
  API_KEY: import.meta.env.VITE_NEWS_API_KEY || "",
  BASE_URL: "https://newsdata.io/api/1/latest",
  DEFAULT_QUERY: "mental health"
}

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NOTE_LENGTH: 500
}
