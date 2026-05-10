"use client";

import React, { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import { CachedProductProfile } from '@/types';
import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShieldCheck, Zap, Truck, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CacheBanner } from '@/components/cache-banner';
import { ReviewForm } from '@/components/review-form';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { ReviewCard } from '@/components/review-card';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<CachedProductProfile | { error: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate a stable anonymous session ID for vote deduplication
  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    let sid = localStorage.getItem('anon_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('anon_session_id', sid);
    }
    return sid;
  }, []);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  if (loading && !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!profile || 'error' in profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-destructive">Product Not Found</h1>
    </div>
  );

  const isCache = profile.metadata.source === 'REDIS_CACHE';
  const averageRating = profile.averageRating || '0.0';
  const reviewCount = profile.reviewCount || 0;

  return (
    <div className="min-h-screen bg-muted/10 pb-20 relative">
      
      {/* STICKY SUMMARY BAR */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b shadow-sm hidden md:block">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-bold truncate max-w-[200px]">{profile.product.name}</div>
            <div className="flex items-center text-yellow-500 text-sm font-medium">
              <Star className="w-4 h-4 fill-yellow-500 mr-1" />
              {averageRating} ({reviewCount})
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xl font-bold text-primary">
              ${profile.product.price ? profile.product.price.toFixed(2) : 'N/A'}
            </div>
            <Button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>
              Write a Review
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 pt-8 space-y-12">
        
        {/* BREADCRUMBS & SEO */}
        <BreadcrumbNav productName={profile.product.name} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: profile.product.name,
              image: profile.product.imageUrl,
              description: profile.product.description,
              offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: profile.product.price,
                availability: "https://schema.org/InStock",
              },
              aggregateRating: reviewCount > 0 ? {
                "@type": "AggregateRating",
                ratingValue: averageRating,
                reviewCount: reviewCount,
              } : undefined
            })
          }}
        />

        {/* THE EDUCATIONAL BANNER */}
        <CacheBanner source={profile.metadata.source} responseTimeMs={profile.metadata.responseTimeMs} />

        {/* HERO SECTION */}
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-white border shadow-sm group"
          >
            <img 
              src={profile.product.imageUrl || 'https://via.placeholder.com/600'} 
              alt={profile.product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Premium Quality</Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {profile.product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-yellow-500 mr-1" />
                  <span className="font-bold">{averageRating}</span>
                </div>
                <span>•</span>
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                  {reviewCount} reviews
                </span>
              </div>
            </div>

            <div className="text-4xl font-black text-primary">
              ${profile.product.price ? profile.product.price.toFixed(2) : 'N/A'}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {profile.product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShieldCheck className="w-5 h-5" /></div>
                <div className="text-sm font-medium">1 Year Warranty</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Truck className="w-5 h-5" /></div>
                <div className="text-sm font-medium">Free Shipping</div>
              </div>
            </div>

            <div className="pt-4">
              <Button size="lg" className="w-full text-lg h-14 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Add to Cart
              </Button>
              <Link
                href={`/products/compare?a=${id}`}
                className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Compare with another product
              </Link>
            </div>
          </motion.div>
        </div>

        {/* SPECS & DETAILS (Placeholder for future data) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-12"
        >
          <Card className="border-border/50 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Product Specifications</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Manufacturer</span><span className="font-medium">Premium Brand Inc.</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Model Name</span><span className="font-medium">{profile.product.name}</span></div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Condition</span><span className="font-medium">New</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Release Year</span><span className="font-medium">2024</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* REVIEWS SECTION */}
        <div id="reviews" className="pt-12 scroll-mt-24">
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Reviews List */}
            <div className="md:col-span-2 space-y-8">
              <h3 className="text-3xl font-bold tracking-tight">Customer Reviews</h3>
              {reviewCount === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed">
                  <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-medium">No reviews yet.</p>
                  <p className="text-muted-foreground">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {profile.reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} sessionId={sessionId} />
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Review Form */}
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <ReviewForm productId={id as string} onSuccess={fetchProductData} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
