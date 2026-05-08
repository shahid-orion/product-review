import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { Card, CardContent } from '@/components/ui/card';
import { CacheBanner } from '@/components/cache-banner';
import type { Product } from '@prisma/client';

export default async function Home() {
  const CACHE_KEY = 'all_products';
  const startTime = Date.now();

  // STEP 1: Try Redis first
  const cachedData = await redis.get(CACHE_KEY);

  let products: Product[];
  let cacheSource: 'REDIS_CACHE' | 'DATABASE_AGGREGATION';

  if (cachedData) {
    // ⚡ CACHE HIT — data served from memory
    products = JSON.parse(cachedData);
    cacheSource = 'REDIS_CACHE';
  } else {
    // 🐢 CACHE MISS — fall back to Postgres
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // STEP 2: Store in Redis for the next visitor (TTL: 30 minutes)
    await redis.setex(CACHE_KEY, 1800, JSON.stringify(products));
    cacheSource = 'DATABASE_AGGREGATION';
  }

  const responseTimeMs = Date.now() - startTime;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 font-sans p-8">
      
      {/* Hero Section */}
      {/* <main className="w-full max-w-5xl text-center space-y-8 bg-white p-12 rounded-2xl shadow-xl border border-gray-100 mb-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Enterprise Review Platform
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Welcome to your full-stack micro-architecture. This project integrates Next.js, Neon Postgres, MongoDB, Redis, and Cloudinary to demonstrate the power of the Cache-Aside pattern.
          </p>
        </div>

        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg text-left space-y-2 max-w-3xl mx-auto">
          <h3 className="font-bold text-blue-900">How to test the Redis Cache:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Click on any product below to load its profile.</li>
            <li>The first load will be <strong>Slow (Red)</strong>. Data is fetched from Postgres & Mongo.</li>
            <li>Refresh the page. The second load will be <strong>Fast (Green)</strong>!</li>
            <li>Submit a new review. The cache will invalidate and force a fresh fetch.</li>
          </ol>
        </div>
      </main> */}

      {/* THE EDUCATIONAL BANNER */}
      <div className="w-full max-w-5xl mb-8">
        <CacheBanner source={cacheSource} responseTimeMs={responseTimeMs} />
      </div>

      {/* Product Grid */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 tracking-tight text-gray-900">Featured Products</h2>
        
        {products.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-dashed">
            <p className="text-lg text-muted-foreground">No products found. Use the Admin Dashboard to add some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
                  <div className="relative aspect-square w-full bg-muted">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-blue-600 font-bold mt-1">
                      ${product.price?.toFixed(2) || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
