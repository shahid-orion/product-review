import { prisma } from '@/lib/prisma'
import { getMongoDb } from '@/lib/db-mongo'
import { notFound } from 'next/navigation'
import { Star, MessageSquare, ThumbsUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  if (!user) return notFound()

  // Fetch reviews by this user from MongoDB (match by name since reviews store userName)
  const mongoDb = await getMongoDb()
  const reviews = await mongoDb.collection('reviews')
    .find({ userName: user.name })
    .sort({ createdAt: -1 })
    .toArray()

  const approvedReviews = reviews.filter(r => r.status === 'APPROVED')
  const totalUpvotes = reviews.reduce((acc, r) => acc + (r.upvotes || 0), 0)
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-muted/10 py-12">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">

        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-primary/20">
            {user.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
              <span className="text-xs text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold">{approvedReviews.length}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6 text-center">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-bold">{avgRating}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6 text-center">
              <ThumbsUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold">{totalUpvotes}</div>
              <div className="text-sm text-muted-foreground">Helpfulness</div>
            </CardContent>
          </Card>
        </div>

        {/* Review History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Review History</h2>
          {approvedReviews.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-xl border border-dashed">
              <p className="text-muted-foreground">No approved reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <Card key={review._id.toString()} className="border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-4 h-4 ${idx < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">{review.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">"{review.comment}"</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>👍 {review.upvotes || 0}</span>
                      <span>👎 {review.downvotes || 0}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
