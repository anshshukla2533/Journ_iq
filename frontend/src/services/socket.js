import { io } from 'socket.io-client';

// Singleton socket instance + optional notification handler.
let socket = null;
let notificationHandler = null;

function resolveSocketUrl() {
  const env = import.meta.env.VITE_API_URL;
  if (env && typeof env === 'string') {
    const trimmed = env.endsWith('/') ? env.slice(0, -1) : env;
    return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
  }
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return null;
}

export function createSocket(token) {
  const baseUrl = resolveSocketUrl();
  console.log('[socket.js] Creating socket:', { hasToken: !!token, existing: !!socket, existingId: socket?.id, baseUrl });

  // Reuse socket when token unchanged
  if (socket && socket.auth && socket.auth.token === token) {
    if (!socket.connected) {
      try { socket.connect(); } catch (_) {}
    }
    return socket;
  }

  if (!baseUrl) {
    console.error('[socket.js] Could not resolve socket URL. Set VITE_API_URL or use same-origin.');
    return null;
  }

  if (socket) { try { socket.disconnect(); } catch (_) {} socket = null; }

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[socket.js] Socket connected:', { id: socket.id, connected: socket.connected, url: baseUrl });
  });

  socket.on('connect_error', (error) => {
    console.error('[socket.js] Connect error:', { message: error.message, description: error.description, type: error.type, url: baseUrl });
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket.js] Socket disconnected:', { reason, id: socket.id });
  });

  // Central notification listener that delegates to the latest handler
  socket.on('notification', (payload) => {
    if (typeof notificationHandler === 'function') {
      try { notificationHandler(payload); } catch (err) { console.error('notificationHandler threw', err); }
    }
  });

  return socket;
}

export function setNotificationHandler(handler) {
  notificationHandler = handler;
}

export function getSocket() { return socket; }