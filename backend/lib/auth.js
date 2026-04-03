import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY = '7d';

export function signAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRY,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function buildClientRedirect(path = '') {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${clientUrl}${normalizedPath}`;
}
