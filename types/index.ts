export interface Product { 
  id: string; 
  name: string; 
  description: string | null; 
  price: number | null; 
  imageUrl: string | null; 
}
export interface Review { 
  _id?: string; 
  productId: string; 
  userName: string; 
  rating: number; 
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pros?: string[];
  cons?: string[];
  brandResponse?: string;
  upvotes?: number;
  downvotes?: number;
  flagged?: boolean;
  flagReason?: string;
  createdAt: Date; 
}
export interface CachedProductProfile {
  product: Product;
  reviews: Review[];
  averageRating: string;
  reviewCount: number;
  metadata: {
    source: 'REDIS_CACHE' | 'DATABASE_AGGREGATION';
    responseTimeMs: number;
    cachedAt: string;
  }
}
