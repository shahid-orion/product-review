import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db-mongo';
import { redis } from '@/lib/redis';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { reviewId, direction, sessionId } = await request.json();

    if (!reviewId || !direction || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    // Redis Sets: track which users have voted on which reviews
    const upKey = `review:${reviewId}:upvotes`;
    const downKey = `review:${reviewId}:downvotes`;

    // Check if user already voted
    const hasUpvoted = await redis.sismember(upKey, sessionId);
    const hasDownvoted = await redis.sismember(downKey, sessionId);

    const mongoDb = await getMongoDb();
    const oid = new ObjectId(reviewId);

    if (direction === 'up') {
      if (hasUpvoted) {
        // Undo upvote
        await redis.srem(upKey, sessionId);
        await mongoDb.collection('reviews').updateOne({ _id: oid }, { $inc: { upvotes: -1 } });
        return NextResponse.json({ action: 'removed', direction: 'up' });
      } else {
        // If they had downvoted, remove that first
        if (hasDownvoted) {
          await redis.srem(downKey, sessionId);
          await mongoDb.collection('reviews').updateOne({ _id: oid }, { $inc: { downvotes: -1 } });
        }
        await redis.sadd(upKey, sessionId);
        await mongoDb.collection('reviews').updateOne({ _id: oid }, { $inc: { upvotes: 1 } });
        return NextResponse.json({ action: 'added', direction: 'up' });
      }
    } else {
      if (hasDownvoted) {
        // Undo downvote
        await redis.srem(downKey, sessionId);
        await mongoDb.collection('reviews').updateOne({ _id: oid }, { $inc: { downvotes: -1 } });
        return NextResponse.json({ action: 'removed', direction: 'down' });
      } else {
        // If they had upvoted, remove that first
        if (hasUpvoted) {
          await redis.srem(upKey, sessionId);
          await mongoDb.collection('reviews').updateOne({ _id: oid }, { $inc: { upvotes: -1 } });
        }
        await redis.sadd(downKey, sessionId);
        await mongoDb.collection('reviews').updateOne({ _id: oid }, { $inc: { downvotes: 1 } });
        return NextResponse.json({ action: 'added', direction: 'down' });
      }
    }

  } catch (error: any) {
    console.error('Error in POST /api/reviews/vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
