import { getMongoDb } from '@/lib/db-mongo'
import { prisma } from '@/lib/prisma'
import { FlaggedQueue } from './flagged-queue'

export default async function FlaggedReviewsPage() {
  const mongoDb = await getMongoDb()
  
  const flaggedReviews = await mongoDb.collection('reviews')
    .find({ flagged: true })
    .sort({ createdAt: -1 })
    .toArray()

  // Resolve product names
  const productIds = [...new Set(flaggedReviews.map(r => r.productId))]
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  })
  const productMap = products.reduce((acc, p) => {
    acc[p.id] = p.name
    return acc
  }, {} as Record<string, string>)

  const reviewsWithContext = flaggedReviews.map(r => ({
    _id: r._id.toString(),
    productId: r.productId,
    productName: productMap[r.productId] || 'Unknown Product',
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    flagReason: r.flagReason || 'No reason provided',
    createdAt: r.createdAt,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flagged Reviews</h1>
        <p className="text-muted-foreground mt-2">Reviews reported by the community for moderation.</p>
      </div>

      <FlaggedQueue initialReviews={reviewsWithContext} />
    </div>
  )
}
