import { NextResponse } from 'next/server';
import { redis, getProductStats } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const weeklyKey = `trending:products:${now.getFullYear()}-${String(weekNum).padStart(2, '0')}`;

    // Get top 8 product IDs by view score (highest first)
    const entries = await redis.zrevrangebyscore(weeklyKey, '+inf', '-inf', 'WITHSCORES', 'LIMIT', 0, 8);

    if (!entries.length) {
      return NextResponse.json({ products: [] });
    }

    // entries is [id, score, id, score, ...]
    const ids: string[] = [];
    const scoreMap: Record<string, number> = {};
    for (let i = 0; i < entries.length; i += 2) {
      ids.push(entries[i]);
      scoreMap[entries[i]] = parseInt(entries[i + 1], 10);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, price: true, imageUrl: true, slug: true },
    });

    // Re-sort by score, then attach rating stats
    const sorted = products.sort((a, b) => (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0));
    const statsMap = await getProductStats(sorted.map((p) => p.id));

    const withStats = sorted.map((p) => ({
      ...p,
      averageRating: statsMap[p.id]?.averageRating ?? '0.0',
      reviewCount: statsMap[p.id]?.reviewCount ?? 0,
    }));

    return NextResponse.json({ products: withStats });
  } catch (error) {
    console.error('Error in GET /api/trending:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
