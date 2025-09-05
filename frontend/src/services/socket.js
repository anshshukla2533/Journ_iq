import { io } from 'socket.io-client';

export function createSocket(token) {
  return io(import.meta.env.VITE_API_URL.replace('/api', ''), {
    auth: { token },
    transports: ['websocket'],
    withCredentials: true,
  });
}
