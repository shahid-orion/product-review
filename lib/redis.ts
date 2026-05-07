import Redis from 'ioredis';

// Ensure this matches your local Redis server address
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Prevent creating multiple Redis connections in dev mode (Next.js hot reloads)
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(redisUrl);

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
