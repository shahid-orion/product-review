import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMongoDb } from '@/lib/db-mongo';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const mongoDb = await getMongoDb();

    const [totalProducts, totalUsers, totalReviews, pendingReviews] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      mongoDb.collection('reviews').countDocuments(),
      mongoDb.collection('reviews').countDocuments({ status: 'PENDING' }),
    ]);

    return NextResponse.json({ totalProducts, totalUsers, totalReviews, pendingReviews });
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
