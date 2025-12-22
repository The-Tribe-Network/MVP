import type { AlbumWithMedia } from "@/lib/database/types"
import type { CarouselPhoto } from "@/lib/stores/dialog-store"

/**
 * Transform album media to the photo format expected by the UI components
 */
export function transformAlbumMediaToPhotos(album: AlbumWithMedia): CarouselPhoto[] {
  return album.media?.map((media) => ({
    id: media.id,
    url: media.fileUrl,
    caption: media.altText || '',
    likes: 0, // TODO: Add likeCount to media query in getAlbumById
    comments: 0, // TODO: Add commentCount to media
    date: new Date(media.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  })) || []
}

