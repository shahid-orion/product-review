import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  // 1. Create a hash of the query for the Redis key
  const normalizedQuery = query.trim().toLowerCase();
  const queryHash = crypto.createHash('md5').update(normalizedQuery).digest('hex');
  const cacheKey = `search:${queryHash}`;

  try {
    const startTime = Date.now();

    // 2. TRY CACHE FIRST
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const results = JSON.parse(cachedData);
      return NextResponse.json({ 
        results, 
        metadata: { 
          source: 'REDIS_CACHE', 
          responseTimeMs: Date.now() - startTime 
        } 
      });
    }

    // 3. CACHE MISS! Fetch from Postgres using Prisma contains
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        brand: { select: { name: true } }
      },
      take: 5 // Limit to top 5 results for the dropdown
    });

    // 4. Save to Redis
    // Cache search results for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(products));

    return NextResponse.json({ 
      results: products, 
      metadata: { 
        source: 'POSTGRES_SEARCH', 
        responseTimeMs: Date.now() - startTime 
      } 
    });

  } catch (error) {
    console.error('Error in GET /api/search:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
