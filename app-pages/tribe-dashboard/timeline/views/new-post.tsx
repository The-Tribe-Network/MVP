import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Smile, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useCreatePost } from "@/lib/hooks/use-posts";
import { useDeleteMedia, useUploadPostImage } from "@/lib/hooks/use-upload";
import { toast } from "sonner";
import { validateImageFile } from "@/lib/utils/image";
import { User } from "better-auth";
import { useAuth } from "@/lib/providers/auth-provider";

interface NewPostProps {
  tribeId: string;
  onViewChange: (view: "posts" | "new post") => void;
};

export function NewPost({ tribeId, onViewChange }: NewPostProps) {
  const [newPost, setNewPost] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth();

  const createPostMutation = useCreatePost()
  const deleteMediaMutation = useDeleteMedia()
  const uploadImageMutation = useUploadPostImage()

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file')
      return
    }

    // Delete previous image if one exists
    const previousImageId = uploadedImageId
    if (previousImageId) {
      try {
        await deleteMediaMutation.mutateAsync(previousImageId)
      } catch (error) {
        console.error('Failed to delete previous image:', error)
        // Continue with upload even if deletion fails
      }
    }

    setIsUploadingImage(true)
    try {
      const result = await uploadImageMutation.mutateAsync({
        file,
        tribeId,
        postId: null,
      })
      setUploadedImageId(result.id)
      setImagePreview(result.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImageId) {
      try {
        await deleteMediaMutation.mutateAsync(uploadedImageId)
        toast.success('Image removed successfully')
      } catch (error) {
        console.error('Failed to delete image:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to remove image')
        // Continue to clear local state even if deletion fails
      }
    }
    setUploadedImageId(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handlePost = async () => {
    if (!newPost.trim() || !user) return

    try {
      await createPostMutation.mutateAsync({
        tribeId,
        data: {
          content: newPost.trim(),
          mediaId: uploadedImageId || null,
        },
      })
      setNewPost('')
      setUploadedImageId(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onViewChange("posts")
    } catch (error) {
      console.error('Failed to create post:', error)
      // Error handling could be improved with toast notifications
    }
  }

  return (
    <div className="pt-6">
      <div className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="min-h-[100px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
          disabled={createPostMutation.isPending}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto object-contain max-h-[400px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleRemoveImage}
              disabled={isUploadingImage || createPostMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleImageClick}
              disabled={isUploadingImage || createPostMutation.isPending}
            >
              {isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handlePost}
            disabled={!newPost.trim() || createPostMutation.isPending || isUploadingImage}
          >
            {createPostMutation.isPending ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  )
}