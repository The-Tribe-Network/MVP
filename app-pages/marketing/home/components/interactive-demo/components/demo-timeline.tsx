'use client'

import { useDemoContext } from '../demo-context'
import { DemoPostCard } from './demo-post-card'

export function DemoTimeline() {
  const { activeTribe, togglePostLike, getPostLikeState } = useDemoContext()

  return (
    <div className="divide-y divide-border/50">
        {activeTribe.posts.map((post) => {
          const likeState = getPostLikeState(post.id)
          return (
            <DemoPostCard
              key={post.id}
              post={post}
              isLiked={likeState.isLiked}
              likeCount={likeState.likeCount}
              onLike={() => togglePostLike(post.id)}
            />
          )
        })}
    </div>
  )
}
