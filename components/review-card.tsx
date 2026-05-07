"use client"

import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown, Flag, MoreVertical } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { useVoteStore } from "@/lib/vote-store"
import { Button } from "@/components/ui/button"
import { Review } from "@/types"

interface ReviewCardProps {
  review: Review
  sessionId: string
}

export function ReviewCard({ review, sessionId }: ReviewCardProps) {
  const { votes, setInitialVotes, optimisticVote } = useVoteStore()
  const [showReportMenu, setShowReportMenu] = useState(false)
  const [flagging, setFlagging] = useState(false)

  const reviewId = review._id!
  const voteData = votes[reviewId] || { upvotes: 0, downvotes: 0, userVote: null }

  // Initialize votes from review data
  useEffect(() => {
    setInitialVotes(reviewId, review.upvotes || 0, review.downvotes || 0)
  }, [reviewId, review.upvotes, review.downvotes, setInitialVotes])

  const handleVote = async (direction: 'up' | 'down') => {
    // Optimistic UI update via Zustand
    optimisticVote(reviewId, direction)

    try {
      await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, direction, sessionId })
      })
    } catch {
      // Revert on failure
      optimisticVote(reviewId, direction)
      toast.error('Failed to register vote')
    }
  }

  const handleFlag = async (reason: string) => {
    setFlagging(true)
    setShowReportMenu(false)
    try {
      const res = await fetch('/api/reviews/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason })
      })
      if (res.ok) {
        toast.success('Review has been flagged for moderator review.')
      } else {
        toast.error('Failed to flag review')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setFlagging(false)
    }
  }

  const flagReasons = [
    'Spam or fake review',
    'Inappropriate content',
    'Conflict of interest',
    'Off-topic',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-border/50"
    >
      {/* Header: Avatar, Name, Stars */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-foreground">{review.userName}</div>
            <div className="text-xs text-muted-foreground">Verified Purchaser</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, idx) => (
              <svg
                key={idx}
                className={`w-4 h-4 ${idx < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`}
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>

          {/* Report dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              disabled={flagging}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showReportMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 w-56 bg-background border rounded-lg shadow-lg z-20 py-1"
              >
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-3 h-3" /> Report Review
                </div>
                {flagReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleFlag(reason)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-muted-foreground leading-relaxed mb-4">"{review.comment}"</p>

      {/* Vote Buttons */}
      <div className="flex items-center gap-4 pt-3 border-t border-border/30">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('up')}
          className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1.5 transition-colors ${
            voteData.userVote === 'up'
              ? 'bg-green-100 text-green-700'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{voteData.upvotes}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('down')}
          className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1.5 transition-colors ${
            voteData.userVote === 'down'
              ? 'bg-red-100 text-red-700'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span>{voteData.downvotes}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
