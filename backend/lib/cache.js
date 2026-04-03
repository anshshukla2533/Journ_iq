import { getRedisClient } from './redis.js';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getCachedJson = async (key) => {
  const redis = getRedisClient();
  if (!redis || !key) return null;

  try {
    const cached = await redis.get(key);
    return cached ? safeParse(cached) : null;
  } catch (error) {
    console.error('Redis get cache error:', error.message);
    return null;
  }
};

export const setCachedJson = async (key, value, ttlSeconds = 300) => {
  const redis = getRedisClient();
  if (!redis || !key) return false;

  try {
    await redis.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
    return true;
  } catch (error) {
    console.error('Redis set cache error:', error.message);
    return false;
  }
};

export const deleteCacheKeys = async (...keys) => {
  const redis = getRedisClient();
  const validKeys = keys.flat().filter(Boolean);
  if (!redis || !validKeys.length) return;

  try {
    await redis.del(validKeys);
  } catch (error) {
    console.error('Redis delete cache error:', error.message);
  }
};

export const notificationCacheKeys = (userId) => [
  `notifications:list:${userId}`,
  `notifications:unread:${userId}`,
];
