import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db-mongo';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });
    }

    const mongoDb = await getMongoDb();
    await mongoDb.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { flagged: false, flagReason: null } }
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in POST /api/admin/reviews/unflag:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
