import { createClient } from 'redis';

let redisClient = null;

export const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('No REDIS_URL provided. Redis integration disabled.');
    return null;
  }

  try {
    const client = createClient({ url: redisUrl });

    client.on('error', (error) => console.error('Redis client error:', error));
    client.on('connect', () => console.log('Redis connected successfully'));

    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
};

export const getRedisClient = () => redisClient;
