import { Separator } from '@/components/ui/separator'
import { PostHeader } from './components/post-header'
import { PostDetailSection } from './components/post-detail-section'
import { CommentsSection } from './components/comments-section'

interface PostDetailContentProps {
  tribeId: string
  postId: string
}

export function PostDetailContent({
  tribeId,
  postId,
}: PostDetailContentProps) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          <PostHeader tribeId={tribeId} />

          <PostDetailSection tribeId={tribeId} postId={postId} />

          <Separator className='mb-6' />

          <CommentsSection tribeId={tribeId} postId={postId} />
        </div>
      </div>
    </div>
  )
}
