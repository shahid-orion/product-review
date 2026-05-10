"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReviewFormProps {
  productId: string
  onSuccess: () => void
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const [userName, setUserName] = useState("")
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error("Please select a star rating!")
      return
    }

    setSubmitting(true)
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userName,
          rating,
          comment
        })
      })

      if (res.ok) {
        setUserName("")
        setComment("")
        setRating(0)
        toast.success("Review submitted! It is currently PENDING moderation.")
        onSuccess()
      } else {
        const data = await res.json()
        if (res.status === 429) {
          toast.error(data.error || "Too many reviews. Please wait before submitting again.", {
            duration: 6000,
          })
        } else {
          toast.error(data.error || "Failed to submit review")
        }
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6">Write a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) 
                        ? 'fill-yellow-500 text-yellow-500' 
                        : 'fill-muted text-muted'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-xs text-muted-foreground font-medium pt-1">You selected {rating} stars</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Name</Label>
            <Input 
              id="userName"
              required 
              type="text" 
              value={userName} 
              onChange={e => setUserName(e.target.value)}
              placeholder="Your name"
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea 
              id="comment"
              required 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              className="h-32 resize-none"
              placeholder="What did you think?"
              disabled={submitting}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full h-12 text-md rounded-xl"
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Reviews are subject to moderation before appearing publicly.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
