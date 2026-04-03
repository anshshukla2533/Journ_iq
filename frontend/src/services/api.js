import axios from 'axios';

function normalizeApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:3000/api';
}

export const API_BASE_URL = normalizeApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const persistedToken =
  typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

if (persistedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${persistedToken}`;
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}
