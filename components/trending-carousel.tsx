"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface TrendingProduct {
  id: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  slug: string;
  averageRating: string;
  reviewCount: number;
}

export function TrendingCarousel() {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full max-w-5xl mb-10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trending This Week</h2>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
          🔥 Hot
        </Badge>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-48 h-64 rounded-xl bg-gray-200 animate-pulse"
              />
            ))
          : products.map((product, idx) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="snap-start shrink-0 group"
              >
                <Card className="w-48 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
                  <div className="relative aspect-square w-full bg-muted">
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        #1
                      </span>
                    )}
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
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-end justify-between gap-2">
                        <div className='min-w-0'>
                    <p className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-blue-600 font-bold text-sm mt-0.5">
                      ${product.price?.toFixed(2) ?? "N/A"}
                    </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {product.averageRating}
                      </span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground">
                        {product.reviewCount} reviews
                      </span>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </section>
  );
}
