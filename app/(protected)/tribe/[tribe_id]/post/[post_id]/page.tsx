import { PostHeader } from '@/app-pages/post/post-header'
import { PostDetailCard, PostDetail } from '@/app-pages/post/post-detail-card'
import { PostActions } from '@/app-pages/post/post-actions'
import { CommentsSection } from '@/app-pages/post/comments-section'
import { Comment } from '@/app-pages/post/comment-item'

interface PostDetailPageProps {
  params: Promise<{ post_id: string; tribe_id: string }>
}

// TODO: Replace with actual data fetching from database
async function getPostData(postId: string): Promise<{
  post: PostDetail
  initialLikes: number
  initialIsLiked: boolean
  initialComments: Comment[]
}> {
  // Mock data - in real app, fetch from database
  return {
    post: {
      id: postId,
      author: {
        name: 'Sarah Mitchell',
        username: '@sarah',
        avatar: '/diverse-woman-avatar.png'
      },
      content: 'Just finished an amazing hike with the crew! The views were absolutely breathtaking. Can\'t wait for our next adventure 🏔️',
      timestamp: '2 hours ago',
      image: '/summer-party.png'
    },
    initialLikes: 12,
    initialIsLiked: false,
    initialComments: [
      {
        id: '1',
        author: {
          name: 'Alex Chen',
          username: '@alex',
          avatar: '/man-avatar.png'
        },
        content: 'Looks amazing! Wish I could have joined you guys.',
        timestamp: '1h ago',
        likes: 5
      },
      {
        id: '2',
        author: {
          name: 'Maya Patel',
          username: '@maya',
          avatar: '/woman-avatar-2.png'
        },
        content: 'These photos are incredible! Where was this?',
        timestamp: '45m ago',
        likes: 3
      },
      {
        id: '3',
        author: {
          name: 'Jordan Lee',
          username: '@jordan',
          avatar: '/diverse-user-avatars.png'
        },
        content: 'Count me in for the next one!',
        timestamp: '30m ago',
        likes: 2
      }
    ]
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id, tribe_id } = await params
  const { post, initialLikes, initialIsLiked, initialComments } = await getPostData(post_id)

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <PostHeader />

          <PostDetailCard post={post}>
            <PostActions
              initialLikes={initialLikes}
              initialIsLiked={initialIsLiked}
              commentsCount={initialComments.length}
            />
          </PostDetailCard>

          <CommentsSection initialComments={initialComments} />
        </div>
      </div>
    </div>
  )
}
