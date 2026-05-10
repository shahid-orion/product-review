import Redis from 'ioredis';

// Ensure this matches your local Redis server address
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Prevent creating multiple Redis connections in dev mode (Next.js hot reloads)
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(redisUrl);

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/** Batch-fetch rating stats for a list of product IDs from Redis hashes. */
export async function getProductStats(
  ids: string[]
): Promise<Record<string, { averageRating: string; reviewCount: number }>> {
  if (!ids.length) return {};
  const results = await Promise.all(ids.map((id) => redis.hgetall(`product:stats:${id}`)));
  const map: Record<string, { averageRating: string; reviewCount: number }> = {};
  ids.forEach((id, i) => {
    const raw = results[i] ?? {};
    const totalRating = parseInt(raw.totalRating || '0', 10);
    const reviewCount = parseInt(raw.reviewCount || '0', 10);
    map[id] = {
      averageRating: reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '0.0',
      reviewCount,
    };
  });
  return map;
}
