import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { redis, getProductStats } from '@/lib/redis';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight } from 'lucide-react';
import type { Product, Category, Brand } from '@prisma/client';

type ProductWithRelations = Product & { category: Category; brand: Brand };

export default async function ProductsPage() {
  const CACHE_KEY = 'all_products_full';

  let products: ProductWithRelations[];

  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    products = JSON.parse(cached);
  } else {
    products = await prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { name: 'asc' },
    });
    await redis.setex(CACHE_KEY, 1800, JSON.stringify(products));
  }

  // Collect unique categories for the filter strip
  const categories = Array.from(
    new Map(products.map((p) => [p.category.id, p.category])).values()
  );

  // Fetch rating stats for all products in parallel
  const statsMap = await getProductStats(products.map((p) => p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">All Products</h1>
            <p className="text-muted-foreground mt-1">{products.length} products available</p>
          </div>
          <Link
            href="/products/compare"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-4 py-2 bg-white hover:bg-blue-50 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Compare Products
          </Link>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat.id} variant="secondary" className="text-xs px-3 py-1">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-xl border border-dashed">
            <p className="text-lg text-muted-foreground">
              No products found. Use the Admin Dashboard to add some!
            </p>
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
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                        No Image
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 text-xs bg-white/90 text-gray-700 border">
                      {product.category.name}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-end justify-between gap-2">
                        <div className='min-w-0'>
                        <p className="text-xs text-muted-foreground mb-1">{product.brand.name}</p>
                    <h3 className="font-semibold text-base truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-blue-600 font-bold mt-1">
                      ${product.price?.toFixed(2) ?? 'N/A'}
                    </p>
                        </div>
                    
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {statsMap[product.id]?.averageRating ?? '0.0'}
                      </span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-xs text-muted-foreground">
                        {statsMap[product.id]?.reviewCount ?? 0} reviews
                      </span>
                    </div>
                    </div>
                    
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
