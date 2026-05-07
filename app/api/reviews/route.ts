import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db-mongo';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
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
