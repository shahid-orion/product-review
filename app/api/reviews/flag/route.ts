import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db-mongo';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { reviewId, reason } = await request.json();

    if (!reviewId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mongoDb = await getMongoDb();
    
    await mongoDb.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { flagged: true, flagReason: reason } }
    );

    return NextResponse.json({ success: true, message: 'Review flagged for moderation' });

  } catch (error: any) {
    console.error('Error in POST /api/reviews/flag:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
