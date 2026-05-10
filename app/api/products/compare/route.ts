import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const a = searchParams.get('a');
  const b = searchParams.get('b');

  if (!a || !b) {
    return NextResponse.json({ error: 'Provide ?a=<id>&b=<id>' }, { status: 400 });
  }
  if (a === b) {
    return NextResponse.json({ error: 'Choose two different products' }, { status: 400 });
  }

  try {
    const [productA, productB] = await Promise.all([
      prisma.product.findUnique({ where: { id: a } }),
      prisma.product.findUnique({ where: { id: b } }),
    ]);

    if (!productA || !productB) {
      return NextResponse.json({ error: 'One or both products not found' }, { status: 404 });
    }

    // Fetch Redis stats for both
    const [statsA, statsB] = await Promise.all([
      redis.hgetall(`product:stats:${a}`),
      redis.hgetall(`product:stats:${b}`),
    ]);

    const buildStats = (stats: Record<string, string>) => {
      const totalRating = parseInt(stats.totalRating || '0', 10);
      const reviewCount = parseInt(stats.reviewCount || '0', 10);
      return {
        averageRating: reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '0.0',
        reviewCount,
      };
    };

    return NextResponse.json({
      a: { ...productA, ...buildStats(statsA) },
      b: { ...productB, ...buildStats(statsB) },
    });
  } catch (error) {
    console.error('Error in GET /api/products/compare:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
