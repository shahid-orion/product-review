import { create } from 'zustand'

interface VoteState {
  // Map of reviewId -> { upvotes, downvotes, userVote }
  votes: Record<string, { upvotes: number; downvotes: number; userVote: 'up' | 'down' | null }>
  setInitialVotes: (reviewId: string, upvotes: number, downvotes: number) => void
  optimisticVote: (reviewId: string, direction: 'up' | 'down') => void
  setUserVote: (reviewId: string, vote: 'up' | 'down' | null) => void
}

export const useVoteStore = create<VoteState>((set) => ({
  votes: {},
  
  setInitialVotes: (reviewId, upvotes, downvotes) =>
    set((state) => ({
      votes: {
        ...state.votes,
        [reviewId]: { upvotes, downvotes, userVote: state.votes[reviewId]?.userVote ?? null },
      },
    })),

  optimisticVote: (reviewId, direction) =>
    set((state) => {
      const current = state.votes[reviewId] || { upvotes: 0, downvotes: 0, userVote: null }
      const alreadyVoted = current.userVote

      let newUpvotes = current.upvotes
      let newDownvotes = current.downvotes
      let newUserVote: 'up' | 'down' | null = direction

      // If already voted same direction, undo it
      if (alreadyVoted === direction) {
        if (direction === 'up') newUpvotes -= 1
        else newDownvotes -= 1
        newUserVote = null
      } else {
        // Remove old vote if switching
        if (alreadyVoted === 'up') newUpvotes -= 1
        if (alreadyVoted === 'down') newDownvotes -= 1
        // Apply new vote
        if (direction === 'up') newUpvotes += 1
        else newDownvotes += 1
      }

      return {
        votes: {
          ...state.votes,
          [reviewId]: { upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote },
        },
      }
    }),

  setUserVote: (reviewId, vote) =>
    set((state) => ({
      votes: {
        ...state.votes,
        [reviewId]: { ...(state.votes[reviewId] || { upvotes: 0, downvotes: 0 }), userVote: vote },
      },
    })),
}))
