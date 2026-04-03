import { getRedisClient } from '../lib/redis.js';

export const cache = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = getRedisClient();
    if (!redisClient) {
      return next();
    }

    const userId = req.user?.id ? `:${req.user.id}` : '';
    const cacheKey = `cache:${req.originalUrl || req.url}${userId}`;

    try {
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      } else {
        res.originalJson = res.json;
        res.json = (body) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            redisClient.setEx(cacheKey, duration, JSON.stringify(body))
              .catch(err => console.error('Redis cache error:', err));
          }
          return res.originalJson(body);
        };
        next();
      }
    } catch (err) {
      console.error('Redis cache middleware error:', err);
      next();
    }
  };
};
