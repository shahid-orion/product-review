import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMongoDb } from '@/lib/db-mongo';
import { redis } from '@/lib/redis';
import { CachedProductProfile } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid Product ID' }, { status: 400 });
  }

  // 1. Construct the exact Redis Cache Key
  const cacheKey = `product_profile:${id}`;

  try {
    // 2. TRY CACHE FIRST (The essence of Cache-Aside)
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      // CACHE HIT! The data was found in Redis.
      // console.log('REDIS CACHE HIT!!!!!')
      const profile: CachedProductProfile = JSON.parse(cachedData);
      
      // Update metadata to prove it came from Redis and calculate speed
      profile.metadata.source = 'REDIS_CACHE';
      profile.metadata.responseTimeMs = Date.now() - startTime;
      
      return NextResponse.json(profile);
    }

    // 3. CACHE MISS! Data wasn't in Redis. We must hit the databases.

    // console.log('REDIS CACHE MISS! Fetching from databases...')
    // 3a. Fetch Product Data from Postgres via Prisma
    const product = await prisma.product.findUnique({
      where: { id: id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 3b. Fetch Reviews Data from MongoDB (ONLY APPROVED)
    const mongoDb = await getMongoDb();
    const reviews = await mongoDb.collection('reviews')
      .find({ productId: id, status: 'APPROVED' })
      .toArray();

    // 3c. Fetch Advanced Redis Stats (Hashes)
    const statsKey = `product:stats:${id}`;
    const rawStats = await redis.hgetall(statsKey);
    const totalRating = parseInt(rawStats.totalRating || '0', 10);
    const reviewCount = parseInt(rawStats.reviewCount || '0', 10);
    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '0.0';

    // 4. Aggregate the data together
    const profile: CachedProductProfile = {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl
      },
      reviews: reviews.map(r => ({
        _id: r._id.toString(),
        productId: r.productId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        upvotes: r.upvotes || 0,
        downvotes: r.downvotes || 0,
        flagged: r.flagged || false,
        flagReason: r.flagReason || null,
        createdAt: r.createdAt
      })),
      averageRating,
      reviewCount,
      metadata: {
        source: 'DATABASE_AGGREGATION',
        responseTimeMs: 0, // Calculated right before return
        cachedAt: new Date().toISOString()
      }
    };

    // 5. CRUCIAL STEP: Save to Redis for the next visitor!
    // We set a TTL (Time To Live) of 3600 seconds (1 hour)
    await redis.setex(cacheKey, 3600, JSON.stringify(profile));

    // Finalize response time
    profile.metadata.responseTimeMs = Date.now() - startTime;

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
