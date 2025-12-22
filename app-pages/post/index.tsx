import { Separator } from '@/components/ui/separator'
import { PostDetailPageStoreProvider } from './components/store-provider'
import { PostHeader } from './components/post-header'
import { PostDetailSection } from './components/post-detail-section'
import { CommentsSection } from './components/comments-section'
import { PostDetailDialogContainer } from './components/dialogs/dialog-container'

interface PostDetailContentProps {
  tribeId: string
  postId: string
}

export function PostDetailContent({
  tribeId,
  postId,
}: PostDetailContentProps) {
  return (
    <PostDetailPageStoreProvider>
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <PostHeader />

            <PostDetailSection tribeId={tribeId} postId={postId} />

            <Separator className='mb-6' />

            <CommentsSection tribeId={tribeId} postId={postId} />
          </div>
        </div>
      </div>

      <PostDetailDialogContainer />
    </PostDetailPageStoreProvider>
  )
}
