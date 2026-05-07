import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db-mongo';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // 1. Auth & RBAC Check (Must be an Admin to moderate reviews)
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { reviewId, action } = await request.json();

    if (!reviewId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const mongoDb = await getMongoDb();
    
    // Find the review to get the productId and rating before updating
    const review = await mongoDb.collection('reviews').findOne({ _id: new ObjectId(reviewId) });
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // 2. Update status in MongoDB
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await mongoDb.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { status: newStatus } }
    );

    // 3. Advanced Redis Stats & Cache Invalidation
    if (action === 'APPROVE') {
      const statsKey = `product:stats:${review.productId}`;
      
      // HINCRBY automatically creates the hash and field if it doesn't exist
      await redis.hincrby(statsKey, 'totalRating', review.rating);
      await redis.hincrby(statsKey, 'reviewCount', 1);

      // Invalidate the full product profile cache so the new review appears on the UI!
      await redis.del(`product_profile:${review.productId}`);
    }

    return NextResponse.json({ success: true, status: newStatus });

  } catch (error: any) {
    console.error('Error in POST /api/admin/reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
