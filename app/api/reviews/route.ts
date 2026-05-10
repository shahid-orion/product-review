import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db-mongo';
import { redis } from '@/lib/redis';
import { headers } from 'next/headers';

const RATE_LIMIT_MAX = 5;        // max reviews per window
const RATE_LIMIT_WINDOW = 3600;  // 1 hour in seconds

export async function POST(request: Request) {
  try {
    // --- Rate Limiting (Redis INCR + EXPIRE) ---
    const headersList = await headers();
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'anonymous';
    const rateLimitKey = `rate_limit:reviews:${ip}`;

    const current = await redis.incr(rateLimitKey);
    if (current === 1) {
      // First request in window — set the TTL
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }
    if (current > RATE_LIMIT_MAX) {
      const ttl = await redis.ttl(rateLimitKey);
      return NextResponse.json(
        { error: `Rate limit exceeded. You can submit up to ${RATE_LIMIT_MAX} reviews per hour. Try again in ${Math.ceil(ttl / 60)} minute(s).` },
        {
          status: 429,
          headers: {
            'Retry-After': String(ttl),
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
    // -----------------------------------------

    const body = await request.json();
    const { productId, userName, rating, comment } = body;

    // Basic validation
    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Save the new review to MongoDB as PENDING
    const mongoDb = await getMongoDb();
    const newReview = {
      productId: productId,
      userName,
      rating: parseInt(rating, 10),
      comment,
      status: 'PENDING',
      pros: [],
      cons: [],
      createdAt: new Date()
    };
    
    await mongoDb.collection('reviews').insertOne(newReview);

    // 2. CRUCIAL CACHE INVALIDATION STEP!
    // Because the underlying data for this product has changed, the cache is now stale.
    // We MUST delete the cache key so the next visitor gets fresh data.
    const cacheKey = `product_profile:${productId}`;
    await redis.del(cacheKey);

    return NextResponse.json({ 
      success: true, 
      message: 'Review added and cache invalidated' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
