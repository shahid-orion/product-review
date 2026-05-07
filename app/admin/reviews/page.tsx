import { getMongoDb } from '@/lib/db-mongo';
import { prisma } from '@/lib/prisma';
import { ReviewQueue } from './review-queue';

export default async function AdminReviewsPage() {
  const mongoDb = await getMongoDb();
  
  // Fetch pending reviews
  const pendingReviews = await mongoDb.collection('reviews')
    .find({ status: 'PENDING' })
    .sort({ createdAt: 1 }) // Oldest first
    .toArray();

  // We only have productIds. Let's fetch the product names from Postgres for better UI
  const productIds = [...new Set(pendingReviews.map(r => r.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  });
  
  const productMap = products.reduce((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {} as Record<string, string>);

  const reviewsWithContext = pendingReviews.map(r => ({
    _id: r._id.toString(),
    productId: r.productId,
    productName: productMap[r.productId] || 'Unknown Product',
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
        <p className="text-muted-foreground mt-2">Approve or reject pending customer reviews.</p>
      </div>

      <ReviewQueue initialReviews={reviewsWithContext} />
    </div>
  );
}
