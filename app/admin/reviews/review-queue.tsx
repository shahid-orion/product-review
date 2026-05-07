"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, X, Star } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PendingReview {
  _id: string
  productId: string
  productName: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export function ReviewQueue({ initialReviews }: { initialReviews: PendingReview[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id)
    
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id, action })
      })

      if (res.ok) {
        toast.success(`Review ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`)
        setReviews(prev => prev.filter(r => r._id !== id))
      } else {
        toast.error(`Failed to ${action.toLowerCase()} review`)
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setProcessingId(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-dashed mt-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Inbox Zero!</h3>
        <p className="text-muted-foreground mt-2">All pending reviews have been moderated.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-8">
      <AnimatePresence mode="popLayout">
        {reviews.map((review) => (
          <motion.div
            key={review._id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
          >
            <Card className="border-border/50 shadow-sm overflow-hidden group">
              <CardContent className="p-0 flex flex-col md:flex-row">
                
                {/* Review Info */}
                <div className="p-6 flex-1 space-y-3 border-b md:border-b-0 md:border-r border-border/50 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">{review.userName}</span>
                      <span className="text-muted-foreground mx-2">on</span>
                      <span className="font-medium bg-muted px-2 py-1 rounded-md text-sm">{review.productName}</span>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`w-4 h-4 ${idx < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground italic bg-muted/30 p-3 rounded-lg border">"{review.comment}"</p>
                </div>

                {/* Actions */}
                <div className="p-6 md:w-64 bg-slate-50 flex flex-row md:flex-col gap-3 justify-center">
                  <Button 
                    size="lg"
                    disabled={processingId === review._id}
                    onClick={() => handleAction(review._id, 'APPROVE')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Check className="w-5 h-5 mr-2" /> Approve
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    disabled={processingId === review._id}
                    onClick={() => handleAction(review._id, 'REJECT')}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <X className="w-5 h-5 mr-2" /> Reject
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
